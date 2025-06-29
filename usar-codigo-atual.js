// Usar código OAuth atual
const axios = require('axios');

const CLIENT_ID = '03a8de4a6ecb737e41e0df0c47832cb94384907f';
const CLIENT_SECRET = 'fb0bd52ff4f655102027caf8801be04eafc4dd7b85a44c60b603404d6220';
const CODIGO = '86330711ecccd7da4a667e3f555ffd24b1899208';

async function gerarToken() {
  console.log('🔄 Gerando token com código atual...\n');
  
  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const tokenData = {
      grant_type: 'authorization_code',
      code: CODIGO,
      redirect_uri: 'https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback'
    };
    
    console.log('📋 Dados:', JSON.stringify(tokenData, null, 2));
    
    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', tokenData, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('🎉 TOKEN GERADO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Access Token:', response.data.access_token);
    console.log('⏰ Expires in:', response.data.expires_in, 'segundos');
    console.log('🔄 Refresh Token:', response.data.refresh_token);
    
    // Testar token
    console.log('\n🧪 TESTANDO TOKEN...');
    await testarToken(response.data.access_token);
    
  } catch (error) {
    console.log('❌ ERRO:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.error?.type === 'invalid_grant') {
      console.log('\n⏰ Código expirou! Precisa gerar novo no Bling.');
    }
  }
}

async function testarToken(token) {
  try {
    const response = await axios.get('https://www.bling.com.br/Api/v3/produtos?limite=3', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ TOKEN FUNCIONANDO!');
    console.log('📊 Produtos encontrados:', response.data?.data?.length || 0);
    
  } catch (error) {
    console.log('❌ Erro ao testar:', error.response?.status);
  }
}

gerarToken();