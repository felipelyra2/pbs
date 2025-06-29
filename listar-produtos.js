// Listar produtos para testar com usuário API
const axios = require('axios');

const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

const headers = {
  'access_token': API_KEY,
  'Accept': 'application/json'
};

async function listarProdutos() {
  console.log('📦 Listando produtos no Bling...\n');
  
  try {
    // Buscar produtos
    console.log('🔍 Buscando produtos...');
    const response = await axios.get(`${BASE_URL}/produtos?limite=20`, { headers });
    
    console.log('✅ Requisição bem-sucedida!');
    console.log('📊 Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const produtos = response.data?.data || [];
    
    if (produtos.length === 0) {
      console.log('\n⚠️ Nenhum produto encontrado no Bling');
      console.log('💡 Isso pode significar:');
      console.log('   1. Não há produtos cadastrados');
      console.log('   2. Usuário API não tem permissão para ver produtos');
      console.log('   3. Filtros estão limitando os resultados');
      
      // Tentar sem limite
      console.log('\n🔍 Tentando buscar sem limite...');
      const response2 = await axios.get(`${BASE_URL}/produtos`, { headers });
      console.log('📊 Resposta sem limite:', JSON.stringify(response2.data, null, 2));
      
    } else {
      console.log(`\n📦 ${produtos.length} produtos encontrados:`);
      console.log('═══════════════════════════════════════');
      
      produtos.forEach((produto, index) => {
        console.log(`${index + 1}. ${produto.nome || produto.descricao || 'Sem nome'}`);
        console.log(`   Código: ${produto.codigo || 'Sem código'}`);
        console.log(`   Preço: R$ ${produto.preco || '0,00'}`);
        console.log(`   Estoque: ${produto.estoque || 'N/A'}`);
        console.log('   ───────────────────────────────');
      });
      
      // Usar o primeiro produto para testar pedido de compra
      const produtoTeste = produtos[0];
      console.log(`\n🧪 Usando produto "${produtoTeste.nome}" para teste de pedido...`);
      await testarPedidoComProdutoReal(produtoTeste);
    }
    
  } catch (error) {
    console.log('❌ Erro ao listar produtos:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Problema de autenticação');
    } else if (error.response?.status === 403) {
      console.log('\n🚫 Usuário sem permissão para produtos');
    }
  }
}

async function testarPedidoComProdutoReal(produto) {
  console.log('\n🛒 Testando pedido de compra com produto real...');
  
  try {
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
            codigo: produto.codigo
          },
          quantidade: 1,
          valor: produto.preco || 10.00
        }
      ],
      observacoes: `Teste de movimentação - Produto: ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6 // Em andamento
      }
    };
    
    console.log('📋 Dados do pedido:');
    console.log(JSON.stringify(pedidoCompra, null, 2));
    
    console.log('\n🚀 Criando pedido de compra...');
    
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    
    console.log('\n🎉 PEDIDO CRIADO COM SUCESSO!');
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n📊 Resultado do teste de pedido:');
    console.log('Status:', error.response?.status);
    
    if (error.response?.status === 422) {
      console.log('✅ Endpoint funciona! Erro 422 = dados inválidos');
      console.log('🔧 Campos com problema:');
      const fields = error.response?.data?.error?.fields || {};
      Object.entries(fields).forEach(([campo, erros]) => {
        console.log(`   ${campo}: ${Array.isArray(erros) ? erros.join(', ') : erros}`);
      });
    } else if (error.response?.status === 401) {
      console.log('❌ Sem permissão para pedidos de compra');
    } else {
      console.log('⚠️ Outro erro');
    }
    
    console.log('\n📄 Detalhes:', JSON.stringify(error.response?.data, null, 2));
  }
}

listarProdutos();