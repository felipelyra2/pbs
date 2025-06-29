// Testar diferentes formas de autenticação para pedidos de compra
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testarAutenticacaoPedidos() {
  console.log('🔐 Testando diferentes formas de autenticação para /pedidos/compras...\n');
  
  const formasAuth = [
    {
      nome: 'access_token header',
      headers: {
        'access_token': API_KEY,
        'Accept': 'application/json'
      }
    },
    {
      nome: 'Authorization Bearer',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    },
    {
      nome: 'Authorization Basic',
      headers: {
        'Authorization': `Basic ${Buffer.from(API_KEY + ':').toString('base64')}`,
        'Accept': 'application/json'
      }
    },
    {
      nome: 'apikey header',
      headers: {
        'apikey': API_KEY,
        'Accept': 'application/json'
      }
    }
  ];
  
  for (const forma of formasAuth) {
    try {
      console.log(`🧪 Testando: ${forma.nome}`);
      
      const response = await axios.get(`${BASE_URL}/pedidos/compras?limite=1`, {
        headers: forma.headers
      });
      
      console.log(`✅ ${forma.nome} FUNCIONOU!`);
      console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
      
      // Se funcionou, testar POST
      console.log(`\n🚀 Testando POST com ${forma.nome}...`);
      await testarPOSTPedido(forma.headers);
      
      return; // Parar no primeiro que funcionar
      
    } catch (error) {
      const status = error.response?.status;
      const errorType = error.response?.data?.error?.type;
      console.log(`❌ ${forma.nome}: Status ${status} - ${errorType}`);
    }
  }
  
  // Se nenhum funcionou, pode ser que o usuário não tenha permissão
  console.log('\n⚠️ NENHUMA FORMA DE AUTENTICAÇÃO FUNCIONOU');
  console.log('💡 POSSÍVEIS CAUSAS:');
  console.log('   1. Usuário API não tem permissão para Pedidos de Compra');
  console.log('   2. Endpoint requer autenticação OAuth (não usuário API)');
  console.log('   3. Permissões específicas não foram configuradas');
  
  // Verificar se outros endpoints funcionam com o mesmo usuário
  console.log('\n🔍 VERIFICANDO SE USUÁRIO API FUNCIONA EM OUTROS ENDPOINTS:');
  
  try {
    const prodResp = await axios.get(`${BASE_URL}/produtos?limite=1`, {
      headers: { 'access_token': API_KEY, 'Accept': 'application/json' }
    });
    console.log('✅ /produtos funciona com este usuário API');
  } catch (err) {
    console.log('❌ /produtos não funciona');
  }
}

async function testarPOSTPedido(headers) {
  const pedidoTeste = {
    fornecedor: {
      nome: "FORNECEDOR TESTE",
      codigo: "TEST001",
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
          codigo: "PROD001"
        },
        quantidade: 1,
        valor: 10.00
      }
    ],
    observacoes: "Teste via usuário API",
    dataPrevisao: new Date().toISOString().split('T')[0]
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoTeste, {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    
    console.log('🎉 POST FUNCIONOU! Pedido criado:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`❌ POST falhou: ${error.response?.status}`);
    console.log('📄 Erro:', JSON.stringify(error.response?.data, null, 2));
  }
}

testarAutenticacaoPedidos();