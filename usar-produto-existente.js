const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pegarProdutoWheyExistente() {
  console.log('🔍 Buscando produtos WHEY que existem na API...\n');
  
  try {
    await delay(2000);
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=WHEY&limite=20`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const produtos = response.data.data || [];
    console.log(`📋 ${produtos.length} produtos WHEY encontrados:\n`);
    
    produtos.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome}`);
      console.log(`   Código: ${produto.codigo || 'SEM CÓDIGO'}`);
      console.log(`   ID: ${produto.id}`);
      console.log('   ---');
    });
    
    // Pegar o primeiro produto com código válido
    const produtoComCodigo = produtos.find(p => p.codigo && p.codigo.trim() !== '');
    
    if (produtoComCodigo) {
      console.log(`\n✅ USANDO PRODUTO EXISTENTE PARA TESTE:`);
      console.log(`Nome: ${produtoComCodigo.nome}`);
      console.log(`Código: ${produtoComCodigo.codigo}`);
      console.log(`ID: ${produtoComCodigo.id}`);
      
      // Testar criação de pedido
      await testarPedidoComProduto(produtoComCodigo);
      
      return produtoComCodigo;
    } else {
      console.log('❌ Nenhum produto WHEY com código válido encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error?.message);
  }
}

async function testarPedidoComProduto(produto) {
  console.log('\n🛒 Testando criação de pedido de compra...');
  
  try {
    await delay(2000);
    
    const pedidoCompra = {
      fornecedor: {
        nome: "TRANSFERENCIA ENTRE LOJAS LTDA",
        codigo: "TRANSF001",
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
      },
      itens: [{
        produto: {
          codigo: produto.codigo  // Usando código do produto existente
        },
        quantidade: 1,
        valor: 0.01
      }],
      observacoes: `Teste com produto existente: ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6
      }
    };
    
    console.log('📋 Dados do pedido:', JSON.stringify(pedidoCompra, null, 2));
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('\n🎉 SUCESSO! PEDIDO CRIADO COM PRODUTO EXISTENTE!');
    console.log('Resposta completa:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ INTEGRAÇÃO FUNCIONANDO! Agora é só corrigir o código do produto problemático.');
    
  } catch (error) {
    console.log('❌ Erro ao criar pedido:', error.response?.status);
    console.log('Detalhes:', JSON.stringify(error.response?.data, null, 2));
  }
}

pegarProdutoWheyExistente();