import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BlingAPIv3 } from '@/lib/bling-api-v3'

// Marcar como dinâmico para evitar erro de renderização estática
export const dynamic = 'force-dynamic'

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

    console.log('🔐 Token da loja:', blingApiKey?.substring(0, 20) + '...')
    console.log('🏪 Nome da loja:', transfer.store.name)
    console.log('🔄 USANDO API V3 - VERSÃO CORRIGIDA')

    const blingAPI = new BlingAPIv3(blingApiKey)

    // Remover validação do token - deixar que o erro real apareça na movimentação
    console.log('🔄 Pulando validação do token - tentando movimentação direta')

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

    // Criar movimentações de estoque para API v3
    const movements = transfer.products.map(product => ({
      produto: {
        codigo: product.product.code || product.product.blingId
      },
      quantidade: product.confirmedQty,
      tipo: 'E' as const, // Entrada
      observacoes: `Transferência automática - Nota: ${transfer.invoiceId} - ${product.product.name}`
    }))

    console.log('📦 Movimentações a serem criadas:', JSON.stringify(movements, null, 2))

    const blingResponse = await blingAPI.createStockMovement(movements)
    
    console.log('🔄 Resposta do Bling:', JSON.stringify(blingResponse, null, 2))

    // Atualizar status da transferência
    await prisma.transfer.update({
      where: { id: params.id },
      data: {
        status: 'completed'
      }
    })

    // Preparar relatório detalhado para API v3
    const produtosSucesso = blingResponse.results?.filter((r: any) => r.success) || []
    const produtosErro = blingResponse.results?.filter((r: any) => !r.success) || []

    const relatorio = {
      resumo: {
        totalProdutos: blingResponse.totalProcessados || 0,
        sucessos: blingResponse.sucessos || 0,
        erros: blingResponse.erros || 0,
        status: (blingResponse.erros || 0) === 0 ? 'Todos os produtos transferidos com sucesso' : 
                (blingResponse.sucessos || 0) === 0 ? 'Falha em todos os produtos' : 
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
        status: 'Movimentação criada com sucesso'
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
        status: 'Erro na movimentação'
      }))
    }

    return NextResponse.json({
      message: relatorio.resumo.status,
      relatorio,
      blingResponse,
      apiVersion: 'v3'
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