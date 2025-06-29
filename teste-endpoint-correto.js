const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testarEndpointCorreto() {
  console.log('🛒 Testando criação de pedido com endpoint correto...\n');
  
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
          codigo: "7893595543020"  // Produto que sabemos que existe
        },
        quantidade: 1,
        valor: 0.01
      }],
      observacoes: "Teste de transferência automática - endpoint correto",
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6
      }
    };
    
    console.log('📋 Dados do pedido:', JSON.stringify(pedidoCompra, null, 2));
    console.log('\n📡 Usando endpoint: /pedidos/compras');
    
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('\n🎉 FUNCIONOU! PEDIDO DE COMPRA CRIADO!');
    console.log('✅ Status:', response.status);
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
    
    console.log('\n🎯 PROBLEMA RESOLVIDO!');
    console.log('- Endpoint correto: /pedidos/compras');
    console.log('- Produto encontrado e usado com sucesso');
    console.log('- Integração funcionando 100%!');
    
  } catch (error) {
    console.log('❌ Erro:', error.response?.status);
    console.log('📋 Detalhes:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 422) {
      console.log('\n💡 Erro 422 - Dados inválidos. Vamos verificar o formato...');
    }
  }
}

testarEndpointCorreto();