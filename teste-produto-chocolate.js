const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testarProdutoChocolate() {
  console.log('🍫 Testando produto chocolate específico...\n');
  
  // Teste 1: Buscar por código exato
  console.log('1️⃣ Buscando por código exato: 7895140757357');
  try {
    await delay(1000); // 1 segundo de delay
    const response = await axios.get(`${BASE_URL}/produtos/${encodeURIComponent('7895140757357')}`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Produto encontrado por ID!');
    console.log('Produto:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Busca por ID falhou:', error.response?.status, error.response?.data?.error?.message);
  }

  // Teste 2: Buscar usando criterio com código
  console.log('\n2️⃣ Buscando usando critério...');
  try {
    await delay(2000); // 2 segundos de delay
    const response = await axios.get(`${BASE_URL}/produtos?criterio=${encodeURIComponent('7895140757357')}&limite=10`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Busca por critério funcionou!');
    console.log(`📦 Produtos encontrados: ${response.data.data?.length || 0}`);
    
    if (response.data.data) {
      response.data.data.forEach(produto => {
        console.log(`Nome: ${produto.nome}`);
        console.log(`Código: ${produto.codigo}`);
        console.log(`ID: ${produto.id}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.log('❌ Busca por critério falhou:', error.response?.status, error.response?.data?.error?.message);
  }

  // Teste 3: Criar pedido de compra com o produto
  console.log('\n3️⃣ Testando criação de pedido de compra...');
  try {
    await delay(2000); // 2 segundos de delay
    
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
          codigo: "7895140757357"
        },
        quantidade: 1,
        valor: 0.01
      }],
      observacoes: "Teste de transferência automática - produto chocolate",
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
    
    console.log('✅ Pedido criado com sucesso!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Criação de pedido falhou:', error.response?.status);
    console.log('Erro completo:', JSON.stringify(error.response?.data, null, 2));
  }
}

testarProdutoChocolate();