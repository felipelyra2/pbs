// Teste real de movimentação no Bling API v3
const axios = require('axios');

// Configurações - SUBSTITUA POR UM TOKEN VÁLIDO
const TOKEN = 'db4b81bf8351ed1f83da0ccce03ed9f39e03d9f5';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

// Headers padrão
const headers = {
  'Authorization': TOKEN.startsWith('Bearer ') ? TOKEN : `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Teste de movimentação usando Pedido de Compra (método correto para API v3)
async function testMovimentacao() {
  console.log('🔄 Testando movimentação real no Bling API v3...\n');
  
  try {
    // 1. Primeiro, buscar um produto real para usar no teste
    console.log('1️⃣ Buscando produtos disponíveis...');
    const produtosResponse = await axios.get(`${BASE_URL}/produtos?limite=5`, { headers });
    
    if (!produtosResponse.data?.data?.length) {
      console.log('❌ Nenhum produto encontrado. Verificar autenticação.');
      return;
    }
    
    const produto = produtosResponse.data.data[0];
    console.log(`✅ Produto encontrado: ${produto.nome} (Código: ${produto.codigo})`);
    
    // 2. Criar pedido de compra para simular entrada de estoque
    console.log('\n2️⃣ Criando pedido de compra para entrada de estoque...');
    
    const pedidoCompra = {
      fornecedor: {
        nome: "FORNECEDOR TESTE MOVIMENTACAO",
        codigo: "FORNTEST001",
        tipoPessoa: "J",
        contribuinte: "9",
        cpfCnpj: "11222333000144",
        ie: "ISENTO",
        endereco: {
          endereco: "Rua Teste, 123",
          numero: "123",
          bairro: "Centro",
          cep: "01000000",
          municipio: "São Paulo",
          uf: "SP"
        }
      },
      itens: [
        {
          produto: {
            codigo: produto.codigo
          },
          quantidade: 1,
          valor: 10.00
        }
      ],
      observacoes: "Teste de movimentação de estoque via API v3",
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6 // Em andamento
      }
    };
    
    console.log('📋 Dados do pedido:', JSON.stringify(pedidoCompra, null, 2));
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, { headers });
    
    console.log('\n✅ SUCESSO! Pedido de compra criado:');
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    
    // 3. Tentar outros endpoints possíveis para movimentação
    console.log('\n3️⃣ Testando outros endpoints possíveis...');
    
    const endpointsAlternativos = [
      '/estoques',
      '/estoque',
      '/movimentacoes',
      '/lancamentos',
      '/entradas'
    ];
    
    for (const endpoint of endpointsAlternativos) {
      try {
        console.log(`🔍 Testando GET ${endpoint}...`);
        const testResponse = await axios.get(`${BASE_URL}${endpoint}?limite=1`, { headers });
        console.log(`✅ ${endpoint} existe! Dados:`, testResponse.data);
      } catch (error) {
        const status = error.response?.status;
        const errorType = error.response?.data?.error?.type;
        console.log(`❌ ${endpoint}: ${status} - ${errorType}`);
      }
    }
    
  } catch (error) {
    console.log('\n❌ Erro na movimentação:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
    
    // Análise específica do erro
    if (error.response?.status === 401) {
      console.log('\n🔑 PROBLEMA: Token de autenticação inválido ou expirado');
      console.log('   Solução: Renovar token OAuth 2.0');
    } else if (error.response?.status === 404) {
      console.log('\n🔍 PROBLEMA: Endpoint não encontrado');
      console.log('   Solução: Verificar documentação da API v3');
    } else if (error.response?.status === 422) {
      console.log('\n📋 PROBLEMA: Dados inválidos');
      console.log('   Solução: Ajustar formato dos dados enviados');
    }
  }
}

// Executar teste
testMovimentacao();