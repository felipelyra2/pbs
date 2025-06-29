// Testar criação de movimentação específica
const axios = require('axios');

const TOKEN = 'b0dd86ae1f5827bcb42c461c0b85987473db3e8a';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testMovement() {
  console.log('🔍 Testando criação de movimentação...\n');
  
  // Primeiro, listar produtos para pegar um código real
  console.log('📦 Buscando produtos...');
  const produtos = await axios.get(`${BASE_URL}/produtos?limite=5`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json'
    }
  });
  
  console.log(`✅ ${produtos.data.data.length} produtos encontrados:`);
  produtos.data.data.forEach((produto, index) => {
    console.log(`  ${index + 1}. ${produto.nome} - Código: ${produto.codigo}`);
  });
  
  if (produtos.data.data.length === 0) {
    console.log('❌ Nenhum produto encontrado para testar');
    return;
  }
  
  // Usar o primeiro produto para teste
  const primeiroProduto = produtos.data.data[0];
  console.log(`\n🧪 Testando movimentação com: ${primeiroProduto.nome}`);
  
  const movimento = {
    produto: {
      codigo: primeiroProduto.codigo
    },
    quantidade: 1,
    tipo: 'E',
    observacoes: 'Teste de movimentação via API v3'
  };
  
  console.log('📋 Dados da movimentação:', JSON.stringify(movimento, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/estoque/movimentacao`, movimento, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Movimentação criada com sucesso!');
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro na criação da movimentação:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
  }
}

testMovement();