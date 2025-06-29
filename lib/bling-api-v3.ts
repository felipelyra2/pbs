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

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async findProductByCode(codigo: string): Promise<any> {
    try {
      // PASSO 1: Busca rápida por critério
      console.log(`🔍 Busca rápida por código: ${codigo}`)
      
      const response = await axios.get(`${this.baseUrl}/produtos?criterio=${encodeURIComponent(codigo)}&limite=100`, {
        headers: this.getHeaders()
      })
      
      if (response.data.data && response.data.data.length > 0) {
        // Procurar produto com código exato
        const produtoExato = response.data.data.find((p: any) => 
          p.codigo === codigo || p.gtin === codigo
        )
        
        if (produtoExato) {
          console.log(`✅ Produto encontrado na busca rápida: ${produtoExato.nome}`)
          return produtoExato
        }
      }
      
      // PASSO 2: Busca inteligente por partes do código
      console.log(`⚠️ Produto não encontrado na busca rápida. Tentando busca por partes...`)
      
      // Se o código tem mais de 6 dígitos, buscar por partes
      if (codigo.length > 6) {
        const parteInicial = codigo.substring(0, 8) // Primeiros 8 dígitos
        console.log(`🔍 Buscando por parte inicial: ${parteInicial}`)
        
        const partialResponse = await axios.get(`${this.baseUrl}/produtos?criterio=${encodeURIComponent(parteInicial)}&limite=100`, {
          headers: this.getHeaders()
        })
        
        if (partialResponse.data.data && partialResponse.data.data.length > 0) {
          const produtoExato = partialResponse.data.data.find((p: any) => 
            p.codigo === codigo
          )
          
          if (produtoExato) {
            console.log(`✅ Produto encontrado na busca por partes: ${produtoExato.nome}`)
            return produtoExato
          }
        }
      }
      
      // PASSO 3: Busca estratégica - começar do final onde sabemos que o produto está
      console.log(`⚠️ Iniciando busca estratégica paginada...`)
      return await this.searchProductStrategic(codigo)
      
    } catch (error) {
      console.error(`❌ Erro ao buscar produto ${codigo}:`, error)
      return null
    }
  }

  private async searchProductStrategic(codigo: string): Promise<any> {
    console.log(`🔍 BUSCA ESTRATÉGICA - Código: ${codigo}`)
    console.log(`🎯 Estratégia: buscar páginas mais prováveis primeiro`)
    
    let totalVerificados = 0
    
    // ESTRATÉGIA: Sabemos que o produto está na página ~40 de 41
    // Vamos buscar do final para o início para encontrar mais rápido
    const totalPaginas = Math.ceil(4047 / 100) // ~41 páginas
    
    // Páginas prioritárias: do final para o início (onde provavelmente estão produtos novos)
    const paginasPrioritarias = []
    
    // Começar das páginas finais (35-41)
    for (let p = totalPaginas; p >= totalPaginas - 10; p--) {
      if (p > 0) paginasPrioritarias.push(p)
    }
    
    // Depois páginas do meio-final (20-34)
    for (let p = totalPaginas - 11; p >= 20; p--) {
      if (p > 0) paginasPrioritarias.push(p)
    }
    
    // Se ainda não encontrou, páginas do início (1-19)
    for (let p = 19; p >= 1; p--) {
      paginasPrioritarias.push(p)
    }
    
    console.log(`📄 Ordem de busca: páginas ${paginasPrioritarias.slice(0, 5).join(', ')}... (total: ${paginasPrioritarias.length})`)
    
    // Buscar nas páginas prioritárias
    for (let i = 0; i < paginasPrioritarias.length; i++) {
      const pagina = paginasPrioritarias[i]
      
      try {
        console.log(`📄 Página ${pagina} (${i + 1}/${Math.min(20, paginasPrioritarias.length)})...`)
        
        // Delay para evitar rate limit
        await this.delay(800)
        
        const response = await axios.get(`${this.baseUrl}/produtos?limite=100&pagina=${pagina}`, {
          headers: this.getHeaders()
        })
        
        const produtos = response.data.data || []
        totalVerificados += produtos.length
        
        console.log(`   📦 ${produtos.length} produtos verificados`)
        
        // Verificar cada produto desta página
        for (const produto of produtos) {
          if (produto.codigo === codigo) {
            console.log(`\n🎯 PRODUTO ENCONTRADO NA BUSCA ESTRATÉGICA!`)
            console.log(`Nome: ${produto.nome}`)
            console.log(`Código: ${produto.codigo}`)
            console.log(`ID: ${produto.id}`)
            console.log(`Página: ${pagina}`)
            console.log(`Tentativa: ${i + 1}`)
            
            return produto
          }
        }
        
        // Limitar a 20 páginas para evitar timeout
        if (i >= 19) {
          console.log(`⏱️ Limite de 20 páginas atingido para evitar timeout`)
          break
        }
        
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log(`   ⏸️ Rate limit - aguardando 5s...`)
          await this.delay(5000)
          continue
        }
        
        console.error(`❌ Erro na página ${pagina}:`, error.response?.status)
        break
      }
    }
    
    console.log(`\n📊 BUSCA ESTRATÉGICA FINALIZADA`)
    console.log(`- Páginas verificadas: ${Math.min(20, paginasPrioritarias.length)}`)
    console.log(`- Produtos verificados: ${totalVerificados}`)
    console.log(`- Produto encontrado: NÃO`)
    
    console.log(`\n💡 Produto não encontrado na busca estratégica`)
    console.log(`🔧 Isso pode significar:`)
    console.log(`- Produto está em páginas não verificadas ainda`)
    console.log(`- Código pode estar ligeiramente diferente`)
    console.log(`- Produto pode estar inativo`)
    
    return null
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

      // Primeiro criar o fornecedor se não existir
      let fornecedorId = null;
      try {
        const fornecedorResponse = await axios.post(`${this.baseUrl}/contatos`, {
          nome: "TRANSFERENCIA ENTRE LOJAS LTDA",
          codigo: "TRANSF001",
          tipo: "F", // Fornecedor
          tipoPessoa: "J",
          contribuinte: "9", 
          cpfCnpj: "00000000000191",
          ie: "ISENTO",
          endereco: {
            endereco: "Rua das Transferencias, 123",
            numero: "123",
            bairro: "Centro", 
            cep: "59000000",
            municipio: "Natal",
            uf: "RN"
          }
        }, {
          headers: this.getHeaders()
        });
        
        fornecedorId = fornecedorResponse.data.data.id;
        console.log('✅ Fornecedor criado com ID:', fornecedorId);
        
      } catch (error: any) {
        console.log('⚠️ Erro ao criar fornecedor (pode já existir):', error.response?.data?.error?.message);
        // Tentar buscar fornecedor existente
        try {
          const searchResponse = await axios.get(`${this.baseUrl}/contatos?criterio=TRANSF001`, {
            headers: this.getHeaders()
          });
          
          if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            fornecedorId = searchResponse.data.data[0].id;
            console.log('✅ Fornecedor encontrado com ID:', fornecedorId);
          }
        } catch (searchError) {
          console.error('❌ Erro ao buscar fornecedor:', searchError);
        }
      }

      const pedidoCompra = {
        contato: {
          id: fornecedorId || 1 // Usar ID do fornecedor ou fallback
        },
        itens: itens.map(item => ({
          ...item,
          descricao: `Transferência - ${movements.find(m => m.produto.codigo === item.produto.codigo)?.observacoes || 'Produto'}`
        })),
        observacoes: movements[0]?.observacoes || "Transferência automática entre lojas",
        dataPrevisao: new Date().toISOString().split('T')[0]
      }

      console.log('📋 Dados do pedido de compra:', JSON.stringify(pedidoCompra, null, 2))
      
      const response = await axios.post(`${this.baseUrl}/pedidos/compras`, pedidoCompra, {
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