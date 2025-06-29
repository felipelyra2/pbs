// Script para testar conexão com banco
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Tentar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão com banco funcionando!');
    
    // Tentar listar lojas
    const stores = await prisma.store.findMany();
    console.log('✅ Tabela stores existe!');
    console.log(`📊 ${stores.length} loja(s) encontrada(s)`);
    
    return true;
  } catch (error) {
    console.log('❌ Erro na conexão com banco:');
    console.log('Error:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Solução: Execute "npx prisma db push" para criar as tabelas');
    } else if (error.message.includes('connection')) {
      console.log('💡 Solução: Verifique a DATABASE_URL nas variáveis de ambiente');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testDB();