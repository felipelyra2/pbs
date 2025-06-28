# Guia de Deploy - Sistema de Transferência Bling

## Pré-requisitos

- Conta na Vercel
- Banco PostgreSQL (recomendado: Neon, Supabase ou Railway)
- Chaves da API do Bling para cada loja

## 1. Configuração do Banco de Dados

### Opção A: Neon (Recomendado)
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a string de conexão PostgreSQL

### Opção B: Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a string de conexão

## 2. Deploy na Vercel

### Via GitHub (Recomendado)
1. Faça fork/clone este repositório
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta GitHub
4. Importe o repositório
5. Configure as variáveis de ambiente (ver seção abaixo)

### Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 3. Configuração das Variáveis de Ambiente

No painel da Vercel, configure as seguintes variáveis em Settings > Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NEXTAUTH_SECRET=seu-secret-key-aqui-32-caracteres-minimo
NEXTAUTH_URL=https://seu-dominio.vercel.app
NODE_ENV=production
```

### Como gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 4. Configuração do Banco de Dados

Após o deploy, execute as migrações do Prisma:

### Via Vercel Console
1. Vá em Functions > View Function Logs
2. Execute uma requisição para qualquer endpoint para ativar o Prisma

### Via Local (se tiver acesso ao DB)
```bash
npm install
npx prisma db push
```

## 5. Configuração Inicial das Lojas

Após o deploy, acesse `/lojas` para cadastrar suas lojas:

1. Nome da loja (ex: "Loja Centro")
2. Chave da API do Bling para esta loja

**Importante**: Cada loja deve ter sua própria chave da API do Bling.

## 6. Como obter a Chave da API do Bling

1. Acesse o painel do Bling
2. Vá em Configurações > API
3. Gere uma nova chave para cada loja
4. Copie e cole no sistema

## 7. Configurações Avançadas

### Domínio Personalizado
1. No painel Vercel, vá em Settings > Domains
2. Adicione seu domínio
3. Configure o DNS conforme instruções

### Limites e Performance
- Cada função da Vercel tem limite de 30 segundos
- Para notas fiscais muito grandes, considere usar background jobs
- O banco gratuito do Neon tem limite de conexões

## 8. Monitoramento

### Logs
- Acesse Functions > View Function Logs na Vercel
- Monitore erros de scraping e integração com Bling

### Banco de Dados
- Use o painel do Neon/Supabase para monitorar queries
- Configure alertas de uso de recursos

## 9. Backup e Segurança

### Backup Automático
- Neon e Supabase fazem backup automático
- Configure backups adicionais se necessário

### Segurança
- Nunca commit chaves da API
- Use apenas HTTPS em produção
- Monitore logs de acesso

## 10. Solução de Problemas

### Erro de Conexão com Banco
```
Error: Can't reach database server
```
**Solução**: Verifique a string DATABASE_URL e se o banco está ativo

### Erro de Scraping
```
Error: Cannot access Bling URL
```
**Solução**: Verifique se a URL do Bling está correta e acessível

### Erro na API do Bling
```
Error: Invalid API key
```
**Solução**: Verifique se a chave da API está correta para a loja

### Timeout na Vercel
```
Function timeout error
```
**Solução**: Otimize queries ou use processamento em background

## 11. Estrutura de URLs

- `/` - Página inicial para criar transferências
- `/lojas` - Gerenciar lojas e chaves da API
- `/historico` - Histórico de transferências
- `/conferencia/[id]` - Tela de conferência de produtos

## 12. Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build para produção
npm run build

# Migração do banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Ver banco de dados
npx prisma studio
```

## 13. Suporte

Em caso de problemas:
1. Verifique os logs da Vercel
2. Teste as APIs individualmente
3. Verifique as variáveis de ambiente
4. Confirme se o banco está ativo

## 14. Atualizações

Para atualizar o sistema:
1. Faça git pull das atualizações
2. A Vercel fará deploy automático
3. Execute migrações se ne
claude
claude
