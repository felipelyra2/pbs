import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BlingAPI } from '@/lib/bling-api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: {
        products: {
          where: { isConfirmed: true },
          include: {
            product: true
          }
        },
        store: true
      }
    })

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transferência não encontrada' },
        { status: 404 }
      )
    }

    if (transfer.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Transferência deve estar confirmada para ser lançada' },
        { status: 400 }
      )
    }

    const blingApiKey = transfer.store.blingApiKey
    if (!blingApiKey) {
      return NextResponse.json(
        { error: 'Chave da API do Bling não configurada para esta loja' },
        { status: 500 }
      )
    }

    const blingAPI = new BlingAPI(blingApiKey)

    // Validar se há produtos confirmados
    if (transfer.products.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum produto confirmado para lançar no Bling' },
        { status: 400 }
      )
    }

    // Validar códigos dos produtos
    const invalidProducts = transfer.products.filter(p => 
      !p.product.code && !p.product.blingId
    )
    
    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { error: `Produtos sem código no Bling: ${invalidProducts.map(p => p.product.name).join(', ')}` },
        { status: 400 }
      )
    }

    const entryData = {
      numero: `TRANS-${transfer.invoiceId}`,
      data: new Date().toISOString().split('T')[0],
      fornecedor: {
        nome: 'Transferência entre lojas'
      },
      itens: transfer.products.map(product => ({
        codigo: product.product.code || product.product.blingId,
        descricao: product.product.name,
        quantidade: product.confirmedQty,
        valorUnidade: product.unitPrice,
        valorTotal: product.confirmedQty * product.unitPrice,
        unidade: product.product.unit || 'UN'
      })),
      observacoes: `Transferência automática - Nota original: ${transfer.invoiceId}`
    }

    const blingResponse = await blingAPI.createEntry(entryData)

    // Atualizar status da transferência
    await prisma.transfer.update({
      where: { id: params.id },
      data: {
        status: 'completed'
      }
    })

    // Preparar relatório detalhado
    const produtosSucesso = blingResponse.results.filter((r: any) => r.success)
    const produtosErro = blingResponse.results.filter((r: any) => !r.success)

    const relatorio = {
      resumo: {
        totalProdutos: blingResponse.totalProcessados,
        sucessos: blingResponse.sucessos,
        erros: blingResponse.erros,
        status: blingResponse.erros === 0 ? 'Todos os produtos transferidos com sucesso' : 
                blingResponse.sucessos === 0 ? 'Falha em todos os produtos' : 
                'Transferência parcial - alguns produtos com erro'
      },
      produtosSucesso: produtosSucesso.map((p: any) => ({
        codigo: p.produto,
        nome: transfer.products.find(tp => 
          (tp.product.code || tp.product.blingId) === p.produto
        )?.product.name || 'N/A',
        quantidade: transfer.products.find(tp => 
          (tp.product.code || tp.product.blingId) === p.produto
        )?.confirmedQty || 0,
        status: 'Transferido com sucesso'
      })),
      produtosErro: produtosErro.map((p: any) => ({
        codigo: p.produto,
        nome: transfer.products.find(tp => 
          (tp.product.code || tp.product.blingId) === p.produto
        )?.product.name || 'N/A',
        quantidade: transfer.products.find(tp => 
          (tp.product.code || tp.product.blingId) === p.produto
        )?.confirmedQty || 0,
        erro: p.erro,
        status: 'Erro na transferência'
      }))
    }

    // Verificar se há aviso sobre API descontinuada
    const avisoAPI = blingResponse.aviso ? {
      aviso: blingResponse.aviso,
      acaoNecessaria: blingResponse.acaoNecessaria
    } : {}

    return NextResponse.json({
      message: blingResponse.aviso ? 
        `${relatorio.resumo.status} - ATENÇÃO: ${blingResponse.aviso}` : 
        relatorio.resumo.status,
      relatorio,
      blingResponse,
      ...avisoAPI
    })
  } catch (error: any) {
    console.error('Erro ao lançar no Bling:', error)
    
    // Extrair mensagem de erro mais específica
    let errorMessage = 'Erro interno do servidor'
    if (error.message && error.message.includes('Bling')) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}