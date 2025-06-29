// Teste com usuário API (não expira)
const axios = require('axios');

// SUBSTITUA PELA SUA CHAVE DE USUÁRIO API
const API_KEY = 'ccb632d5184171a6ec073cec111c78e338ed0dacf46b2e5699d33624259a196a5b4ee064';
const BASE_URL = 'https://bling.com.br/Api/v2'; // Usuário API usa v2!

async function testarUsuarioAPI() {
  console.log('🔑 Testando com usuário API (não expira)...\n');
  
  try {
    // 1. Testar buscar produtos
    console.log('1️⃣ Testando buscar produtos...');
    const response = await axios.get(`${BASE_URL}/produtos/json`, {
      params: {
        apikey: API_KEY,
        filters: 'estoque[>0]'
      }
    });
    
    console.log('✅ Produtos encontrados:', response.data?.retorno?.produtos?.length || 0);
    
    if (response.data?.retorno?.produtos?.length > 0) {
      const produto = response.data.retorno.produtos[0].produto;
      console.log(`📦 Produto exemplo: ${produto.descricao} (${produto.codigo})`);
      
      // 2. Testar criar pedido de compra
      console.log('\n2️⃣ Testando criar pedido de compra...');
      
      const pedidoXML = `<?xml version="1.0" encoding="UTF-8"?>
      <pedidocompra>
        <numero>TEST${Date.now()}</numero>
        <data>${new Date().toISOString().split('T')[0]}</data>
        <fornecedor>
          <nome>FORNECEDOR TESTE API</nome>
          <cnpj>11222333000144</cnpj>
        </fornecedor>
        <itens>
          <item>
            <codigo>${produto.codigo}</codigo>
            <descricao>${produto.descricao}</descricao>
            <quantidade>1</quantidade>
            <valorunidade>10.00</valorunidade>
          </item>
        </itens>
        <observacoes>Teste de pedido via usuário API</observacoes>
      </pedidocompra>`;
      
      const pedidoResponse = await axios.post(`${BASE_URL}/pedidocompra/json`, 
        `apikey=${API_KEY}&xml=${encodeURIComponent(pedidoXML)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ Pedido criado!');
      console.log('📄 Resposta:', JSON.stringify(pedidoResponse.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Erro:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testarUsuarioAPI();