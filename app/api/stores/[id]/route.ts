import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/stores/[id] - Buscar loja específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: params.id }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/stores/[id] - Atualizar loja
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, blingApiKey, isActive } = body

    if (!name || !blingApiKey) {
      return NextResponse.json(
        { error: 'Nome e chave da API são obrigatórios' },
        { status: 400 }
      )
    }

    const updatedStore = await prisma.store.update({
      where: { id: params.id },
      data: {
        name,
        blingApiKey,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(updatedStore)
  } catch (error: any) {
    console.error('Erro ao atualizar loja:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma loja com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/stores/[id] - Excluir loja
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

    // Verificar se a loja tem transferências associadas
    const transfersCount = await prisma.transfer.count({
      where: { storeId: params.id }
    })

    if (transfersCount > 0 && !force) {
      return NextResponse.json(
        { 
          error: `A loja possui ${transfersCount} transferência(s) associada(s).`,
          canForceDelete: true,
          transfersCount 
        },
        { status: 400 }
      )
    }

    // Se force=true, excluir as transferências primeiro
    if (force && transfersCount > 0) {
      // Excluir produtos das transferências primeiro
      await prisma.transferProduct.deleteMany({
        where: {
          transfer: {
            storeId: params.id
          }
        }
      })

      // Excluir as transferências
      await prisma.transfer.deleteMany({
        where: { storeId: params.id }
      })
    }

    await prisma.store.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: force && transfersCount > 0 
        ? `Loja e ${transfersCount} transferência(s) excluídas com sucesso` 
        : 'Loja excluída com sucesso' 
    })
  } catch (error: any) {
    console.error('Erro ao excluir loja:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}