// Descobrir endpoints disponíveis
const axios = require('axios');

const TOKEN = 'b0dd86ae1f5827bcb42c461c0b85987473db3e8a';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function listEndpoints() {
  const endpoints = [
    '/produtos',
    '/contratos', 
    '/vendas',
    '/compras',
    '/estoques',
    '/estoque',
    '/depositos',
    '/categorias'
  ];
  
  console.log('🔍 Testando endpoints disponíveis...\n');
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}?limite=1`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint}: Funciona (${response.data?.data?.length || 0} registros)`);
      
    } catch (error) {
      const status = error.response?.status;
      console.log(`❌ ${endpoint}: ${status}`);
    }
  }
}

listEndpoints();