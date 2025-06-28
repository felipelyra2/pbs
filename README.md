# Sistema de Transferência entre Lojas Bling

Sistema completo para transferência entre lojas Bling na nuvem com tela de conferência.

## 🚀 Funcionalidades

### Fluxo Principal
1. **Cole o link da nota fiscal** do Bling
2. **Selecione a loja de destino** onde será dada entrada
3. **Sistema extrai dados** automaticamente via web scraping
4. **Tela de conferência** para marcar produtos recebidos
5. **Usuário marca o que chegou** e ajusta quantidades
6. **Lança no Bling** apenas produtos confirmados

### Recursos
- ✅ Web scraping de links do Bling (`https://www.bling.com.br/b/doc.view.php?id=xxx`)
- ✅ Lista produtos com checkbox para marcar/desmarcar
- ✅ Campos editáveis para ajustar quantidades
- ✅ Integração API Bling para lançar entradas
- ✅ Sistema de autenticação
- ✅ Histórico de transferências
- ✅ Gerenciamento de múltiplas lojas
- ✅ Chaves da API específicas por loja

## 🏗️ Arquitetura

- **Frontend**: React/Next.js 14 com Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco**: PostgreSQL com Prisma ORM
- **Deploy**: Vercel
- **Autenticação**: JWT com cookies httpOnly

## 📱 Telas do Sistema

1. **Home** (`/`) - Criar nova transferência
2. **Lojas** (`/lojas`) - Gerenciar lojas e chaves da API
3. **Conferência** (`/conferencia/[id]`) - Tela de conferência de produtos
4. **Histórico** (`/historico`) - Lista de transferências

## 🛠️ Instalação Local

```bash
# Clone o repositório
git clone <repo-url>
cd bling-transfer-system

# Instale as dependências
npm install

# Configure o banco de dados
cp .env.example .env
# Edite o .env com suas configurações

# Execute as migrações
npx prisma db push

# Inicie o servidor
npm run dev
```

## 🌐 Deploy

Consulte o arquivo [DEPLOY.md](./DEPLOY.md) para instruções completas de deploy na Vercel.

### Resumo do Deploy
1. Configure banco PostgreSQL (Neon/Supabase)
2. Deploy na Vercel via GitHub
3. Configure variáveis de ambiente
4. Execute migrações do Prisma
5. Cadastre suas lojas e chaves da API

## 🔑 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="seu-secret-key-32-chars"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NODE_ENV="production"
```

## 📋 Como Usar

### 1. Configurar Lojas
- Acesse `/lojas`
- Adicione suas lojas com nome e chave da API do Bling

### 2. Criar Transferência
- Cole o link da nota fiscal do Bling
- Selecione a loja de destino
- Sistema extrairá os dados automaticamente

### 3. Conferência
- Marque os produtos que chegaram
- Ajuste quantidades se necessário
- Confirme a transferência

### 4. Lançar no Bling
- No histórico, clique em "Lançar no Bling"
- Sistema criará entrada automática na loja selecionada

## 🏪 Múltiplas Lojas

O sistema suporta múltiplas lojas, cada uma com sua própria chave da API do Bling:

- **Loja A**: Chave API específica
- **Loja B**: Chave API específica
- **Loja C**: Chave API específica

Ao criar uma transferência, você seleciona qual loja receberá os produtos.

## 📊 Banco de Dados

### Modelos Principais
- **Users**: Usuários do sistema
- **Stores**: Lojas com chaves da API
- **Transfers**: Transferências entre lojas
- **Products**: Produtos do Bling
- **TransferProducts**: Produtos em cada transferência

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Servidor local
npm run build         # Build produção
npm run lint          # Linter

# Banco de dados
npx prisma generate   # Gerar cliente
npx prisma db push    # Aplicar schema
npx prisma studio     # Interface visual

# Deploy
vercel --prod         # Deploy na Vercel
```

## 📝 TODO / Melhorias Futuras

- [ ] Autenticação com múltiplos usuários
- [ ] Notificações por email
- [ ] Relatórios de transferências
- [ ] API para integrações externas
- [ ] App mobile
- [ ] Dashboard com métricas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação de deploy
2. Consulte os logs da Vercel
3. Abra uma issue no GitHub