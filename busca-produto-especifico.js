const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';
const CODIGO_BUSCAR = '7895140757357';

async function buscarProdutoEspecifico() {
  console.log(`🔍 Buscando produto específico: ${CODIGO_BUSCAR}\n`);
  
  let pagina = 1;
  let encontrado = false;
  let totalProdutos = 0;
  
  while (pagina <= 10 && !encontrado) { // Buscar até 10 páginas (1000 produtos)
    console.log(`📄 Buscando página ${pagina}...`);
    
    try {
      const response = await axios.get(`${BASE_URL}/produtos?limite=100&pagina=${pagina}`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtos = response.data.data || [];
      totalProdutos += produtos.length;
      
      console.log(`   📦 ${produtos.length} produtos nesta página`);
      
      // Procurar pelo código específico
      const produtoEncontrado = produtos.find(produto => 
        produto.codigo === CODIGO_BUSCAR || 
        produto.gtin === CODIGO_BUSCAR ||
        produto.codigoItem === CODIGO_BUSCAR
      );
      
      if (produtoEncontrado) {
        console.log('\n🎯 PRODUTO ENCONTRADO!');
        console.log(`Nome: ${produtoEncontrado.nome}`);
        console.log(`Código: ${produtoEncontrado.codigo}`);
        console.log(`ID: ${produtoEncontrado.id}`);
        console.log(`EAN/GTIN: ${produtoEncontrado.gtin}`);
        console.log(`Código Item: ${produtoEncontrado.codigoItem}`);
        console.log(`Situação: ${produtoEncontrado.situacao?.descricao}`);
        encontrado = true;
        break;
      }
      
      // Se não há mais produtos, parar
      if (produtos.length < 100) {
        console.log('\n📄 Última página encontrada');
        break;
      }
      
      pagina++;
      
    } catch (error) {
      console.error(`❌ Erro na página ${pagina}:`, error.response?.status, error.response?.data);
      break;
    }
  }
  
  if (!encontrado) {
    console.log(`\n❌ Produto com código ${CODIGO_BUSCAR} NÃO ENCONTRADO`);
    console.log(`📊 Total de produtos verificados: ${totalProdutos}`);
    
    // Buscar produtos com nome similar
    console.log('\n🔍 Buscando produtos com nome similar "WHEY PROTEIN ULTRA"...');
    
    try {
      const response = await axios.get(`${BASE_URL}/produtos?criterio=WHEY PROTEIN ULTRA&limite=50`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produtosSimilares = response.data.data || [];
      
      if (produtosSimilares.length > 0) {
        console.log(`\n📋 ${produtosSimilares.length} produtos similares encontrados:`);
        produtosSimilares.forEach((produto, index) => {
          console.log(`${index + 1}. ${produto.nome}`);
          console.log(`   Código: ${produto.codigo || 'SEM CÓDIGO'}`);
          console.log(`   ID: ${produto.id}`);
          console.log('   ---');
        });
      } else {
        console.log('❌ Nenhum produto similar encontrado');
      }
      
    } catch (error) {
      console.error('❌ Erro na busca por nome:', error.response?.status, error.response?.data);
    }
  }
}

buscarProdutoEspecifico();