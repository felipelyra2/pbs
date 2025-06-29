// Script para testar a integração com a API v3 do Bling
// Para usar: node test-bling.js

const axios = require('axios');

// Configurações - substitua pelos seus valores
const CLIENT_ID = process.env.BLING_CLIENT_ID || 'seu_client_id';
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET || 'seu_client_secret';
const ACCESS_TOKEN = process.env.BLING_ACCESS_TOKEN || 'seu_access_token';

// URLs da API do Bling
const BLING_BASE_URL = 'https://www.bling.com.br/Api/v3';
const CALLBACK_URL = 'https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback';

console.log('🔍 Teste de Integração com Bling API v3\n');

// Função para testar autenticação (se houver token)
async function testAuth() {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === 'seu_access_token') {
    console.log('❌ Token de acesso não configurado');
    return false;
  }

  try {
    console.log('🔐 Testando autenticação...');
    // Usar endpoint de produtos com limite mínimo para testar auth
    // Testar diferentes formatos de autorização
    let authHeaders = [
      { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
      { 'Authorization': ACCESS_TOKEN },
      { 'access_token': ACCESS_TOKEN }
    ];
    
    for (let i = 0; i < authHeaders.length; i++) {
      try {
        console.log(`🔍 Tentando formato ${i + 1}:`, Object.keys(authHeaders[i])[0]);
        const response = await axios.get(`${BLING_BASE_URL}/produtos?limite=1`, {
          headers: {
            ...authHeaders[i],
            'Accept': 'application/json'
          }
        });
        
        console.log('✅ Formato funcionou:', Object.keys(authHeaders[i])[0]);
        return { success: true, response };
      } catch (error) {
        console.log(`❌ Formato ${i + 1} falhou:`, error.response?.data?.error?.type || error.message);
      }
    }
    
    throw new Error('Nenhum formato de auth funcionou');
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.response?.data || error.message);
    return false;
  }
}

// Função para testar busca de produtos
async function testProducts() {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === 'seu_access_token') {
    console.log('❌ Token necessário para buscar produtos');
    return;
  }

  try {
    console.log('📦 Testando busca de produtos...');
    const response = await axios.get(`${BLING_BASE_URL}/produtos?limite=5`, {
      headers: {
        'access_token': ACCESS_TOKEN,
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Busca de produtos funcionando!');
    console.log(`📊 Total de produtos: ${response.data?.data?.length || 0}`);
    
    if (response.data?.data?.length > 0) {
      const produto = response.data.data[0];
      console.log(`🎯 Primeiro produto: ${produto.nome} (${produto.codigo})`);
    }
  } catch (error) {
    console.log('❌ Erro ao buscar produtos:', error.response?.data || error.message);
  }
}

// Função para gerar URL de autorização OAuth
function generateAuthUrl() {
  if (!CLIENT_ID || CLIENT_ID === 'seu_client_id') {
    console.log('❌ Client ID não configurado');
    return;
  }

  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `${BLING_BASE_URL}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&state=${state}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}`;
  
  console.log('🔗 URL de autorização OAuth:');
  console.log(authUrl);
  console.log('\n💡 Copie esta URL no navegador para autorizar a aplicação');
}

// Função para testar troca de código por token
async function testTokenExchange(code) {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID === 'seu_client_id') {
    console.log('❌ Client ID e Secret necessários');
    return;
  }

  try {
    console.log('🔄 Testando troca de código por token...');
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(`${BLING_BASE_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: CALLBACK_URL
    }, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Token obtido com sucesso!');
    console.log('🎟️  Access Token:', response.data.access_token?.substring(0, 20) + '...');
    console.log('⏰ Expira em:', response.data.expires_in, 'segundos');
    
    return response.data.access_token;
  } catch (error) {
    console.log('❌ Erro ao obter token:');
    console.log('Status:', error.response?.status);
    console.log('StatusText:', error.response?.statusText);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
    return null;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes...\n');
  
  // Verificar configurações
  console.log('⚙️  Configurações:');
  console.log('🔑 Client ID:', CLIENT_ID !== 'seu_client_id' ? '✅ Configurado' : '❌ Não configurado');
  console.log('🔐 Client Secret:', CLIENT_SECRET !== 'seu_client_secret' ? '✅ Configurado' : '❌ Não configurado');
  console.log('🎟️  Access Token:', ACCESS_TOKEN !== 'seu_access_token' ? '✅ Configurado' : '❌ Não configurado');
  console.log('🌐 Callback URL:', CALLBACK_URL);
  console.log('');
  
  // Se não há token, gerar URL de auth
  if (!ACCESS_TOKEN || ACCESS_TOKEN === 'seu_access_token') {
    console.log('📝 Passo 1: Obter autorização OAuth');
    generateAuthUrl();
    console.log('\n💡 Após autorizar, use: node test-bling.js [codigo_recebido]');
    return;
  }
  
  // Testar autenticação
  const isAuthenticated = await testAuth();
  console.log('');
  
  if (isAuthenticated) {
    // Testar funcionalidades
    await testProducts();
    console.log('');
  }
  
  console.log('✨ Testes concluídos!');
}

// Executar testes
const args = process.argv.slice(2);
if (args[0]) {
  // Testar troca de código por token
  testTokenExchange(args[0]).then(token => {
    if (token) {
      console.log('\n💡 Configure este token como BLING_ACCESS_TOKEN e execute novamente os testes');
    }
  });
} else {
  runTests();
}