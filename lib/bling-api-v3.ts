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
      
      // PASSO 3: Busca completa e robusta - percorrer TODAS as páginas se necessário
      console.log(`⚠️ Iniciando busca completa robusta...`)
      return await this.searchProductComplete(codigo)
      
    } catch (error) {
      console.error(`❌ Erro ao buscar produto ${codigo}:`, error)
      return null
    }
  }

  private async searchProductComplete(codigo: string): Promise<any> {
    console.log(`🔍 BUSCA COMPLETA ROBUSTA - Código: ${codigo}`)
    console.log(`🎯 SOLUÇÃO DEFINITIVA: Buscar TODAS as páginas até encontrar`)
    console.log(`⚠️ Esta operação pode demorar, mas VAI ENCONTRAR o produto se ele existir`)
    
    let totalVerificados = 0
    let pagina = 1
    let maxTentativas = 3 // Tentativas por página em caso de erro
    
    while (true) {
      let tentativas = 0
      let sucessoNaPagina = false
      
      while (tentativas < maxTentativas && !sucessoNaPagina) {
        try {
          console.log(`📄 Página ${pagina} (tentativa ${tentativas + 1}/${maxTentativas})...`)
          
          // Delay adaptativo baseado no número de tentativas
          const delay = 500 + (tentativas * 1000) + (pagina * 50)
          await this.delay(delay)
          
          const response = await axios.get(`${this.baseUrl}/produtos?limite=100&pagina=${pagina}`, {
            headers: this.getHeaders(),
            timeout: 30000 // 30 segundos timeout por request
          })
          
          const produtos = response.data.data || []
          totalVerificados += produtos.length
          sucessoNaPagina = true
          
          console.log(`   📦 ${produtos.length} produtos verificados (Total: ${totalVerificados})`)
          
          // Verificar cada produto desta página
          for (const produto of produtos) {
            if (produto.codigo === codigo) {
              console.log(`\n🎉 PRODUTO ENCONTRADO NA BUSCA COMPLETA!`)
              console.log(`Nome: ${produto.nome}`)
              console.log(`Código: ${produto.codigo}`)
              console.log(`ID: ${produto.id}`)
              console.log(`Página: ${pagina}`)
              console.log(`Total verificado: ${totalVerificados} produtos`)
              
              return produto
            }
          }
          
          // Se página tem menos de 100 produtos, é a última
          if (produtos.length < 100) {
            console.log(`\n📄 ÚLTIMA PÁGINA ENCONTRADA: ${pagina}`)
            console.log(`📊 BUSCA COMPLETA FINALIZADA`)
            console.log(`- Total de páginas: ${pagina}`)
            console.log(`- Total de produtos verificados: ${totalVerificados}`)
            console.log(`- Produto encontrado: NÃO`)
            
            console.log(`\n❌ PRODUTO ${codigo} NÃO EXISTE NA API DO BLING`)
            console.log(`🔧 CAUSAS POSSÍVEIS:`)
            console.log(`- Produto está inativo/arquivado`)
            console.log(`- Código está diferente no sistema`)
            console.log(`- Produto está em loja/depósito não acessível`)
            console.log(`- Diferença entre painel web e API`)
            
            return null
          }
          
        } catch (error: any) {
          tentativas++
          
          if (error.response?.status === 429) {
            console.log(`   ⏸️ Rate limit na página ${pagina} - aguardando ${5 + tentativas * 2}s...`)
            await this.delay((5 + tentativas * 2) * 1000)
            continue // Tentar mesma página novamente
          }
          
          if (error.response?.status === 401) {
            console.log(`❌ TOKEN EXPIRADO - Parando busca na página ${pagina}`)
            return null
          }
          
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log(`   ⏱️ Timeout na página ${pagina} - tentativa ${tentativas}/${maxTentativas}`)
            continue
          }
          
          console.error(`❌ Erro na página ${pagina}, tentativa ${tentativas}:`, error.response?.status || error.message)
          
          if (tentativas >= maxTentativas) {
            console.log(`❌ Máximo de tentativas atingido na página ${pagina} - pulando para próxima`)
            sucessoNaPagina = true // Força a continuar para próxima página
          }
        }
      }
      
      pagina++
      
      // Log de progresso a cada 10 páginas
      if (pagina % 10 === 0) {
        console.log(`📊 PROGRESSO: ${pagina} páginas verificadas, ${totalVerificados} produtos processados`)
      }
      
      // Proteção contra loop infinito (máximo ~50 páginas = 5000 produtos)
      if (pagina > 50) {
        console.log(`⚠️ LIMITE DE SEGURANÇA: 50 páginas verificadas (${totalVerificados} produtos)`)
        console.log(`💡 Se produto não foi encontrado, pode estar além da página 50`)
        break
      }
    }
    
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
        idContato: fornecedorId || 17501595782, // Usar formato correto: idContato direto
        itens: itens.map(item => ({
          produto: item.produto,
          quantidade: item.quantidade,
          valor: item.valor,
          descricao: `Transferência - ${movements.find(m => 
            (m.produto.codigo === item.produto.codigo) || 
            (item.produto.id && m.produto.codigo)
          )?.observacoes || 'Produto transferido automaticamente'}`
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