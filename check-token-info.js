// Verificar informações do token
const axios = require('axios');

const TOKEN = '0f97d01926287253e9fe58b9b0db80c3f184505c';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function checkTokenInfo() {
  console.log('🔍 Verificando informações do token...\n');
  
  const endpoints = [
    { name: 'Produtos', url: '/produtos?limite=1' },
    { name: 'Contatos', url: '/contatos?limite=1' }, 
    { name: 'Vendas', url: '/vendas?limite=1' },
    { name: 'Compras', url: '/compras?limite=1' },
    { name: 'Usuários', url: '/usuarios' },
    { name: 'Empresa', url: '/empresa' },
    { name: 'Situações', url: '/situacoes' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📋 Testando ${endpoint.name}:`);
      
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        headers: {
          'access_token': TOKEN,
          'Accept': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint.name}: ${response.data?.data?.length || 'N/A'} registros`);
      
      if (response.data?.data && response.data.data.length > 0) {
        const first = response.data.data[0];
        console.log(`   Primeiro: ${first.nome || first.razaoSocial || first.descricao || JSON.stringify(first).substring(0, 50)}`);
      }
      
      if (response.data && !response.data.data) {
        console.log(`   Resposta: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      const errorData = error.response?.data;
      console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${errorData?.error?.type || error.message}`);
      
      if (errorData?.error?.description) {
        console.log(`   Descrição: ${errorData.error.description}`);
      }
    }
    console.log('');
  }
}

checkTokenInfo();