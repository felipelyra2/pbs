import axios from 'axios'

export interface BlingAPIProduct {
  codigo: string
  descricao: string
  quantidade: number
  valorUnidade: number
  valorTotal: number
  unidade: string
}

export interface BlingEntryData {
  numero: string
  data: string
  fornecedor: {
    nome: string
  }
  itens: BlingAPIProduct[]
  observacoes?: string
}

export class BlingAPI {
  private apiKey: string
  private baseUrl = 'https://bling.com.br/Api/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createEntry(entryData: BlingEntryData): Promise<any> {
    try {
      const xmlData = this.buildEntryXML(entryData)
      
      const response = await axios.post(`${this.baseUrl}/notaFiscal/json/`, {
        apikey: this.apiKey,
        xml: xmlData
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data
    } catch (error) {
      console.error('Erro ao criar entrada no Bling:', error)
      throw new Error('Falha ao integrar com a API do Bling')
    }
  }

  private buildEntryXML(data: BlingEntryData): string {
    const itensXML = data.itens.map(item => `
      <item>
        <codigo>${item.codigo}</codigo>
        <descricao>${item.descricao}</descricao>
        <quantidade>${item.quantidade}</quantidade>
        <valorunidade>${item.valorUnidade.toFixed(2)}</valorunidade>
        <unidade>${item.unidade}</unidade>
      </item>
    `).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
    <notafiscal>
      <numero>${data.numero}</numero>
      <data>${data.data}</data>
      <fornecedor>
        <nome>${data.fornecedor.nome}</nome>
      </fornecedor>
      <itens>
        ${itensXML}
      </itens>
      ${data.observacoes ? `<observacoes>${data.observacoes}</observacoes>` : ''}
    </notafiscal>`
  }

  async getProducts(search?: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        filters: search ? `nome[${search}]` : ''
      })

      const response = await axios.get(`${this.baseUrl}/produtos/json/?${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar produtos no Bling:', error)
      throw new Error('Falha ao buscar produtos na API do Bling')
    }
  }

  async updateStock(productCode: string, quantity: number, operation: 'entrada' | 'saida' = 'entrada'): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/estoque/${productCode}/json/`, {
        apikey: this.apiKey,
        operacao: operation,
        quantidade: quantity
      })

      return response.data
    } catch (error) {
      console.error('Erro ao atualizar estoque no Bling:', error)
      throw new Error('Falha ao atualizar estoque na API do Bling')
    }
  }
}