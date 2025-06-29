const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findProductByCode(codigo) {
  try {
    console.log(`🔍 Buscando produto por código: ${codigo}`)
    
    await delay(1000); // Evitar rate limit
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=${encodeURIComponent(codigo)}&limite=100`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log(`📋 Resposta da busca: ${response.data.data?.length || 0} produtos encontrados`)
    
    if (response.data.data && response.data.data.length > 0) {
      // Mostrar os primeiros 5 produtos para debug
      console.log('\n📦 Primeiros produtos encontrados:');
      response.data.data.slice(0, 5).forEach((p, index) => {
        console.log(`${index + 1}. ${p.nome}`);
        console.log(`   Código: ${p.codigo || 'SEM CÓDIGO'}`);
        console.log(`   GTIN: ${p.gtin || 'SEM GTIN'}`);
        console.log(`   ID: ${p.id}`);
        console.log('   ---');
      });
      
      // Procurar produto com código exato
      const produtoExato = response.data.data.find(p => 
        p.codigo === codigo || p.gtin === codigo
      )
      
      if (produtoExato) {
        console.log(`\n✅ PRODUTO ENCONTRADO COM CÓDIGO EXATO!`)
        console.log(`Nome: ${produtoExato.nome}`)
        console.log(`Código: ${produtoExato.codigo}`)
        console.log(`GTIN: ${produtoExato.gtin}`)
        console.log(`ID: ${produtoExato.id}`)
        return produtoExato
      } else {
        console.log(`\n❌ Nenhum produto com código exato: ${codigo}`)
        
        // Verificar se algum produto tem o código no nome
        const produtoComCodigoNoNome = response.data.data.find(p => 
          p.nome && p.nome.includes(codigo)
        )
        
        if (produtoComCodigoNoNome) {
          console.log(`\n🔍 Produto encontrado com código no nome:`);
          console.log(`Nome: ${produtoComCodigoNoNome.nome}`)
          console.log(`Código: ${produtoComCodigoNoNome.codigo}`)
          console.log(`ID: ${produtoComCodigoNoNome.id}`)
          return produtoComCodigoNoNome
        }
      }
    }
    
    console.log(`❌ Produto não encontrado por código: ${codigo}`)
    return null
    
  } catch (error) {
    console.error(`❌ Erro ao buscar produto ${codigo}:`, error.response?.status, error.response?.data?.error?.message)
    return null
  }
}

async function testePedidoComProdutoEncontrado(produto) {
  if (!produto) {
    console.log('❌ Sem produto para testar pedido');
    return;
  }
  
  console.log('\n🛒 Testando criação de pedido com produto encontrado...');
  
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
          id: produto.id  // Usando ID em vez de código
        },
        quantidade: 1,
        valor: 0.01
      }],
      observacoes: `Teste com produto encontrado: ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6
      }
    };

    console.log('📋 Dados do pedido (usando ID):', JSON.stringify(pedidoCompra, null, 2));
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ PEDIDO CRIADO COM SUCESSO USANDO ID!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Falha ao criar pedido com ID:', error.response?.status);
    console.log('Erro:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function testarTudo() {
  console.log('🧪 TESTE COMPLETO DA BUSCA MELHORADA\n');
  
  // Teste 1: Buscar produto específico
  const produto = await findProductByCode('7895140757357');
  
  // Teste 2: Se encontrou, tentar criar pedido
  await testePedidoComProdutoEncontrado(produto);
}

testarTudo();