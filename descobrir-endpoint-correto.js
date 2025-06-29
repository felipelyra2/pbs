// Descobrir endpoint correto para pedidos de compra
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

const headers = {
  'access_token': API_KEY,
  'Accept': 'application/json'
};

// Possíveis endpoints para pedidos de compra
const endpoints = [
  '/pedidocompra',
  '/pedidos-compra', 
  '/pedidos/compra',
  '/pedidos/compras',
  '/pedidoscompra',
  '/pedido-compra',
  '/purchase-orders',
  '/compras',
  '/pedidos-de-compra'
];

async function descobrirEndpoint() {
  console.log('🔍 Descobrindo endpoint correto para pedidos de compra...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testando GET ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}?limite=1`, { headers });
      
      console.log(`✅ ENCONTRADO! ${endpoint} existe e retorna:`);
      console.log(JSON.stringify(response.data, null, 2));
      
      // Se encontrou, testar POST
      console.log(`\n🚀 Testando POST em ${endpoint}...`);
      break;
      
    } catch (error) {
      const status = error.response?.status;
      const errorType = error.response?.data?.error?.type;
      
      if (status === 200) {
        console.log(`✅ ${endpoint}: FUNCIONA`);
      } else if (status === 401) {
        console.log(`🔐 ${endpoint}: EXISTE mas sem permissão`);
      } else if (status === 404) {
        console.log(`❌ ${endpoint}: NÃO EXISTE`);
      } else if (status === 422) {
        console.log(`⚠️ ${endpoint}: EXISTE mas dados inválidos`);
      } else {
        console.log(`❓ ${endpoint}: Status ${status} - ${errorType}`);
      }
    }
  }
  
  // Testar alguns endpoints que sabemos que funcionam
  console.log('\n✅ CONFIRMANDO ENDPOINTS QUE FUNCIONAM:');
  
  try {
    console.log('🧪 Testando /produtos...');
    const produtosResp = await axios.get(`${BASE_URL}/produtos?limite=1`, { headers });
    console.log('✅ /produtos funciona');
  } catch (err) {
    console.log('❌ /produtos erro:', err.response?.status);
  }
  
  try {
    console.log('🧪 Testando /contatos...');
    const contatosResp = await axios.get(`${BASE_URL}/contatos?limite=1`, { headers });
    console.log('✅ /contatos funciona');
  } catch (err) {
    console.log('❌ /contatos erro:', err.response?.status);
  }
  
  try {
    console.log('🧪 Testando /depositos...');
    const depositosResp = await axios.get(`${BASE_URL}/depositos?limite=1`, { headers });
    console.log('✅ /depositos funciona');
  } catch (err) {
    console.log('❌ /depositos erro:', err.response?.status);
  }
}

descobrirEndpoint();