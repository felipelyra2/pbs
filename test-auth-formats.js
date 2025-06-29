// Testar diferentes formatos de autenticação
const axios = require('axios');

const TOKEN = 'b0dd86ae1f5827bcb42c461c0b85987473db3e8a';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testFormats() {
  console.log('🔍 Testando diferentes formatos de autenticação...\n');
  
  const formats = [
    { name: '1. access_token no header', headers: { 'access_token': TOKEN } },
    { name: '2. Authorization Bearer', headers: { 'Authorization': `Bearer ${TOKEN}` } },
    { name: '3. access_token no query', url: `${BASE_URL}/produtos?access_token=${TOKEN}&limite=5` },
    { name: '4. token no query', url: `${BASE_URL}/produtos?token=${TOKEN}&limite=5` },
    { name: '5. api_token no header', headers: { 'api_token': TOKEN } },
    { name: '6. X-API-Key no header', headers: { 'X-API-Key': TOKEN } }
  ];
  
  for (const format of formats) {
    try {
      console.log(`🧪 ${format.name}:`);
      
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...format.headers
        }
      };
      
      const url = format.url || `${BASE_URL}/produtos?limite=5`;
      const response = await axios.get(url, config);
      
      console.log(`✅ FUNCIONOU! Produtos encontrados: ${response.data?.data?.length || 0}`);
      
      if (response.data?.data?.length > 0) {
        console.log(`📦 Primeiro produto: ${response.data.data[0].nome} (${response.data.data[0].codigo})`);
      }
      
      console.log('📋 Estrutura da resposta:', Object.keys(response.data));
      console.log('');
      
    } catch (error) {
      console.log(`❌ Falhou: ${error.response?.status} - ${error.response?.data?.error?.type || error.message}`);
      console.log('');
    }
  }
}

testFormats();