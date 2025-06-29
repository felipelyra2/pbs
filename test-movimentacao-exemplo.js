// Exemplo de como fazer movimentação no Bling API v3
// Este arquivo mostra o formato correto independente do token

console.log('📋 COMO FAZER MOVIMENTAÇÃO NO BLING API v3\n');

console.log('🔍 DESCOBERTAS DA INVESTIGAÇÃO:');
console.log('❌ NÃO EXISTE: /estoque/movimentacao');
console.log('❌ NÃO EXISTE: /estoques/movimentacoes');
console.log('❌ NÃO EXISTE: /movimentacoes');
console.log('✅ EXISTE: /pedidos/compras');
console.log('✅ EXISTE: /pedidos/vendas');
console.log('✅ EXISTE: /produtos');
console.log('✅ EXISTE: /depositos\n');

console.log('💡 SOLUÇÃO PARA MOVIMENTAÇÃO:');
console.log('1. ENTRADA DE ESTOQUE → Usar /pedidos/compras');
console.log('2. SAÍDA DE ESTOQUE → Usar /pedidos/vendas');
console.log('3. CONSULTAR PRODUTOS → Usar /produtos');
console.log('4. CONSULTAR DEPÓSITOS → Usar /depositos\n');

// Exemplo de payload para ENTRADA (pedido de compra)
const exemploEntrada = {
  fornecedor: {
    nome: "FORNECEDOR MOVIMENTACAO",
    codigo: "MOVEST001",
    tipoPessoa: "J",
    contribuinte: "9", 
    cpfCnpj: "11222333000144",
    ie: "ISENTO",
    endereco: {
      endereco: "Rua da Movimentação, 123",
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
        codigo: "CODIGO_DO_PRODUTO" // Substitua pelo código real
      },
      quantidade: 10,
      valor: 50.00
    }
  ],
  observacoes: "Entrada de estoque por transferência",
  dataPrevisao: "2024-12-29",
  situacao: {
    valor: 6 // 6 = Em andamento
  }
};

console.log('📋 EXEMPLO DE PAYLOAD PARA ENTRADA:');
console.log(JSON.stringify(exemploEntrada, null, 2));

console.log('\n🔧 CÓDIGO PARA EXECUTAR:');
console.log(`
const axios = require('axios');

const response = await axios.post('https://www.bling.com.br/Api/v3/pedidos/compras', payload, {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

console.log('Movimentação criada:', response.data);
`);

console.log('\n⚠️  IMPORTANTE:');
console.log('- Token precisa ser válido e não expirado');
console.log('- Código do produto deve existir no Bling');
console.log('- CNPJ do fornecedor deve ser válido');
console.log('- Depois de criar o pedido, precisa confirmar no Bling para efetivar a movimentação');

console.log('\n✅ SEU CÓDIGO JÁ ESTÁ CORRETO em bling-api-v3.ts');
console.log('O problema é só o token expirado, não a implementação!');