const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function buscarProdutos() {
  console.log('🔍 Testando busca de produtos no Bling...\n');
  
  // Teste 1: Buscar todos os produtos
  console.log('1️⃣ Buscando todos os produtos (limite 10)...');
  try {
    const response = await axios.get(`${BASE_URL}/produtos?limite=10`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Busca geral funcionou!');
    console.log(`📦 Total de produtos encontrados: ${response.data.data?.length || 0}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Primeiros produtos encontrados:');
      response.data.data.forEach((produto, index) => {
        console.log(`${index + 1}. ${produto.nome} - Código: ${produto.codigo} - ID: ${produto.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Busca geral falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }

  // Teste 2: Buscar produto específico por código
  console.log('\n2️⃣ Buscando produto específico por código 7895140757357...');
  try {
    const response = await axios.get(`${BASE_URL}/produtos?criterio=7895140757357`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Busca específica funcionou!');
    console.log(`📦 Produtos encontrados: ${response.data.data?.length || 0}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Produto encontrado:');
      response.data.data.forEach(produto => {
        console.log(`Nome: ${produto.nome}`);
        console.log(`Código: ${produto.codigo}`);
        console.log(`ID: ${produto.id}`);
        console.log(`EAN: ${produto.gtin}`);
      });
    } else {
      console.log('❌ Produto não encontrado com esse código');
    }
    
  } catch (error) {
    console.error('❌ Busca específica falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }

  // Teste 3: Buscar por nome
  console.log('\n3️⃣ Buscando por nome "WHEY PROTEIN"...');
  try {
    const response = await axios.get(`${BASE_URL}/produtos?criterio=WHEY PROTEIN`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Busca por nome funcionou!');
    console.log(`📦 Produtos encontrados: ${response.data.data?.length || 0}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Produtos encontrados:');
      response.data.data.forEach(produto => {
        console.log(`Nome: ${produto.nome}`);
        console.log(`Código: ${produto.codigo}`);
        console.log(`EAN: ${produto.gtin}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Busca por nome falhou');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data);
  }
}

buscarProdutos();