import axios from 'axios'
import * as cheerio from 'cheerio'

export interface BlingProduct {
  id: string
  name: string
  code: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export interface BlingInvoiceData {
  invoiceId: string
  totalValue: number
  products: BlingProduct[]
  supplier: string
  date: string
}

export class BlingScraper {
  private static extractInvoiceId(url: string): string {
    const match = url.match(/id=(\d+)/)
    if (!match) {
      throw new Error('URL inválida do Bling')
    }
    return match[1]
  }

  static async scrapeInvoice(url: string): Promise<BlingInvoiceData> {
    try {
      const invoiceId = this.extractInvoiceId(url)
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      
      const products: BlingProduct[] = []
      
      $('table.tabela-produtos tbody tr').each((index, element) => {
        const $row = $(element)
        const cells = $row.find('td')
        
        if (cells.length >= 6) {
          const code = $(cells[0]).text().trim()
          const name = $(cells[1]).text().trim()
          const quantity = parseFloat($(cells[2]).text().replace(',', '.')) || 0
          const unit = $(cells[3]).text().trim()
          const unitPrice = parseFloat($(cells[4]).text().replace('R$', '').replace('.', '').replace(',', '.')) || 0
          const totalPrice = parseFloat($(cells[5]).text().replace('R$', '').replace('.', '').replace(',', '.')) || 0
          
          if (name && quantity > 0) {
            products.push({
              id: `${invoiceId}_${index}`,
              name,
              code,
              quantity,
              unit,
              unitPrice,
              totalPrice
            })
          }
        }
      })

      const totalValue = products.reduce((sum, product) => sum + product.totalPrice, 0)
      
      const supplier = $('.fornecedor').text().trim() || 'Fornecedor não identificado'
      const date = $('.data-nota').text().trim() || new Date().toISOString().split('T')[0]

      return {
        invoiceId,
        totalValue,
        products,
        supplier,
        date
      }
    } catch (error) {
      console.error('Erro ao fazer scraping da nota fiscal:', error)
      throw new Error('Não foi possível extrair os dados da nota fiscal')
    }
  }

  static validateBlingUrl(url: string): boolean {
    const regex = /^https:\/\/www\.bling\.com\.br\/(b\/)?doc\.view\.php\?id=[a-zA-Z0-9]+/
    return regex.test(url)
  }
}