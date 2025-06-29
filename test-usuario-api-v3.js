// Teste com usuário API na v3
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testarUsuarioAPIv3() {
  console.log('🔑 Testando usuário API na v3...\n');
  
  try {
    // Testar diferentes formas de autenticação com usuário API na v3
    const headers1 = {
      'access_token': API_KEY,
      'Accept': 'application/json'
    };
    
    const headers2 = {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    };
    
    console.log('1️⃣ Testando com header access_token...');
    try {
      const response1 = await axios.get(`${BASE_URL}/produtos?limite=5`, { headers: headers1 });
      console.log('✅ access_token funcionou!');
      console.log('📦 Produtos encontrados:', response1.data?.data?.length || 0);
      
      if (response1.data?.data?.length > 0) {
        const produto = response1.data.data[0];
        console.log(`   - ${produto.nome} (${produto.codigo})`);
        
        // Testar criar pedido de compra
        await testarPedidoCompra(produto.codigo, produto.nome, headers1);
      }
      
      return;
    } catch (err) {
      console.log('❌ access_token falhou:', err.response?.status);
    }
    
    console.log('\n2️⃣ Testando com Authorization Bearer...');
    try {
      const response2 = await axios.get(`${BASE_URL}/produtos?limite=5`, { headers: headers2 });
      console.log('✅ Authorization Bearer funcionou!');
      console.log('📦 Produtos encontrados:', response2.data?.data?.length || 0);
      
      if (response2.data?.data?.length > 0) {
        const produto = response2.data.data[0];
        console.log(`   - ${produto.nome} (${produto.codigo})`);
        
        // Testar criar pedido de compra
        await testarPedidoCompra(produto.codigo, produto.nome, headers2);
      }
      
      return;
    } catch (err) {
      console.log('❌ Authorization Bearer falhou:', err.response?.status);
    }
    
    console.log('\n3️⃣ Testando com query parameter...');
    try {
      const response3 = await axios.get(`${BASE_URL}/produtos?limite=5&access_token=${API_KEY}`);
      console.log('✅ Query parameter funcionou!');
      console.log('📦 Produtos encontrados:', response3.data?.data?.length || 0);
    } catch (err) {
      console.log('❌ Query parameter falhou:', err.response?.status);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function testarPedidoCompra(codigoProduto, nomeProduto, headers) {
  console.log('\n🛒 Testando criação de pedido de compra...');
  
  try {
    const pedidoCompra = {
      fornecedor: {
        nome: "FORNECEDOR TESTE API USUARIO",
        codigo: "TESTAPI001",
        tipoPessoa: "J",
        contribuinte: "9",
        cpfCnpj: "11222333000144",
        ie: "ISENTO",
        endereco: {
          endereco: "Rua do Teste, 123",
          numero: "123",
          bairro: "Centro",
          cep: "01000000",
          municipio: "São Paulo",
          uf: "SP"
        }
      },
      itens: [
        {
          produto: {
            codigo: codigoProduto
          },
          quantidade: 1,
          valor: 10.00
        }
      ],
      observacoes: `Teste de pedido de compra via usuário API - Produto: ${nomeProduto}`,
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6 // Em andamento
      }
    };
    
    console.log('📋 Dados do pedido:', JSON.stringify(pedidoCompra, null, 2));
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, { headers });
    
    console.log('\n🎉 SUCESSO! Pedido de compra criado com usuário API!');
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Erro ao criar pedido:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n🔑 PROBLEMA: Usuário API não tem permissão ou chave inválida');
    } else if (error.response?.status === 422) {
      console.log('\n📋 PROBLEMA: Dados do pedido inválidos - mas a autenticação funcionou!');
    }
  }
}

testarUsuarioAPIv3();