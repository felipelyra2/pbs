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
    // Verificar se a loja tem transferências associadas
    const transfersCount = await prisma.transfer.count({
      where: { storeId: params.id }
    })

    if (transfersCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir a loja. Ela possui ${transfersCount} transferência(s) associada(s).` },
        { status: 400 }
      )
    }

    await prisma.store.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Loja excluída com sucesso' })
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