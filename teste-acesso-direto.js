const axios = require('axios');

const TOKEN = 'Bearer 519788b43625f02320803eeeddd6040944f0670d';
const BASE_URL = 'https://www.bling.com.br/Api/v3';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testeAcessoDireto() {
  console.log('🔍 TESTE DE ACESSO DIRETO AO PRODUTO\n');
  
  // Teste 1: Verificar estrutura da resposta de produtos
  console.log('1️⃣ Verificando estrutura completa da API...');
  try {
    await delay(1000);
    
    const response = await axios.get(`${BASE_URL}/produtos?limite=1`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📋 Estrutura da resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data[0]) {
      const primeiroProduto = response.data.data[0];
      console.log('\n📦 Estrutura de um produto:');
      console.log(`Nome: ${primeiroProduto.nome}`);
      console.log(`Código: ${primeiroProduto.codigo}`);
      console.log(`ID: ${primeiroProduto.id}`);
      console.log(`GTIN: ${primeiroProduto.gtin}`);
      console.log(`Todas as propriedades:`, Object.keys(primeiroProduto));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
  
  // Teste 2: Tentar buscar especificamente por códigos que começam com 789514
  console.log('\n2️⃣ Buscando códigos que começam com 789514...');
  try {
    await delay(2000);
    
    const response = await axios.get(`${BASE_URL}/produtos?criterio=789514&limite=100`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const produtos = response.data.data || [];
    console.log(`📦 ${produtos.length} produtos encontrados com "789514"`);
    
    produtos.forEach(produto => {
      if (produto.codigo && produto.codigo.includes('789514')) {
        console.log(`\n📋 Produto encontrado:`);
        console.log(`Nome: ${produto.nome}`);
        console.log(`Código: ${produto.codigo}`);
        console.log(`ID: ${produto.id}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
  
  // Teste 3: Tentar diferentes IDs (já que sabemos que existem produtos até ID 16495719981)
  console.log('\n3️⃣ Tentando acessar por IDs específicos...');
  
  // Vou tentar alguns IDs aleatórios na faixa que vimos
  const idsParaTestar = [
    '16495719981', // ID que sabemos que existe
    '16495719980',
    '16495719979',
    // Vou calcular um ID próximo baseado no padrão
  ];
  
  for (const id of idsParaTestar) {
    try {
      await delay(1500);
      
      console.log(`🔍 Testando ID: ${id}`);
      const response = await axios.get(`${BASE_URL}/produtos/${id}`, {
        headers: {
          'Authorization': TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const produto = response.data.data;
      console.log(`✅ Produto encontrado por ID:`);
      console.log(`Nome: ${produto.nome}`);
      console.log(`Código: ${produto.codigo}`);
      console.log(`ID: ${produto.id}`);
      
    } catch (error) {
      console.log(`❌ ID ${id} não encontrado: ${error.response?.status}`);
    }
  }
  
  // Teste 4: Verificar informações da conta/empresa
  console.log('\n4️⃣ Verificando informações da conta...');
  try {
    await delay(2000);
    
    // Tentar endpoint que mostra informações da empresa
    const response = await axios.get(`${BASE_URL}/contatos?limite=1`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📋 Primeira resposta de contatos (para ver estrutura):');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao verificar contatos:', error.response?.status);
  }
}

testeAcessoDireto();