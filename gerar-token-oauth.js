// Gerar token OAuth via linha de comando
const axios = require('axios');

const CLIENT_ID = '03a8de4a6ecb737e41e0df0c47832cb94384907f';
const CLIENT_SECRET = 'fb0bd52ff4f655102027caf8801be04eafc4dd7b85a44c60b603404d6220';
const REDIRECT_URI = 'https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback';

async function gerarTokenOAuth() {
  console.log('🔑 GERADOR DE TOKEN OAUTH - BLING API v3\n');
  
  // Passo 1: Mostrar URL de autorização
  const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&state=f22ce9203099c266c4df7ea089ad0c01`;
  
  console.log('📋 PASSO 1: AUTORIZAR APLICAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 Acesse este link no seu navegador:');
  console.log(authUrl);
  console.log('\n📝 Depois de autorizar, você será redirecionado para uma URL como:');
  console.log('https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback?code=ABC123...');
  console.log('\n✂️ COPIE APENAS O CÓDIGO (a parte depois de code=)');
  console.log('\n⏳ Aguardando você inserir o código...\n');
  
  // Aguardar entrada do usuário
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('📝 Cole o código aqui: ', async (codigo) => {
      rl.close();
      
      if (!codigo || codigo.trim() === '') {
        console.log('❌ Código não fornecido!');
        process.exit(1);
      }
      
      console.log('\n🔄 PASSO 2: TROCANDO CÓDIGO POR TOKEN');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      try {
        // Passo 2: Trocar código por token
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const tokenData = {
          grant_type: 'authorization_code',
          code: codigo.trim(),
          redirect_uri: REDIRECT_URI
        };
        
        console.log('🚀 Enviando requisição para o Bling...');
        console.log('📋 Dados:', JSON.stringify(tokenData, null, 2));
        
        const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', tokenData, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('\n🎉 TOKEN GERADO COM SUCESSO!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 Access Token:', response.data.access_token);
        console.log('⏰ Expires in:', response.data.expires_in, 'segundos');
        console.log('🔄 Refresh Token:', response.data.refresh_token);
        
        // Testar o token imediatamente
        console.log('\n🧪 TESTANDO TOKEN...');
        await testarToken(response.data.access_token);
        
        // Salvar em arquivo para uso posterior
        const fs = require('fs');
        const tokenInfo = {
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
          refresh_token: response.data.refresh_token,
          created_at: new Date().toISOString()
        };
        
        fs.writeFileSync('token-oauth.json', JSON.stringify(tokenInfo, null, 2));
        console.log('\n💾 Token salvo em: token-oauth.json');
        
        resolve(response.data.access_token);
        
      } catch (error) {
        console.log('\n❌ ERRO AO GERAR TOKEN:');
        console.log('Status:', error.response?.status);
        console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
        process.exit(1);
      }
    });
  });
}

async function testarToken(token) {
  try {
    console.log('📦 Testando buscar produtos...');
    
    const response = await axios.get('https://www.bling.com.br/Api/v3/produtos?limite=3', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ TOKEN FUNCIONANDO!');
    console.log('📊 Produtos encontrados:', response.data?.data?.length || 0);
    
    if (response.data?.data?.length > 0) {
      console.log('🏷️ Primeiro produto:', response.data.data[0].nome);
    }
    
    // Testar endpoint de pedidos de compra
    console.log('\n🛒 Testando endpoint de pedidos de compra...');
    try {
      const pedidosResp = await axios.get('https://www.bling.com.br/Api/v3/pedidos/compras?limite=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('✅ Endpoint /pedidos/compras acessível!');
    } catch (pedidoError) {
      if (pedidoError.response?.status === 401) {
        console.log('❌ Sem permissão para pedidos de compra');
      } else {
        console.log('✅ Endpoint /pedidos/compras existe! Status:', pedidoError.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar token:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Iniciar processo
gerarTokenOAuth();