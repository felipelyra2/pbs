// Testar token em produção
const axios = require('axios');

const TOKEN = '0f97d01926287253e9fe58b9b0db80c3f184505c';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testToken() {
  console.log('🔍 Testando token no Bling...');
  
  try {
    console.log('🔗 URL completa:', `${BASE_URL}/produtos?limite=10`);
    console.log('🔑 Token usado:', TOKEN.substring(0, 20) + '...');
    
    // Testar diferentes formas de buscar produtos
    console.log('\n1️⃣ Testando SEM filtros:');
    const response1 = await axios.get(`${BASE_URL}/produtos`, {
      headers: {
        'access_token': TOKEN,
        'Accept': 'application/json'
      }
    });
    console.log('🔍 Sem filtros - Produtos:', response1.data?.data?.length || 0);
    console.log('📊 Resposta completa:', JSON.stringify(response1.data, null, 2).substring(0, 500) + '...');
    
    console.log('\n2️⃣ Testando com limite 50:');
    const response2 = await axios.get(`${BASE_URL}/produtos?limite=50`, {
      headers: {
        'access_token': TOKEN,
        'Accept': 'application/json'
      }
    });
    console.log('🔍 Limite 50 - Produtos:', response2.data?.data?.length || 0);
    
    const authResponse1 = response1;
    
    console.log('\n2️⃣ Testando com Authorization Bearer:');
    try {
      const authResponse2 = await axios.get(`${BASE_URL}/produtos?limite=10`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      });
      console.log('✅ Formato 2 - Produtos:', authResponse2.data?.data?.length || 0);
    } catch (err) {
      console.log('❌ Formato 2 falhou:', err.response?.status);
    }
    
    // Tentar buscar informações da empresa/usuário
    console.log('\n3️⃣ Testando outros endpoints para identificar a conta:');
    
    try {
      const contatos = await axios.get(`${BASE_URL}/contatos?limite=5`, {
        headers: {
          'access_token': TOKEN,
          'Accept': 'application/json'
        }
      });
      console.log('📞 Contatos encontrados:', contatos.data?.data?.length || 0);
    } catch (err) {
      console.log('❌ Erro ao buscar contatos:', err.response?.status);
    }
    
    try {
      const vendas = await axios.get(`${BASE_URL}/vendas?limite=5`, {
        headers: {
          'access_token': TOKEN,
          'Accept': 'application/json'
        }
      });
      console.log('💰 Vendas encontradas:', vendas.data?.data?.length || 0);
    } catch (err) {
      console.log('❌ Erro ao buscar vendas:', err.response?.status);
    }
    
    // Usar a resposta que funcionou
    const authResponse = authResponse1;
    
    console.log('✅ Token válido!');
    console.log('📊 Produtos encontrados:', authResponse.data?.data?.length || 0);
    
    // Listar alguns produtos para ver códigos reais
    if (authResponse.data?.data?.length > 0) {
      console.log('🔍 Produtos no Bling:');
      authResponse.data.data.forEach((produto, index) => {
        if (index < 3) { // Mostrar apenas os primeiros 3
          console.log(`  - ${produto.nome} (Código: ${produto.codigo})`);
        }
      });
    }
    
    // Testar criação de movimentação (exemplo)
    const testMovement = {
      produto: {
        codigo: '7898100848355' // Código de exemplo - substitua por um código real
      },
      quantidade: 1,
      tipo: 'E',
      observacoes: 'Teste de movimentação via API'
    };
    
    console.log('🧪 Testando criação de movimentação...');
    console.log('Dados:', JSON.stringify(testMovement, null, 2));
    
    const movResponse = await axios.post(`${BASE_URL}/estoque/movimentacao`, testMovement, {
      headers: {
        'access_token': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Movimentação criada com sucesso!');
    console.log('📋 Resposta:', JSON.stringify(movResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testToken();