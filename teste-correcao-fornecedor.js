const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testeCorrecaoFornecedor() {
  console.log('🔧 TESTANDO CORREÇÃO DO FORNECEDOR\n');
  
  const headers = {
    'Authorization': TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Primeiro, vamos criar um fornecedor válido
  console.log('1️⃣ Criando fornecedor específico...');
  
  const dadosFornecedor = {
    nome: "TRANSFERENCIA LOJAS LTDA",
    codigo: "FORNEC001",
    tipo: "F", // IMPORTANTE: Tipo Fornecedor
    tipoPessoa: "J",
    contribuinte: "9",
    cpfCnpj: "12345678000123", // CNPJ diferente
    ie: "ISENTO",
    endereco: {
      endereco: "Rua das Transferencias, 456",
      numero: "456",
      bairro: "Centro",
      cep: "59000000",
      municipio: "Natal",
      uf: "RN"
    }
  };
  
  let fornecedorId = null;
  
  try {
    const response = await axios.post(`${BASE_URL}/contatos`, dadosFornecedor, { headers });
    fornecedorId = response.data.data.id;
    console.log(`✅ Fornecedor criado com ID: ${fornecedorId}`);
    
  } catch (error) {
    console.log('⚠️ Erro ao criar fornecedor (pode já existir):', error.response?.data?.error?.message);
    
    // Tentar buscar fornecedor existente
    try {
      const searchResponse = await axios.get(`${BASE_URL}/contatos?criterio=FORNEC001&limite=10`, { headers });
      
      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        fornecedorId = searchResponse.data.data[0].id;
        console.log(`✅ Fornecedor encontrado com ID: ${fornecedorId}`);
      }
    } catch (searchError) {
      console.log('❌ Erro ao buscar fornecedor');
    }
  }
  
  if (!fornecedorId) {
    console.log('❌ Não foi possível obter ID do fornecedor');
    return;
  }
  
  // Agora testar diferentes formatos de pedido
  console.log('\n2️⃣ Testando pedido com fornecedor correto...');
  
  // Teste 1: Usando idContato direto
  console.log('\n📝 Teste 1: Campo idContato direto');
  const pedido1 = {
    idContato: fornecedorId,
    itens: [{
      produto: {
        id: 16495719981
      },
      quantidade: 1,
      valor: 1.00,
      descricao: "Transferência automática"
    }],
    observacoes: "Teste com idContato direto",
    dataPrevisao: new Date().toISOString().split('T')[0]
  };
  
  await testarPedido(pedido1, headers, '1 - idContato direto');
  
  // Teste 2: Usando objeto contato
  console.log('\n📝 Teste 2: Objeto contato');
  const pedido2 = {
    contato: {
      id: fornecedorId
    },
    itens: [{
      produto: {
        id: 16495719981
      },
      quantidade: 1,
      valor: 1.00,
      descricao: "Transferência automática"
    }],
    observacoes: "Teste com objeto contato",
    dataPrevisao: new Date().toISOString().split('T')[0]
  };
  
  await testarPedido(pedido2, headers, '2 - objeto contato');
  
  // Teste 3: Formato mais completo
  console.log('\n📝 Teste 3: Formato completo');
  const pedido3 = {
    contato: {
      id: fornecedorId
    },
    itens: [{
      produto: {
        id: 16495719981
      },
      quantidade: 1,
      valor: 1.00,
      descricao: "Transferência automática",
      unidade: "UN"
    }],
    observacoes: "Teste formato completo",
    dataPrevisao: new Date().toISOString().split('T')[0],
    situacao: {
      valor: 1 // Em aberto
    }
  };
  
  await testarPedido(pedido3, headers, '3 - formato completo');
}

async function testarPedido(pedido, headers, descricao) {
  console.log(`📋 ${descricao}:`, JSON.stringify(pedido, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedido, { headers });
    console.log(`🎉 ${descricao}: SUCESSO!`);
    console.log(`📋 ID do pedido: ${response.data.data?.id}`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${descricao}: FALHOU`);
    console.log('Status:', error.response?.status);
    
    if (error.response?.data?.error?.fields) {
      console.log('Campos com problema:');
      error.response.data.error.fields.forEach(field => {
        console.log(`  - ${field.element}: ${field.msg}`);
      });
    } else {
      console.log('Erro:', error.response?.data?.error?.message || 'Desconhecido');
    }
    return false;
  }
}

testeCorrecaoFornecedor();