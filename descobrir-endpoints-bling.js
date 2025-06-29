// Descobrir endpoints corretos da API v3 do Bling
const axios = require('axios');

const BASE_URL = 'https://www.bling.com.br/Api/v3';

// Lista de endpoints possíveis para testar
const endpoints = [
  // Produtos
  { path: '/produtos', method: 'GET', desc: 'Listar produtos' },
  
  // Estoque - possíveis endpoints
  { path: '/estoques', method: 'GET', desc: 'Estoques' },
  { path: '/estoque', method: 'GET', desc: 'Estoque singular' },
  { path: '/estoques/movimentacoes', method: 'GET', desc: 'Movimentações de estoque' },
  { path: '/estoque/movimentacoes', method: 'GET', desc: 'Movimentações de estoque (singular)' },
  { path: '/movimentacoes', method: 'GET', desc: 'Movimentações gerais' },
  { path: '/movimentacoes/estoque', method: 'GET', desc: 'Movimentações de estoque' },
  
  // Inventário
  { path: '/inventarios', method: 'GET', desc: 'Inventários' },
  { path: '/inventario', method: 'GET', desc: 'Inventário singular' },
  
  // Entradas/Saídas
  { path: '/entradas', method: 'GET', desc: 'Entradas' },
  { path: '/saidas', method: 'GET', desc: 'Saídas' },
  { path: '/lancamentos', method: 'GET', desc: 'Lançamentos' },
  
  // Pedidos (que sabemos que funcionam)
  { path: '/pedidos/compras', method: 'GET', desc: 'Pedidos de compra' },
  { path: '/pedidos/vendas', method: 'GET', desc: 'Pedidos de venda' },
  
  // Contatos
  { path: '/contatos', method: 'GET', desc: 'Contatos' },
  
  // Outros
  { path: '/situacoes', method: 'GET', desc: 'Situações' },
  { path: '/categorias', method: 'GET', desc: 'Categorias' },
  { path: '/depositos', method: 'GET', desc: 'Depósitos' }
];

async function descobrirEndpoints() {
  console.log('🔍 Descobrindo endpoints da API v3 do Bling...\n');
  console.log('📋 Testando endpoints sem autenticação para descobrir quais existem:\n');
  
  const existentes = [];
  const naoExistentes = [];
  const precisamAuth = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.path}?limite=1`, {
        validateStatus: () => true // Não lançar erro para qualquer status
      });
      
      const status = response.status;
      
      if (status === 200) {
        console.log(`✅ ${endpoint.path} - ${endpoint.desc} - FUNCIONA (200)`);
        existentes.push(endpoint);
      } else if (status === 401) {
        console.log(`🔐 ${endpoint.path} - ${endpoint.desc} - EXISTE mas precisa auth (401)`);
        precisamAuth.push(endpoint);
      } else if (status === 404) {
        console.log(`❌ ${endpoint.path} - ${endpoint.desc} - NÃO EXISTE (404)`);
        naoExistentes.push(endpoint);
      } else {
        console.log(`⚠️  ${endpoint.path} - ${endpoint.desc} - Status: ${status}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log(`🌐 ${endpoint.path} - ${endpoint.desc} - ERRO DE REDE`);
      } else {
        console.log(`⚡ ${endpoint.path} - ${endpoint.desc} - ERRO: ${error.message}`);
      }
    }
  }
  
  // Resumo
  console.log('\n📊 RESUMO DOS ENDPOINTS:');
  console.log(`✅ Funcionam sem auth: ${existentes.length}`);
  console.log(`🔐 Existem mas precisam auth: ${precisamAuth.length}`);
  console.log(`❌ Não existem: ${naoExistentes.length}\n`);
  
  if (precisamAuth.length > 0) {
    console.log('🔐 ENDPOINTS QUE PRECISAM DE AUTENTICAÇÃO:');
    precisamAuth.forEach(ep => {
      console.log(`   ${ep.path} - ${ep.desc}`);
    });
  }
  
  if (naoExistentes.length > 0) {
    console.log('\n❌ ENDPOINTS QUE NÃO EXISTEM:');
    naoExistentes.forEach(ep => {
      console.log(`   ${ep.path} - ${ep.desc}`);
    });
  }
  
  // Teste específico para movimentação
  console.log('\n🎯 TESTE ESPECÍFICO PARA MOVIMENTAÇÃO:');
  console.log('Baseado nos resultados, para movimentar estoque use:');
  
  if (precisamAuth.some(ep => ep.path.includes('moviment') || ep.path.includes('estoque'))) {
    console.log('✅ Encontrados endpoints de movimentação - precisam de token válido');
  } else {
    console.log('⚠️  Não encontrados endpoints diretos de movimentação');
    console.log('💡 Use /pedidos/compras para entrada e /pedidos/vendas para saída');
  }
}

descobrirEndpoints();