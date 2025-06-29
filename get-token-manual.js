// Script para obter token OAuth manualmente
const axios = require('axios');

// Substitua pelos valores do SEU NOVO aplicativo
// Novo aplicativo
const CLIENT_ID = '03a8de4a6ecb737e41e0df0c47832cb94384907f';
const CLIENT_SECRET = 'fb0bd52ff4f655102027caf8801be04eafc4dd7b85a44c60b603404d6220';

// Aplicativo antigo (descomente se quiser testar)
// const CLIENT_ID = '38fa799f7c1d8d08e4507a981700ab0930383fd4';
// const CLIENT_SECRET = 'SEU_SECRET_ANTIGO';
const CALLBACK_URL = 'https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback';

console.log('🔗 Para autorizar, acesse este link:');
console.log(`https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&state=12345&redirect_uri=${encodeURIComponent(CALLBACK_URL)}`);

console.log('\n💡 Após autorizar, cole o código aqui e execute:');
console.log(`node get-token-manual.js SEU_CODIGO_AQUI`);

const code = process.argv[2];
if (!code) {
  console.log('\n❌ Forneça o código como parâmetro');
  process.exit(1);
}

async function getToken() {
  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: CALLBACK_URL
    }, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token obtido com sucesso!');
    console.log('🎟️  Token:', response.data.access_token);
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.data || error.message);
  }
}

if (code) getToken();