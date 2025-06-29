// Testar se funciona na API v2
const axios = require('axios');

const TOKEN = '0f97d01926287253e9fe58b9b0db80c3f184505c';

async function testV2() {
  console.log('🔍 Testando na API v2 do Bling...\n');
  
  try {
    const response = await axios.get('https://bling.com.br/Api/v2/produtos/json/', {
      params: {
        apikey: TOKEN,
        limite: 5
      }
    });
    
    console.log('✅ API v2 funcionou!');
    console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ API v2 falhou:', error.response?.data || error.message);
  }
}

testV2();