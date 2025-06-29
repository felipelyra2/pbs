const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscaInteligenteProduto() {
  console.log('🔍 BUSCA INTELIGENTE - PRODUTO WHEY PROTEIN ULTRA CHOCOLATE\n');
  
  const termosParaBuscar = [
    '7895140757357',           // Código completo
    'WHEY PROTEIN ULTRA',      // Nome parcial
    'WHEY PROTEIN ULTRA PREMIUM', // Nome mais específico
    'PRONUTRI',                // Marca
    'CHOCOLATE',               // Sabor
    '7895140757',              // Parte do código
    '789514075',               // Parte menor do código
    'ULTRA PREMIUM',           // Parte do nome
    'REFIL 900G'               // Tamanho
  ];
  
  for (const termo of termosParaBuscar) {
    console.log(`🔍 Buscando por: "${termo}"`);
    
    try {
      await delay(2000); // Delay para evitar rate limit
      
      const response = await axios.get(`${BASE_URL}/produtos?criterio=${encodeURIComponent(termo)}&limite=50`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      console.log(`   📦 ${produtos.length} produtos encontrados`);
      
      // Verificar se algum produto corresponde
      for (const produto of produtos) {
        const matches = [];
        
        // Verificar código exato
        if (produto.codigo === '7895140757357') {
          matches.push('CÓDIGO EXATO');
        }
        
        // Verificar se tem WHEY e ULTRA no nome
        if (produto.nome && produto.nome.toUpperCase().includes('WHEY') && 
            produto.nome.toUpperCase().includes('ULTRA')) {
          matches.push('NOME WHEY ULTRA');
        }
        
        // Verificar se tem PRONUTRI no nome
        if (produto.nome && produto.nome.toUpperCase().includes('PRONUTRI')) {
          matches.push('MARCA PRONUTRI');
        }
        
        // Verificar se tem CHOCOLATE no nome
        if (produto.nome && produto.nome.toUpperCase().includes('CHOCOLATE')) {
          matches.push('SABOR CHOCOLATE');
        }
        
        // Verificar código similar
        if (produto.codigo && produto.codigo.includes('789514075')) {
          matches.push('CÓDIGO SIMILAR');
        }
        
        // Se tem pelo menos 2 matches, pode ser o produto
        if (matches.length >= 2) {
          console.log(`\n🎯 PRODUTO CANDIDATO ENCONTRADO!`);
          console.log(`Nome: ${produto.nome}`);
          console.log(`Código: ${produto.codigo}`);
          console.log(`ID: ${produto.id}`);
          console.log(`GTIN: ${produto.gtin || 'N/A'}`);
          console.log(`Matches: ${matches.join(', ')}`);
          console.log(`Termo de busca: "${termo}"`);
          
          // Se é exatamente o que procuramos, parar aqui
          if (produto.codigo === '7895140757357') {
            console.log('\n✅ PRODUTO EXATO ENCONTRADO!');
            return produto;
          }
        }
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('   ⏸️ Rate limit - aguardando...');
        await delay(5000);
        continue;
      }
      console.log(`   ❌ Erro: ${error.response?.status} - ${error.response?.data?.error?.message}`);
    }
  }
  
  console.log('\n❌ Produto não encontrado com nenhum termo de busca');
  
  // Última tentativa: buscar todos os produtos PRONUTRI
  console.log('\n🔍 Última tentativa: listando TODOS os produtos PRONUTRI...');
  await listarTodosProdutosPronutri();
}

async function listarTodosProdutosPronutri() {
  try {
    await delay(3000);
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=PRONUTRI&limite=100`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const produtos = response.data.data || [];
    console.log(`📋 ${produtos.length} produtos PRONUTRI encontrados:\n`);
    
    produtos.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome}`);
      console.log(`   Código: ${produto.codigo || 'SEM CÓDIGO'}`);
      console.log(`   ID: ${produto.id}`);
      console.log('   ---');
    });
    
    // Verificar se tem algum com código similar
    const produtoSimilar = produtos.find(p => 
      p.codigo && p.codigo.startsWith('789514075')
    );
    
    if (produtoSimilar) {
      console.log(`\n🎯 PRODUTO COM CÓDIGO SIMILAR ENCONTRADO:`);
      console.log(`Nome: ${produtoSimilar.nome}`);
      console.log(`Código: ${produtoSimilar.codigo}`);
      console.log(`ID: ${produtoSimilar.id}`);
      
      return produtoSimilar;
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar produtos PRONUTRI:', error.response?.status);
  }
  
  return null;
}

buscaInteligenteProduto();