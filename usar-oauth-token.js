// Usar token OAuth em vez de usuário API
const axios = require('axios');

// COLE AQUI O TOKEN OAUTH QUE VOCÊ GEROU ONTEM
const OAUTH_TOKEN = 'COLE_SEU_TOKEN_OAUTH_AQUI';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testarComOAuth() {
  console.log('🔑 Testando com token OAuth...\n');
  
  const headers = {
    'Authorization': `Bearer ${OAUTH_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Listar produtos
    console.log('📦 Listando produtos...');
    const produtosResp = await axios.get(`${BASE_URL}/produtos?limite=5`, { headers });
    
    console.log('✅ Produtos encontrados:', produtosResp.data?.data?.length || 0);
    
    if (produtosResp.data?.data?.length > 0) {
      const produto = produtosResp.data.data[0];
      console.log(`   - ${produto.nome} (${produto.codigo})`);
      
      // 2. Testar pedido de compra
      console.log('\n🛒 Testando pedido de compra...');
      await criarPedidoTeste(produto, headers);
    } else {
      console.log('⚠️ Nenhum produto encontrado, usando código fictício');
      await criarPedidoTeste({ codigo: 'TESTE001', nome: 'Produto Teste' }, headers);
    }
    
  } catch (error) {
    console.log('❌ Erro com OAuth:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Token OAuth expirado - precisa renovar');
      console.log('💡 Execute: npm run dev e acesse /configuracao-api');
    }
  }
}

async function criarPedidoTeste(produto, headers) {
  const pedido = {
    fornecedor: {
      nome: "FORNECEDOR TESTE OAUTH",
      codigo: "OAUTH001",
      tipoPessoa: "J",
      contribuinte: "9",
      cpfCnpj: "11222333000144",
      ie: "ISENTO",
      endereco: {
        endereco: "Rua OAuth, 123",
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
    observacoes: `Teste OAuth - ${produto.nome}`,
    dataPrevisao: new Date().toISOString().split('T')[0],
    situacao: {
      valor: 6
    }
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedido, { headers });
    console.log('🎉 PEDIDO CRIADO COM SUCESSO!');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('📊 Resultado:', error.response?.status);
    if (error.response?.status === 422) {
      console.log('✅ Endpoint funciona! Dados inválidos');
    }
    console.log(JSON.stringify(error.response?.data, null, 2));
  }
}

console.log('💡 INSTRUÇÕES:');
console.log('1. Cole seu token OAuth na variável OAUTH_TOKEN');
console.log('2. Execute: node usar-oauth-token.js');
console.log('3. Se token expirou, renove em /configuracao-api\n');

// Só executar se token foi definido
if (OAUTH_TOKEN !== 'COLE_SEU_TOKEN_OAUTH_AQUI') {
  testarComOAuth();
} else {
  console.log('⚠️ Defina o OAUTH_TOKEN primeiro!');
}