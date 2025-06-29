// Testar diferentes endpoints para movimentação
const axios = require('axios');

const TOKEN = 'b0dd86ae1f5827bcb42c461c0b85987473db3e8a';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

const movimento = {
  produto: {
    codigo: "7893595543020"
  },
  quantidade: 1,
  tipo: 'E',
  observacoes: 'Teste de endpoint'
};

const endpoints = [
  '/estoque/movimentacao',
  '/estoques/movimentacoes', 
  '/estoque/movimentacoes',
  '/estoques/movimentacao',
  '/movimentacoes/estoque',
  '/movimentacao/estoque'
];

async function testEndpoints() {
  console.log('🔍 Testando endpoints para movimentação de estoque...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testando: ${endpoint}`);
      
      const response = await axios.post(`${BASE_URL}${endpoint}`, movimento, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`✅ FUNCIONOU! Endpoint: ${endpoint}`);
      console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
      break;
      
    } catch (error) {
      const status = error.response?.status;
      const errorType = error.response?.data?.error?.type;
      console.log(`❌ ${endpoint}: ${status} - ${errorType}`);
    }
  }
}

testEndpoints();