const axios = require('axios');

const TOKEN = 'Bearer db4b81bf8351ed1f83da0ccce03ed9f39e03d9f5';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testToken() {
  console.log('🔍 Testando token:', TOKEN.substring(0, 20) + '...');
  
  // Teste 1: Endpoint de produtos
  console.log('\n1️⃣ Testando /produtos...');
  try {
    const response = await axios.get(`${BASE_URL}/produtos?limite=1`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ /produtos funcionou! Status:', response.status);
    
  } catch (error) {
    console.error('❌ /produtos falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }

  // Teste 2: Endpoint de situações
  console.log('\n2️⃣ Testando /situacoes...');
  try {
    const response = await axios.get(`${BASE_URL}/situacoes`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ /situacoes funcionou! Status:', response.status);
    
  } catch (error) {
    console.error('❌ /situacoes falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }

  // Teste 3: Endpoint de pedidos
  console.log('\n3️⃣ Testando /pedidos/vendas...');
  try {
    const response = await axios.get(`${BASE_URL}/pedidos/vendas?limite=1`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ /pedidos/vendas funcionou! Status:', response.status);
    
  } catch (error) {
    console.error('❌ /pedidos/vendas falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }

  // Teste 4: Endpoint de contatos
  console.log('\n4️⃣ Testando /contatos...');
  try {
    const response = await axios.get(`${BASE_URL}/contatos?limite=1`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ /contatos funcionou! Status:', response.status);
    
  } catch (error) {
    console.error('❌ /contatos falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }
}

testToken();