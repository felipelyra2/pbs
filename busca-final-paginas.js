const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscaFinalPaginas() {
  console.log('🔍 CONTINUANDO BUSCA - PÁGINAS FINAIS (35-41)\n');
  console.log('📋 Procurando por: 7895140757357');
  
  const codigoProcurado = '7895140757357';
  let encontrado = false;
  
  // Continuar da página 35 até 41
  for (let pagina = 35; pagina <= 41; pagina++) {
    console.log(`📄 Página ${pagina}/41 (${Math.round((pagina/41)*100)}%)...`);
    
    try {
      await delay(1500); // 1.5 segundos entre requests
      
      const response = await axios.get(`${BASE_URL}/produtos?limite=100&pagina=${pagina}`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      console.log(`   📦 ${produtos.length} produtos nesta página`);
      
      // Verificar cada produto
      for (let i = 0; i < produtos.length; i++) {
        const produto = produtos[i];
        
        if (produto.codigo === codigoProcurado) {
          console.log('\n🎯 PRODUTO ENCONTRADO!');
          console.log(`Nome: ${produto.nome}`);
          console.log(`Código: ${produto.codigo}`);
          console.log(`ID: ${produto.id}`);
          console.log(`Página: ${pagina}`);
          console.log(`Posição na página: ${i + 1}`);
          
          encontrado = true;
          
          // Testar imediatamente
          await testarProdutoEncontrado(produto);
          return produto;
        }
        
        // Mostrar produtos com códigos similares
        if (produto.codigo && produto.codigo.startsWith('789514075')) {
          console.log(`   🔍 Similar: ${produto.nome} (${produto.codigo})`);
        }
      }
      
      // Se página tem menos de 100, é a última
      if (produtos.length < 100) {
        console.log(`\n📄 Última página real: ${pagina} (${produtos.length} produtos)`);
        break;
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('   ⏸️ Rate limit - aguardando...');
        await delay(5000);
        continue;
      }
      
      console.error(`   ❌ Erro página ${pagina}:`, error.response?.status);
      break;
    }
  }
  
  if (!encontrado) {
    console.log('\n❌ Produto 7895140757357 NÃO ENCONTRADO nas páginas 35-41');
    console.log('\n🤔 POSSIBILIDADES:');
    console.log('1. Produto pode estar nas páginas 1-34 que já verificamos');
    console.log('2. Produto pode ter código ligeiramente diferente');
    console.log('3. Produto pode estar inativo na API');
    console.log('4. Diferença entre painel web e API');
    
    // Fazer uma busca específica por nome como último recurso
    console.log('\n🔍 ÚLTIMA TENTATIVA: Busca por nome...');
    await buscaPorNomeUltimaTentativa();
  }
  
  return null;
}

async function buscaPorNomeUltimaTentativa() {
  const termosNome = [
    'WHEY PROTEIN ULTRA PREMIUM',
    'WHEY PROTEIN ULTRA',
    'PRONUTRI CHOCOLATE',
    'ULTRA PREMIUM CHOCOLATE',
    'REFIL 900G CHOCOLATE'
  ];
  
  for (const termo of termosNome) {
    console.log(`🔍 Buscando: "${termo}"`);
    
    try {
      await delay(2000);
      
      const response = await axios.get(`${BASE_URL}/produtos?criterio=${encodeURIComponent(termo)}&limite=50`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      console.log(`   📦 ${produtos.length} produtos encontrados`);
      
      produtos.forEach(produto => {
        if (produto.nome && produto.nome.toUpperCase().includes('WHEY') && 
            produto.nome.toUpperCase().includes('ULTRA') &&
            produto.nome.toUpperCase().includes('CHOCOLATE')) {
          console.log(`   🔍 Candidato: ${produto.nome} (${produto.codigo || 'SEM CÓDIGO'})`);
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.response?.status}`);
    }
  }
}

async function testarProdutoEncontrado(produto) {
  console.log('\n🧪 TESTANDO PRODUTO ENCONTRADO...');
  
  try {
    await delay(2000);
    
    const pedidoCompra = {
      contato: {
        id: 17501595782
      },
      itens: [{
        produto: {
          id: produto.id
        },
        quantidade: 1,
        valor: 0.01,
        descricao: `Transferência - ${produto.nome}`
      }],
      observacoes: `ENCONTRADO! ${produto.nome}`,
      dataPrevisao: new Date().toISOString().split('T')[0]
    };
    
    const response = await axios.post(`${BASE_URL}/pedidos/compras`, pedidoCompra, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('🎉 SUCESSO! PRODUTO ENCONTRADO E TESTADO!');
    console.log('📋 Pedido criado:', response.data.data?.id);
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.response?.status);
  }
}

buscaFinalPaginas();