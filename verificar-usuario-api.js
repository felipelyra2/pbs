// Verificar se usuário API está funcionando
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';

async function verificarUsuarioAPI() {
  console.log('🔍 Verificando usuário API...\n');
  console.log('🔑 Chave:', API_KEY.substring(0, 20) + '...');
  
  // Testar diferentes endpoints e formatos
  const tests = [
    {
      name: 'Produtos v3 - access_token header',
      url: 'https://www.bling.com.br/Api/v3/produtos?limite=1',
      headers: { 'access_token': API_KEY, 'Accept': 'application/json' }
    },
    {
      name: 'Produtos v3 - Authorization Bearer',
      url: 'https://www.bling.com.br/Api/v3/produtos?limite=1', 
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
    },
    {
      name: 'Produtos v3 - query param',
      url: `https://www.bling.com.br/Api/v3/produtos?limite=1&access_token=${API_KEY}`,
      headers: { 'Accept': 'application/json' }
    },
    {
      name: 'Contatos v3',
      url: 'https://www.bling.com.br/Api/v3/contatos?limite=1',
      headers: { 'access_token': API_KEY, 'Accept': 'application/json' }
    },
    {
      name: 'Depositos v3',
      url: 'https://www.bling.com.br/Api/v3/depositos?limite=1',
      headers: { 'access_token': API_KEY, 'Accept': 'application/json' }
    },
    {
      name: 'Empresas v3',
      url: 'https://www.bling.com.br/Api/v3/empresas?limite=1',
      headers: { 'access_token': API_KEY, 'Accept': 'application/json' }
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🧪 ${test.name}:`);
      
      const response = await axios.get(test.url, { headers: test.headers });
      
      console.log(`✅ SUCESSO - Status: ${response.status}`);
      
      if (response.data?.data) {
        console.log(`📊 Dados encontrados: ${response.data.data.length || 0} itens`);
        if (response.data.data.length > 0) {
          const item = response.data.data[0];
          console.log(`   Primeiro item: ${JSON.stringify(item).substring(0, 100)}...`);
        }
      } else {
        console.log('📊 Resposta:', JSON.stringify(response.data).substring(0, 200) + '...');
      }
      
    } catch (error) {
      const status = error.response?.status;
      const errorType = error.response?.data?.error?.type;
      const message = error.response?.data?.error?.message;
      
      console.log(`❌ FALHA - Status: ${status}`);
      console.log(`   Tipo: ${errorType}`);
      console.log(`   Msg: ${message}`);
    }
    
    console.log(''); // Linha em branco
  }
  
  // Verificar se a chave está no formato correto
  console.log('🔍 ANÁLISE DA CHAVE API:');
  console.log(`   Comprimento: ${API_KEY.length} caracteres`);
  console.log(`   Formato: ${/^[a-f0-9]+$/.test(API_KEY) ? 'Hexadecimal ✅' : 'Não hexadecimal ❌'}`);
  console.log(`   Primeiros 10: ${API_KEY.substring(0, 10)}`);
  console.log(`   Últimos 10: ${API_KEY.substring(-10)}`);
  
  // Dicas para resolver
  console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
  console.log('1. Verificar se usuário API está ativo no Bling');
  console.log('2. Confirmar permissões do usuário para cada módulo');
  console.log('3. Verificar se a chave foi copiada corretamente');
  console.log('4. Testar diretamente no Bling se o usuário consegue fazer login');
}

verificarUsuarioAPI();