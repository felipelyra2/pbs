import { NextRequest, NextResponse } from 'next/server'
import { BlingScraper } from '@/lib/bling-scraper'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { url, userId, storeId } = await request.json()

    if (!url || !userId || !storeId) {
      return NextResponse.json(
        { error: 'URL, userId e storeId são obrigatórios' },
        { status: 400 }
      )
    }

    if (!BlingScraper.validateBlingUrl(url)) {
      return NextResponse.json(
        { error: 'URL do Bling inválida' },
        { status: 400 }
      )
    }

    const invoiceData = await BlingScraper.scrapeInvoice(url)

    const transfer = await prisma.transfer.create({
      data: {
        blingUrl: url,
        invoiceId: invoiceData.invoiceId,
        totalValue: invoiceData.totalValue,
        userId: userId,
        storeId: storeId,
        products: {
          create: await Promise.all(
            invoiceData.products.map(async (product) => {
              let dbProduct = await prisma.product.findUnique({
                where: { blingId: product.id }
              })

              if (!dbProduct) {
                dbProduct = await prisma.product.create({
                  data: {
                    blingId: product.id,
                    name: product.name,
                    code: product.code,
                    unit: product.unit
                  }
                })
              }

              return {
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                totalPrice: product.totalPrice,
                productId: dbProduct.id
              }
            })
          )
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        },
        store: true
      }
    })

    return NextResponse.json(transfer)
  } catch (error) {
    console.error('Erro ao processar nota fiscal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}