import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Marcar como dinâmico para evitar erro de renderização estática
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Lista de produtos é obrigatória' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        await tx.transferProduct.update({
          where: { id: product.id },
          data: {
            confirmedQty: product.confirmedQty,
            isConfirmed: product.isConfirmed
          }
        })
      }

      await tx.transfer.update({
        where: { id: params.id },
        data: {
          status: 'confirmed',
          confirmedAt: new Date()
        }
      })
    })

    const updatedTransfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(updatedTransfer)
  } catch (error) {
    console.error('Erro ao confirmar transferência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}