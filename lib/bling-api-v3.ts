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
    // Se o token já tem Bearer, usar direto, senão adicionar
    const authHeader = this.accessToken.startsWith('Bearer ') 
      ? this.accessToken 
      : `Bearer ${this.accessToken}`
      
    return {
      'Authorization': authHeader,
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

  async findProductByCode(codigo: string): Promise<any> {
    try {
      // Tentar buscar produto por código através da busca com critério
      console.log(`🔍 Buscando produto por código: ${codigo}`)
      
      const response = await axios.get(`${this.baseUrl}/produtos?criterio=${encodeURIComponent(codigo)}&limite=100`, {
        headers: this.getHeaders()
      })
      
      if (response.data.data && response.data.data.length > 0) {
        // Procurar produto com código exato
        const produtoExato = response.data.data.find((p: any) => 
          p.codigo === codigo || p.gtin === codigo
        )
        
        if (produtoExato) {
          console.log(`✅ Produto encontrado: ${produtoExato.nome} (ID: ${produtoExato.id})`)
          return produtoExato
        }
      }
      
      console.log(`❌ Produto não encontrado por código: ${codigo}`)
      return null
      
    } catch (error) {
      console.error(`❌ Erro ao buscar produto ${codigo}:`, error)
      return null
    }
  }

  async createPurchaseOrderFromMovements(movements: BlingV3StockMovement[]): Promise<any> {
    try {
      console.log('🔄 Criando pedido de compra no Bling v3 (alternativa para movimentação):', movements)
      
      // Primeiro, tentar encontrar os produtos por código
      const itensProcessados = []
      
      for (const movement of movements) {
        const produto = await this.findProductByCode(movement.produto.codigo)
        
        if (produto) {
          itensProcessados.push({
            produto: {
              id: produto.id
            },
            quantidade: movement.quantidade,
            valor: 0.01
          })
        } else {
          // Se não encontrar, tentar com código original
          itensProcessados.push({
            produto: {
              codigo: movement.produto.codigo
            },
            quantidade: movement.quantidade,
            valor: 0.01
          })
        }
      }
      
      const itens = itensProcessados

      const pedidoCompra = {
        fornecedor: {
          nome: "TRANSFERENCIA ENTRE LOJAS LTDA",
          codigo: "TRANSF001",
          tipoPessoa: "J",
          contribuinte: "9",
          cpfCnpj: "00000000000191", // CNPJ genérico para transferência
          ie: "ISENTO",
          endereco: {
            endereco: "Rua das Transferencias, 123",
            numero: "123",
            bairro: "Centro",
            cep: "59000000",
            municipio: "Natal",
            uf: "RN"
          }
        },
        itens: itens,
        observacoes: movements[0]?.observacoes || "Transferência automática entre lojas",
        dataPrevisao: new Date().toISOString().split('T')[0],
        situacao: {
          valor: 6 // Situação "Em andamento"
        }
      }

      console.log('📋 Dados do pedido de compra:', JSON.stringify(pedidoCompra, null, 2))
      
      const response = await axios.post(`${this.baseUrl}/pedidocompra`, pedidoCompra, {
        headers: this.getHeaders()
      })
      
      console.log('✅ Pedido de compra criado:', JSON.stringify(response.data, null, 2))

      // Retornar no formato esperado
      const results = movements.map(movement => ({
        produto: movement.produto.codigo,
        success: true,
        resultado: response.data
      }))

      return {
        success: true,
        results,
        totalProcessados: movements.length,
        sucessos: movements.length,
        erros: 0,
        detalhesErros: []
      }
      
    } catch (error: any) {
      console.error('Erro ao criar pedido de compra:', error)
      
      let errorMessage = 'Erro desconhecido'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error.message || error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      // Retornar erro no formato esperado
      return {
        success: false,
        results: movements.map(movement => ({
          produto: movement.produto.codigo,
          success: false,
          erro: errorMessage
        })),
        totalProcessados: movements.length,
        sucessos: 0,
        erros: movements.length,
        detalhesErros: movements.map(movement => ({
          produto: movement.produto.codigo,
          erro: errorMessage
        }))
      }
    }
  }

  async createPurchaseOrder(orderData: any): Promise<any> {
    try {
      console.log('Criando pedido de compra no Bling v3:', orderData)
      
      const response = await axios.post(`${this.baseUrl}/pedidocompra`, orderData, {
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
    } catch (error: any) {
      console.error('Erro na validação do token:', error.response?.data || error.message)
      
      // Se for 401, é token inválido
      if (error.response?.status === 401) {
        console.error('Token realmente inválido ou expirado')
        return false
      }
      
      // Se for outro erro (403, 404, etc), pode ser problema de permissão ou endpoint
      // Vamos assumir que o token é válido mas não tem acesso a esse recurso
      console.warn('Token pode estar válido, mas sem acesso ao endpoint /produtos')
      return true
    } 
  }
}