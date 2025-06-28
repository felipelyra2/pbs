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
      console.log('Iniciando criação de entrada no Bling:', entryData)
      
      // Usa ajuste de estoque para cada produto
      const results = []
      const errors = []
      
      for (const item of entryData.itens) {
        try {
          console.log(`Processando produto: ${item.codigo} - Quantidade: ${item.quantidade}`)
          const result = await this.updateStock(item.codigo, item.quantidade, 'entrada')
          results.push({ 
            produto: item.codigo, 
            success: true, 
            resultado: result 
          })
        } catch (error: any) {
          console.error(`Erro ao ajustar estoque do produto ${item.codigo}:`, error)
          errors.push({
            produto: item.codigo,
            erro: error.message
          })
          results.push({ 
            produto: item.codigo, 
            success: false, 
            erro: error.message 
          })
        }
      }
      
      if (errors.length > 0) {
        console.warn(`${errors.length} produto(s) com erro:`, errors)
      }
      
      // Se todos os produtos falharam, considera como erro geral
      if (errors.length === entryData.itens.length) {
        throw new Error(`Falha ao processar todos os produtos: ${errors.map(e => `${e.produto}: ${e.erro}`).join('; ')}`)
      }
      
      return { 
        success: true, 
        results,
        totalProcessados: entryData.itens.length,
        sucessos: results.filter(r => r.success).length,
        erros: errors.length,
        detalhesErros: errors
      }
    } catch (error: any) {
      console.error('Erro ao criar entrada no Bling:', error)
      throw new Error(`Falha ao integrar com a API do Bling: ${error.message}`)
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
    } catch (error: any) {
      console.error('Erro ao buscar produtos no Bling:', error)
      throw new Error('Falha ao buscar produtos na API do Bling')
    }
  }

  async updateStock(productCode: string, quantity: number, operation: 'entrada' | 'saida' = 'entrada'): Promise<any> {
    try {
      console.log(`Atualizando estoque no Bling - Produto: ${productCode}, Quantidade: ${quantity}, Operação: ${operation}`)
      
      const params = new URLSearchParams()
      params.append('apikey', this.apiKey)
      params.append('operacao', operation)
      params.append('quantidade', quantity.toString())
      
      const response = await axios.post(`${this.baseUrl}/estoque/${productCode}/json/`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      console.log('Resposta do Bling:', response.data)
      
      // Verificar se houve erro na resposta do Bling
      if (response.data?.retorno?.erros) {
        const blingError = response.data.retorno.erros.erro
        const errorMessage = Array.isArray(blingError) 
          ? blingError.map(e => e.msg || e.message).join('; ')
          : (blingError.msg || blingError.message || JSON.stringify(blingError))
        throw new Error(`Erro do Bling: ${errorMessage}`)
      }

      return response.data
    } catch (error: any) {
      console.error(`Erro ao atualizar estoque do produto ${productCode}:`, error)
      if (error.response?.data) {
        console.error('Resposta completa do Bling:', JSON.stringify(error.response.data, null, 2))
      }
      
      // Se já é um erro do Bling, propaga
      if (error.message.includes('Erro do Bling')) {
        throw error
      }
      
      // Extrai mensagem de erro específica do Bling
      let errorMessage = error.message || 'Erro desconhecido'
      if (error.response?.data?.retorno?.erros?.erro) {
        const blingError = error.response.data.retorno.erros.erro
        errorMessage = Array.isArray(blingError)
          ? blingError.map(e => e.msg || e.message).join('; ')
          : (blingError.msg || blingError.message || JSON.stringify(blingError))
      }
      
      throw new Error(`Falha ao atualizar estoque do produto ${productCode} na API do Bling: ${errorMessage}`)
    }
  }
}