// Teste com produto real
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

const headers = {
  'access_token': API_KEY,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function testarPedidoReal() {
  console.log('🛒 Testando pedido de compra com produto fictício...\n');
  
  try {
    // Usar um código de produto genérico para teste
    const pedidoCompra = {
      fornecedor: {
        nome: "FORNECEDOR TESTE MOVIMENTACAO",
        codigo: "TESTE001",
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
            codigo: "PRODUTO001" // Código de teste
          },
          quantidade: 1,
          valor: 10.00
        }
      ],
      observacoes: "Teste de movimentação de estoque via usuário API",
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6 // Em andamento
      }
    };
    
    console.log('📋 Dados do pedido:');
    console.log(JSON.stringify(pedidoCompra, null, 2));
    
    console.log('\n🚀 Enviando pedido para o Bling...');
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, { headers });
    
    console.log('\n🎉 SUCESSO TOTAL! Pedido criado!');
    console.log('📄 Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n📊 RESULTADO DO TESTE:');
    console.log('Status HTTP:', error.response?.status);
    
    if (error.response?.status === 422) {
      console.log('✅ EXCELENTE! Erro 422 = Endpoint funciona, dados inválidos');
      console.log('🔧 Isso significa que a integração está funcionando!');
      console.log('📋 Só precisa ajustar os dados do produto/fornecedor');
    } else if (error.response?.status === 401) {
      console.log('❌ Erro de autenticação - verificar usuário API');
    } else {
      console.log('⚠️ Outro erro - vamos investigar');
    }
    
    console.log('\n📄 Detalhes do erro:');
    console.log(JSON.stringify(error.response?.data, null, 2));
    
    // Analisar erros específicos
    if (error.response?.data?.error?.fields) {
      console.log('\n🔍 CAMPOS COM PROBLEMA:');
      Object.entries(error.response.data.error.fields).forEach(([campo, erros]) => {
        console.log(`   ${campo}: ${Array.isArray(erros) ? erros.join(', ') : erros}`);
      });
    }
  }
}

testarPedidoReal();