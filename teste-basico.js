// Teste muito básico - sem complicação
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';

async function testeBasico() {
  console.log('🔧 TESTE BÁSICO DA API BLING\n');
  
  console.log('1️⃣ Testando com a documentação oficial do Bling...');
  
  try {
    // Método exato da documentação do Bling
    const response = await axios({
      method: 'GET',
      url: 'https://www.bling.com.br/Api/v3/produtos',
      headers: {
        'access_token': API_KEY
      },
      params: {
        limite: 1
      }
    });
    
    console.log('✅ FUNCIONOU!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERRO:');
    console.log('Status:', error.response?.status);
    console.log('Headers de resposta:', error.response?.headers);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    
    // Mostrar exatamente o que está acontecendo
    console.log('\n🔍 DETALHES DO ERRO:');
    console.log('URL chamada:', error.config?.url);
    console.log('Headers enviados:', error.config?.headers);
    console.log('Método:', error.config?.method);
  }
  
  console.log('\n2️⃣ Verificando se é problema de URL...');
  
  try {
    // Testar URL alternativa
    const response2 = await axios.get('https://bling.com.br/Api/v3/produtos', {
      headers: { 'access_token': API_KEY },
      params: { limite: 1 }
    });
    
    console.log('✅ URL alternativa funcionou!');
    console.log(JSON.stringify(response2.data, null, 2));
    
  } catch (error2) {
    console.log('❌ URL alternativa também falhou');
    console.log('Status:', error2.response?.status);
  }
}

testeBasico();