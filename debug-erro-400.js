const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function debugErro400() {
  console.log('🔍 DEBUGANDO ERRO 400 NO PEDIDO DE COMPRA\n');
  
  const headers = {
    'Authorization': TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Primeiro, vamos verificar se já existe um fornecedor
  console.log('1️⃣ Verificando fornecedores existentes...');
  try {
    const response = await axios.get(`${BASE_URL}/contatos?limite=10`, { headers });
    
    console.log(`📋 ${response.data.data?.length || 0} contatos encontrados`);
    if (response.data.data && response.data.data.length > 0) {
      console.log('Primeiro contato:', {
        id: response.data.data[0].id,
        nome: response.data.data[0].nome,
        tipo: response.data.data[0].tipo
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error.response?.status, error.response?.data);
  }
  
  // Vamos tentar criar um pedido de compra simples
  console.log('\n2️⃣ Testando criação de pedido de compra simples...');
  
  const pedidoSimples = {
    contato: {
      id: 17501595782 // ID que sabemos que existe
    },
    itens: [{
      produto: {
        id: 16495719981 // ID do produto que sabemos que existe (Creatina)
      },
      quantidade: 1,
      valor: 0.01,
      descricao: "Teste de transferência"
    }],
    observacoes: "Teste de pedido de compra",
    dataPrevisao: new Date().toISOString().split('T')[0]
  };
  
  console.log('📋 Dados do pedido:', JSON.stringify(pedidoSimples, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoSimples, { headers });
    
    console.log('✅ SUCESSO! Pedido criado:', response.data);
    
  } catch (error) {
    console.log('❌ ERRO 400 - Detalhes:');
    console.log('Status:', error.response?.status);
    console.log('Dados do erro:', JSON.stringify(error.response?.data, null, 2));
    
    // Vamos tentar identificar o problema específico
    if (error.response?.data?.error?.fields) {
      console.log('\n🔧 CAMPOS COM PROBLEMAS:');
      error.response.data.error.fields.forEach(field => {
        console.log(`- ${field.element}: ${field.msg}`);
      });
    }
    
    // Vamos tentar variações do pedido
    await testarVariacoesPedido(headers);
  }
}

async function testarVariacoesPedido(headers) {
  console.log('\n3️⃣ Testando variações do pedido...');
  
  // Variação 1: Sem dataPrevisao
  console.log('\n📝 Variação 1: Sem dataPrevisao');
  const pedido1 = {
    contato: {
      id: 17501595782
    },
    itens: [{
      produto: {
        id: 16495719981
      },
      quantidade: 1,
      valor: 0.01,
      descricao: "Teste"
    }],
    observacoes: "Teste sem data"
  };
  
  await testarPedido(pedido1, headers, '1');
  
  // Variação 2: Com código em vez de ID
  console.log('\n📝 Variação 2: Com código do produto');
  const pedido2 = {
    contato: {
      id: 17501595782
    },
    itens: [{
      produto: {
        codigo: "7893595543020"
      },
      quantidade: 1,
      valor: 0.01,
      descricao: "Teste com código"
    }],
    observacoes: "Teste com código"
  };
  
  await testarPedido(pedido2, headers, '2');
  
  // Variação 3: Formato diferente dos itens
  console.log('\n📝 Variação 3: Formato simplificado');
  const pedido3 = {
    contato: {
      id: 17501595782
    },
    itens: [{
      produto: {
        id: 16495719981
      },
      quantidade: 1,
      valor: 1.00
    }],
    observacoes: "Teste simplificado"
  };
  
  await testarPedido(pedido3, headers, '3');
}

async function testarPedido(pedido, headers, numero) {
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedido, { headers });
    console.log(`✅ Variação ${numero}: SUCESSO!`);
    return true;
  } catch (error) {
    console.log(`❌ Variação ${numero}: FALHOU`);
    if (error.response?.data?.error?.fields) {
      error.response.data.error.fields.forEach(field => {
        console.log(`  - ${field.element}: ${field.msg}`);
      });
    } else {
      console.log(`  - Erro: ${error.response?.data?.error?.message || 'Desconhecido'}`);
    }
    return false;
  }
}

debugErro400();