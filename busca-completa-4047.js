const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscaCompleta4047Produtos() {
  console.log('🔍 BUSCA COMPLETA - 4047 PRODUTOS TOTAL\n');
  console.log('📋 Procurando por: 7895140757357');
  console.log('⏱️ Estimativa: ~3-4 minutos (com delays para evitar rate limit)\n');
  
  const codigoProcurado = '7895140757357';
  let pagina = 1;
  let encontrado = false;
  let totalVerificados = 0;
  const produtosEncontrados = [];
  
  // Calcular número total de páginas: 4047 produtos ÷ 100 por página = ~41 páginas
  const totalPaginas = Math.ceil(4047 / 100);
  console.log(`📄 Total estimado de páginas: ${totalPaginas}\n`);
  
  while (pagina <= totalPaginas && !encontrado) {
    console.log(`📄 Página ${pagina}/${totalPaginas} (${Math.round((pagina/totalPaginas)*100)}%)...`);
    
    try {
      // Delay progressivo: mais delay conforme avança nas páginas
      const delayTime = 1500 + (pagina * 100); // 1.5s + 100ms por página
      await delay(delayTime);
      
      const response = await axios.get(`${BASE_URL}/produtos?limite=100&pagina=${pagina}`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      totalVerificados += produtos.length;
      
      console.log(`   📦 ${produtos.length} produtos verificados (Total: ${totalVerificados}/4047)`);
      
      // Verificar cada produto desta página
      for (const produto of produtos) {
        // Verificar código exato
        if (produto.codigo === codigoProcurado) {
          console.log('\n🎯 PRODUTO ENCONTRADO!');
          console.log(`Nome: ${produto.nome}`);
          console.log(`Código: ${produto.codigo}`);
          console.log(`ID: ${produto.id}`);
          console.log(`Página: ${pagina}`);
          console.log(`Posição: ${totalVerificados - produtos.length + produtos.indexOf(produto) + 1}`);
          
          produtosEncontrados.push(produto);
          encontrado = true;
          
          // Testar imediatamente
          await testarProdutoEncontrado(produto);
          break;
        }
        
        // Também procurar por códigos similares (família do produto)
        if (produto.codigo && produto.codigo.startsWith('789514075')) {
          console.log(`   🔍 Produto similar: ${produto.nome} (${produto.codigo})`);
          produtosEncontrados.push(produto);
        }
      }
      
      // Se esta página tem menos de 100 produtos, é a última
      if (produtos.length < 100) {
        console.log(`\n📄 Última página encontrada (${pagina}/${totalPaginas})`);
        break;
      }
      
      pagina++;
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('   ⏸️ Rate limit atingido - aguardando 10 segundos...');
        await delay(10000);
        continue; // Tentar a mesma página novamente
      }
      
      console.error(`   ❌ Erro na página ${pagina}:`, error.response?.status, error.response?.data?.error?.message);
      
      // Se for erro 401, parar (token expirou)
      if (error.response?.status === 401) {
        console.log('❌ Token expirado - parando busca');
        break;
      }
      
      // Para outros erros, tentar próxima página
      pagina++;
    }
  }
  
  console.log(`\n📊 RESUMO DA BUSCA:`);
  console.log(`- Páginas verificadas: ${pagina - 1}/${totalPaginas}`);
  console.log(`- Produtos verificados: ${totalVerificados}/4047`);
  console.log(`- Produto exato encontrado: ${encontrado ? 'SIM' : 'NÃO'}`);
  console.log(`- Produtos similares: ${produtosEncontrados.length}`);
  
  if (produtosEncontrados.length > 0) {
    console.log('\n📋 PRODUTOS DA FAMÍLIA ENCONTRADOS:');
    produtosEncontrados.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome}`);
      console.log(`   Código: ${produto.codigo}`);
      console.log(`   ID: ${produto.id}`);
      console.log('   ---');
    });
  }
  
  if (!encontrado) {
    console.log('\n❌ Produto 7895140757357 não encontrado');
    console.log('💡 Possíveis causas:');
    console.log('- Produto pode estar inativo/arquivado');
    console.log('- Código pode estar diferente no sistema');
    console.log('- Produto pode estar em loja/depósito não acessível pela API');
  }
  
  return produtosEncontrados;
}

async function testarProdutoEncontrado(produto) {
  console.log('\n🧪 TESTANDO PRODUTO ENCONTRADO IMEDIATAMENTE...');
  
  try {
    await delay(3000);
    
    const pedidoCompra = {
      contato: {
        id: 17501595782 // ID que sabemos que existe
      },
      itens: [{
        produto: {
          id: produto.id
        },
        quantidade: 1,
        valor: 0.01,
        descricao: `Transferência - ${produto.nome}`
      }],
      observacoes: `SUCESSO! Produto encontrado: ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0]
    };
    
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('🎉 SUCESSO TOTAL! PRODUTO ENCONTRADO E PEDIDO CRIADO!');
    console.log('📋 ID do pedido:', response.data.data?.id);
    
  } catch (error) {
    console.log('❌ Erro ao testar produto:', error.response?.status);
    console.log('Mas o importante é que o produto foi ENCONTRADO!');
  }
}

// Executar busca completa
buscaCompleta4047Produtos();