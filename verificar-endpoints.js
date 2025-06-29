const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verificarEndpoints() {
  console.log('🔍 Verificando quais endpoints estão disponíveis...\n');
  
  const endpoints = [
    '/produtos',
    '/pedidos/vendas', 
    '/pedidos/compras',
    '/pedidocompra',
    '/pedido-compra',
    '/pedidos',
    '/estoques',
    '/movimentacoes-estoque',
    '/contatos',
    '/situacoes'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📡 Testando: ${endpoint}`);
    
    try {
      await delay(1500);
      
      const response = await axios.get(`${BASE_URL}${endpoint}?limite=1`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`   ✅ ${endpoint} - Status: ${response.status} - Funcionando!`);
      
    } catch (error) {
      const status = error.response?.status;
      const errorType = error.response?.data?.error?.type;
      
      if (status === 404) {
        console.log(`   ❌ ${endpoint} - 404 - Endpoint não existe`);
      } else if (status === 403) {
        console.log(`   🔒 ${endpoint} - 403 - Sem permissão`);
      } else if (status === 401) {
        console.log(`   🔐 ${endpoint} - 401 - Token inválido`);
      } else {
        console.log(`   ⚠️ ${endpoint} - ${status} - ${errorType || 'Erro'}`);
      }
    }
  }
  
  // Teste especial: verificar se existe endpoint de movimentação
  console.log('\n🔄 Testando endpoints de movimentação...');
  
  const movimentacaoEndpoints = [
    '/estoque/movimentacoes',
    '/movimentacao-estoque', 
    '/movimentacoes',
    '/estoque'
  ];
  
  for (const endpoint of movimentacaoEndpoints) {
    console.log(`📡 Testando: ${endpoint}`);
    
    try {
      await delay(1500);
      
      const response = await axios.get(`${BASE_URL}${endpoint}?limite=1`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`   ✅ ${endpoint} - Funcionando!`);
      
    } catch (error) {
      const status = error.response?.status;
      console.log(`   ❌ ${endpoint} - ${status} - ${error.response?.data?.error?.type || 'Não disponível'}`);
    }
  }
}

verificarEndpoints();