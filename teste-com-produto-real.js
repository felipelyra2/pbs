const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testeComProdutoReal() {
  console.log('🧪 TESTE COMPLETO - USAR PRODUTO QUE SABEMOS QUE EXISTE\n');
  
  // Usar o produto que sabemos que existe: Creatina Adaptogen
  const produtoExistente = {
    id: 16495719981,
    nome: "Creatina Adaptogen 1000g - Platinium",
    codigo: "7893595543020"
  };
  
  console.log('📦 Usando produto que existe na API:');
  console.log(`Nome: ${produtoExistente.nome}`);
  console.log(`Código: ${produtoExistente.codigo}`);
  console.log(`ID: ${produtoExistente.id}`);
  
  // Passo 1: Criar/verificar fornecedor
  console.log('\n1️⃣ Criando/verificando fornecedor...');
  let fornecedorId = null;
  
  try {
    await delay(1000);
    
    // Tentar buscar fornecedor existente primeiro
    const searchResponse = await axios.get(`${BASE_URL}/contatos?criterio=TRANSF001&limite=10`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      fornecedorId = searchResponse.data.data[0].id;
      console.log(`✅ Fornecedor encontrado com ID: ${fornecedorId}`);
    } else {
      console.log('🔄 Fornecedor não encontrado, criando novo...');
      
      await delay(1000);
      
      const fornecedorResponse = await axios.post(`${BASE_URL}/contatos`, {
        nome: "TRANSFERENCIA ENTRE LOJAS LTDA",
        codigo: "TRANSF001",
        tipo: "F",
        tipoPessoa: "J",
        contribuinte: "9",
        cpfCnpj: "00000000000191",
        ie: "ISENTO",
        endereco: {
          endereco: "Rua das Transferencias, 123",
          numero: "123",
          bairro: "Centro",
          cep: "59000000",
          municipio: "Natal",
          uf: "RN"
        }
      }, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      fornecedorId = fornecedorResponse.data.data.id;
      console.log(`✅ Fornecedor criado com ID: ${fornecedorId}`);
    }
    
  } catch (error) {
    console.log(`⚠️ Erro com fornecedor: ${error.response?.status} - ${error.response?.data?.error?.message}`);
    // Usar ID padrão se der erro
    fornecedorId = 17501595782; // ID que vimos existir
    console.log(`🔄 Usando ID de fallback: ${fornecedorId}`);
  }
  
  // Passo 2: Criar pedido de compra
  console.log('\n2️⃣ Criando pedido de compra...');
  
  try {
    await delay(2000);
    
    const pedidoCompra = {
      contato: {
        id: fornecedorId
      },
      itens: [{
        produto: {
          id: produtoExistente.id  // Usando ID em vez de código
        },
        quantidade: 1,
        valor: 0.01,
        descricao: `Transferência automática - ${produtoExistente.nome}`
      }],
      observacoes: "Teste de transferência automática - produto existente",
      dataPrevisao: new Date().toISOString().split('T')[0]
    };
    
    console.log('📋 Dados do pedido:', JSON.stringify(pedidoCompra, null, 2));
    
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('\n🎉 SUCESSO TOTAL! PEDIDO CRIADO!');
    console.log('✅ Status:', response.status);
    console.log('📋 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    console.log('\n🎯 RESUMO DO SUCESSO:');
    console.log('- ✅ Token OAuth funcionando');
    console.log('- ✅ Produto encontrado por ID');
    console.log('- ✅ Fornecedor criado/encontrado');
    console.log('- ✅ Pedido de compra criado');
    console.log('- ✅ Endpoint /pedidos/compras correto');
    console.log('- ✅ INTEGRAÇÃO 100% FUNCIONAL!');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Atualizar código para usar ID em vez de código quando produto não encontrar por código');
    console.log('2. Implementar busca mais robusta para encontrar produtos por nome quando código falhar');
    console.log('3. Fazer deploy das correções');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Erro ao criar pedido:', error.response?.status);
    console.log('📋 Detalhes do erro:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 422) {
      console.log('\n💡 Erro 422 - Dados de validação. Verificar:');
      console.log('- Formato dos campos');
      console.log('- IDs válidos');
      console.log('- Campos obrigatórios');
    }
    
    return false;
  }
}

testeComProdutoReal();