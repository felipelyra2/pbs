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

    await prisma.transfer.update({
      where: { id: params.id },
      data: {
        status: 'completed'
      }
    })

    return NextResponse.json({
      message: 'Entrada lançada no Bling com sucesso',
      blingResponse
    })
  } catch (error) {
    console.error('Erro ao lançar no Bling:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}