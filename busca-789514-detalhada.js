const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function busca789514Detalhada() {
  console.log('🔍 BUSCA DETALHADA - PRODUTOS COM CÓDIGO 789514\n');
  
  try {
    await delay(1000);
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=789514&limite=100`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const produtos = response.data.data || [];
    console.log(`📦 Total de produtos encontrados: ${produtos.length}`);
    console.log(`📋 Estrutura da resposta:`, JSON.stringify(response.data, null, 2));
    
    if (produtos.length > 0) {
      console.log('\n📋 LISTANDO TODOS OS PRODUTOS ENCONTRADOS:\n');
      
      produtos.forEach((produto, index) => {
        console.log(`${index + 1}. ${produto.nome}`);
        console.log(`   Código: ${produto.codigo || 'SEM CÓDIGO'}`);
        console.log(`   ID: ${produto.id}`);
        console.log(`   Situação: ${produto.situacao}`);
        console.log(`   Tipo: ${produto.tipo}`);
        console.log(`   Estoque: ${produto.estoque?.saldoVirtualTotal || 0}`);
        
        // Verificar se é o produto que procuramos
        if (produto.codigo === '7895140757357') {
          console.log('   🎯 ESTE É O PRODUTO QUE PROCURAMOS!');
        }
        
        // Verificar se tem códigos similares
        if (produto.codigo && produto.codigo.includes('789514075')) {
          console.log('   🔍 CÓDIGO SIMILAR ENCONTRADO!');
        }
        
        console.log('   ---');
      });
      
      // Procurar especificamente pelo código
      const produtoProcurado = produtos.find(p => p.codigo === '7895140757357');
      
      if (produtoProcurado) {
        console.log('\n🎉 PRODUTO ENCONTRADO!');
        console.log('Nome:', produtoProcurado.nome);
        console.log('Código:', produtoProcurado.codigo);
        console.log('ID:', produtoProcurado.id);
        
        // Testar criação de pedido imediatamente
        await testarPedidoComProdutoEncontrado(produtoProcurado);
        
      } else {
        console.log('\n❌ Produto 7895140757357 não encontrado na lista');
        
        // Mostrar produtos com códigos similares
        const produtosSimilares = produtos.filter(p => 
          p.codigo && p.codigo.includes('789514075')
        );
        
        if (produtosSimilares.length > 0) {
          console.log('\n🔍 Produtos com códigos similares:');
          produtosSimilares.forEach(p => {
            console.log(`- ${p.nome} (${p.codigo})`);
          });
        }
      }
      
    } else {
      console.log('❌ Nenhum produto retornado, mas a busca disse que encontrou 100');
    }
    
  } catch (error) {
    console.error('❌ Erro na busca:', error.response?.status, error.response?.data);
  }
}

async function testarPedidoComProdutoEncontrado(produto) {
  console.log('\n🛒 TESTANDO CRIAÇÃO DE PEDIDO COM PRODUTO ENCONTRADO...');
  
  try {
    await delay(2000);
    
    const pedidoCompra = {
      contato: {
        id: 17501595782 // ID do contato que vimos na resposta anterior
      },
      itens: [{
        produto: {
          codigo: produto.codigo
        },
        quantidade: 1,
        valor: 0.01,
        descricao: `Transferência - ${produto.nome}`
      }],
      observacoes: `Teste com produto encontrado: ${produto.nome}`,
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
    
    console.log('\n🎉 SUCESSO! PEDIDO CRIADO!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ INTEGRAÇÃO FUNCIONANDO 100%!');
    
  } catch (error) {
    console.log('\n❌ Erro ao criar pedido:', error.response?.status);
    console.log('Detalhes:', JSON.stringify(error.response?.data, null, 2));
  }
}

busca789514Detalhada();