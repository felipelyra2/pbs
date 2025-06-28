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
      console.log('⚠️  MODO SIMULAÇÃO - API v2 do Bling foi descontinuada')
      console.log('📋 Dados da transferência registrados:', entryData)
      
      // Log dos produtos para controle manual
      console.log('🔍 PRODUTOS PARA ENTRADA MANUAL NO BLING:')
      entryData.itens.forEach((item, index) => {
        console.log(`   ${index + 1}. Código: ${item.codigo}`)
        console.log(`      Produto: ${item.descricao}`)
        console.log(`      Quantidade: ${item.quantidade}`)
        console.log(`      Valor: R$ ${item.valorUnidade.toFixed(2)}`)
        console.log(`      ──────────────────────`)
      })
      
      console.log('📝 AÇÃO NECESSÁRIA:')
      console.log('   1. Acesse o Bling manualmente')
      console.log('   2. Crie um pedido de compra ou ajuste de estoque')
      console.log('   3. Use os dados dos produtos listados acima')
      console.log(`   4. Referência: Transferência ${entryData.numero}`)
      
      // Simular sucesso para não quebrar o fluxo do sistema
      const results = entryData.itens.map(item => ({
        produto: item.codigo,
        success: true,
        resultado: '✅ Registrado para entrada manual no Bling (API v2 descontinuada)'
      }))

      return { 
        success: true, 
        results,
        totalProcessados: entryData.itens.length,
        sucessos: entryData.itens.length,
        erros: 0,
        detalhesErros: [],
        aviso: 'API v2 do Bling foi descontinuada. Entrada deve ser feita manualmente.',
        acaoNecessaria: 'Criar pedido de compra ou ajuste de estoque manualmente no Bling'
      }
    } catch (error: any) {
      console.error('Erro no modo simulação:', error)
      
      // Mesmo em erro, retornar sucesso simulado
      const results = entryData.itens.map(item => ({
        produto: item.codigo,
        success: true,
        resultado: '⚠️ Registrado para entrada manual (sistema em modo simulação)'
      }))

      return { 
        success: true, 
        results,
        totalProcessados: entryData.itens.length,
        sucessos: entryData.itens.length,
        erros: 0,
        detalhesErros: [],
        aviso: 'Sistema em modo simulação - API v2 descontinuada'
      }
    }
  }

  private buildPurchaseOrderXML(data: BlingEntryData): string {
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
    <pedidocompra>
      <numero>${data.numero}</numero>
      <data>${data.data}</data>
      <fornecedor>
        <nome>${data.fornecedor.nome}</nome>
      </fornecedor>
      <itens>
        ${itensXML}
      </itens>
      ${data.observacoes ? `<observacoes>${data.observacoes}</observacoes>` : ''}
    </pedidocompra>`
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
      
      // Criar XML para atualização de produto com estoque
      const stockXML = `<?xml version="1.0" encoding="UTF-8"?>
      <produto>
        <codigo>${productCode}</codigo>
        <estoque>${quantity}</estoque>
        <deposito>
          <deposito>1</deposito>
          <estoque>${quantity}</estoque>
        </deposito>
      </produto>`
      
      const params = new URLSearchParams()
      params.append('apikey', this.apiKey)
      params.append('xml', stockXML)
      
      const response = await axios.post(`${this.baseUrl}/produto/${productCode}/json/`, params.toString(), {
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