import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Erro ao buscar lojas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, blingApiKey } = await request.json()

    if (!name || !blingApiKey) {
      return NextResponse.json(
        { error: 'Nome e chave da API são obrigatórios' },
        { status: 400 }
      )
    }

    const store = await prisma.store.create({
      data: {
        name,
        blingApiKey
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}