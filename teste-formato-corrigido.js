const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function testeFormatoCorrigido() {
  console.log('🧪 TESTANDO FORMATO CORRIGIDO DO PEDIDO\n');
  
  const headers = {
    'Authorization': TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Simular o formato que o código corrigido vai usar
  const movements = [{
    produto: { codigo: '7893595543020' },
    quantidade: 1,
    observacoes: 'Transferência automática - 100% WHEY PROTEIN ULTRA PREMIUM - REFIL - 900G - PRONUTRI SABOR:CHOCOLATE'
  }];
  
  // Simular o item processado (como seria no código real)
  const itens = [{
    produto: {
      id: 16495719981 // ID do produto encontrado
    },
    quantidade: 1,
    valor: 0.01
  }];
  
  const pedidoCompra = {
    idContato: 17501595782, // Formato correto testado
    itens: itens.map(item => ({
      produto: item.produto,
      quantidade: item.quantidade,
      valor: item.valor,
      descricao: `Transferência - ${movements.find(m => 
        (m.produto.codigo === item.produto.codigo) || 
        (item.produto.id && m.produto.codigo)
      )?.observacoes || 'Produto transferido automaticamente'}`
    })),
    observacoes: movements[0]?.observacoes || "Transferência automática entre lojas",
    dataPrevisao: new Date().toISOString().split('T')[0]
  };
  
  console.log('📋 Dados do pedido (formato corrigido):');
  console.log(JSON.stringify(pedidoCompra, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, { headers });
    
    console.log('\n🎉 SUCESSO! FORMATO CORRIGIDO FUNCIONANDO!');
    console.log('📋 ID do pedido:', response.data.data?.id);
    console.log('📋 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    console.log('\n✅ INTEGRAÇÃO FUNCIONANDO 100%!');
    console.log('🚀 Pronto para deploy da correção!');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ AINDA TEM ERRO:');
    console.log('Status:', error.response?.status);
    console.log('Erro completo:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.error?.fields) {
      console.log('\n🔧 Campos com problema:');
      error.response.data.error.fields.forEach(field => {
        console.log(`- ${field.element}: ${field.msg}`);
      });
    }
    
    return false;
  }
}

testeFormatoCorrigido();