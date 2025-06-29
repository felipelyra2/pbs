import axios from 'axios'

export interface BlingV3Product {
  codigo: string
  nome: string
  quantidade: number
  preco: number
  unidade: string
}

export interface BlingV3StockMovement {
  produto: {
    codigo: string
  }
  quantidade: number
  tipo: 'E' | 'S' // Entrada ou Saída
  observacoes?: string
  deposito?: {
    id: number
  }
}

export class BlingAPIv3 {
  private baseUrl = 'https://www.bling.com.br/Api/v3'
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  async getProducts(search?: string): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('criterio', search)
      }
      
      const response = await axios.get(`${this.baseUrl}/produtos?${params}`, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar produtos no Bling v3:', error)
      throw new Error('Falha ao buscar produtos na API v3 do Bling')
    }
  }

  async createStockMovement(movements: BlingV3StockMovement[]): Promise<any> {
    // API v3 ainda não tem movimentação de estoque
    // Vamos usar pedidos de compra como alternativa
    console.log('⚠️ API v3 não suporta movimentação direta, usando pedido de compra')
    
    return this.createPurchaseOrderFromMovements(movements)
  }

  async createPurchaseOrderFromMovements(movements: BlingV3StockMovement[]): Promise<any> {
    try {
      console.log('Criando movimentação de estoque no Bling v3:', movements)
      
      const results = []
      const errors = []

      for (const movement of movements) {
        try {
          console.log(`🔄 Criando movimentação para produto ${movement.produto.codigo}`)
          console.log('📋 Dados da movimentação:', JSON.stringify(movement, null, 2))
          
          const response = await axios.post(`${this.baseUrl}/estoque/movimentacao`, movement, {
            headers: this.getHeaders()
          })
          
          console.log(`✅ Resposta da API:`, JSON.stringify(response.data, null, 2))

          console.log(`Movimentação criada para produto ${movement.produto.codigo}:`, response.data)
          
          results.push({
            produto: movement.produto.codigo,
            success: true,
            resultado: response.data
          })
        } catch (error: any) {
          console.error(`Erro na movimentação do produto ${movement.produto.codigo}:`, error)
          
          let errorMessage = 'Erro desconhecido'
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error.message || error.response.data.error
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.message) {
            errorMessage = error.message
          }

          errors.push({
            produto: movement.produto.codigo,
            erro: errorMessage
          })

          results.push({
            produto: movement.produto.codigo,
            success: false,
            erro: errorMessage
          })
        }
      }

      return {
        success: errors.length < movements.length,
        results,
        totalProcessados: movements.length,
        sucessos: results.filter(r => r.success).length,
        erros: errors.length,
        detalhesErros: errors
      }
    } catch (error: any) {
      console.error('Erro geral na criação de movimentações:', error)
      throw new Error(`Falha ao criar movimentações na API v3 do Bling: ${error.message}`)
    }
  }

  async createPurchaseOrder(orderData: any): Promise<any> {
    try {
      console.log('Criando pedido de compra no Bling v3:', orderData)
      
      const response = await axios.post(`${this.baseUrl}/pedidos/compras`, orderData, {
        headers: this.getHeaders()
      })

      console.log('Pedido de compra criado:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao criar pedido de compra no Bling v3:', error)
      
      let errorMessage = 'Erro desconhecido'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error.message || error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      throw new Error(`Falha ao criar pedido de compra na API v3: ${errorMessage}`)
    }
  }

  // Método para validar se o token ainda é válido
  async validateToken(): Promise<boolean> {
    try {
      // Usar endpoint de produtos com limite mínimo para validar token
      await axios.get(`${this.baseUrl}/produtos?limite=1`, {
        headers: this.getHeaders()
      })
      return true
    } catch (error) {
      console.error('Token inválido ou expirado:', error)
      return false
    } 
  }
}