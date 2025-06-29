const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscaPaginadaCompleta(codigoBuscar) {
  console.log(`🔍 BUSCA PAGINADA COMPLETA - Código: ${codigoBuscar}\n`);
  
  let pagina = 1;
  let encontrado = false;
  let totalVerificados = 0;
  
  while (pagina <= 20 && !encontrado) { // Máximo 20 páginas (2000 produtos)
    console.log(`📄 Página ${pagina}...`);
    
    try {
      await delay(2000); // 2 segundos entre requests
      
      const response = await axios.get(`${BASE_URL}/produtos?limite=100&pagina=${pagina}`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      totalVerificados += produtos.length;
      
      console.log(`   📦 ${produtos.length} produtos nesta página`);
      
      // Verificar cada produto desta página
      for (const produto of produtos) {
        if (produto.codigo === codigoBuscar || 
            produto.gtin === codigoBuscar ||
            (produto.nome && produto.nome.includes(codigoBuscar))) {
          
          console.log('\n🎯 PRODUTO ENCONTRADO!');
          console.log(`Nome: ${produto.nome}`);
          console.log(`Código: ${produto.codigo}`);
          console.log(`GTIN: ${produto.gtin}`);
          console.log(`ID: ${produto.id}`);
          console.log(`Página: ${pagina}`);
          
          // Testar criação de pedido imediatamente
          await testarPedidoComProduto(produto);
          
          encontrado = true;
          break;
        }
      }
      
      // Se esta página tem menos de 100 produtos, é a última
      if (produtos.length < 100) {
        console.log('\n📄 Última página encontrada');
        break;
      }
      
      pagina++;
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('⏸️ Rate limit - aguardando 5 segundos...');
        await delay(5000);
        continue; // Tentar a mesma página novamente
      }
      
      console.error(`❌ Erro na página ${pagina}:`, error.response?.status, error.response?.data?.error?.message);
      break;
    }
  }
  
  if (!encontrado) {
    console.log(`\n❌ Produto ${codigoBuscar} não encontrado em ${totalVerificados} produtos verificados`);
    
    // Última tentativa: busca por nome
    console.log('\n🔍 Última tentativa: busca por nome "WHEY PROTEIN ULTRA"...');
    await buscaPorNome('WHEY PROTEIN ULTRA');
  }
}

async function buscaPorNome(nome) {
  try {
    await delay(3000);
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=${encodeURIComponent(nome)}&limite=50`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const produtos = response.data.data || [];
    console.log(`📋 ${produtos.length} produtos encontrados com nome similar`);
    
    produtos.forEach((produto, index) => {
      if (produto.nome.includes('WHEY') && produto.nome.includes('ULTRA')) {
        console.log(`${index + 1}. ${produto.nome}`);
        console.log(`   Código: ${produto.codigo || 'SEM CÓDIGO'}`);
        console.log(`   ID: ${produto.id}`);
        console.log('   ---');
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na busca por nome:', error.response?.status, error.response?.data?.error?.message);
  }
}

async function testarPedidoComProduto(produto) {
  console.log('\n🛒 Testando criação de pedido...');
  
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
          id: produto.id
        },
        quantidade: 1,
        valor: 0.01
      }],
      observacoes: `Transferência automática - ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0],
      situacao: {
        valor: 6
      }
    };
    
    const response = await axios.post(`${BASE_URL}/pedidocompra`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ SUCESSO! PEDIDO CRIADO!');
    console.log('ID do pedido:', response.data.data?.id);
    console.log('🎉 INTEGRAÇÃO FUNCIONANDO PERFEITAMENTE!');
    
  } catch (error) {
    console.log('❌ Erro ao criar pedido:', error.response?.status);
    console.log('Detalhes:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Executar busca
buscaPaginadaCompleta('7895140757357');