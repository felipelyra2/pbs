# 🔄 COMO RENOVAR TOKEN OAUTH PASSO A PASSO

## 1️⃣ INICIAR SERVIDOR
```bash
npm run dev
```
**Aguarde aparecer**: `Ready in 2.1s`

## 2️⃣ ABRIR CONFIGURAÇÃO
- Navegador: `http://localhost:3000/configuracao-api`
- Deve aparecer a tela de configuração

## 3️⃣ PREENCHER DADOS (se não estiver preenchido)
**Client ID**: `03a8de4a6ecb737e41e0df0c47832cb94384907f`
**Client Secret**: `fb0bd52ff4f655102027caf8801be04eafc4dd7b85a44c60b603404d6220`

## 4️⃣ AUTORIZAR NO BLING
- Clique no botão: **"Autorizar no Bling"**
- Nova aba abre no Bling
- **Faça login** na sua conta Bling
- **Autorize a aplicação** clicando em "Autorizar"

## 5️⃣ CAPTURAR CÓDIGO
Após autorizar, a URL vai ficar assim:
```
https://pbs-production-9e7c.up.railway.app/api/auth/bling/callback?code=ABC1234567890&state=f22ce9203099c266c4df7ea089ad0c01
```
**Copie apenas o código**: `ABC1234567890`

## 6️⃣ GERAR TOKEN
- Volte para a tela de configuração
- O código deve aparecer automaticamente
- Clique: **"Obter Token de Acesso"**
- **Copie o token** que aparecer (começa com Bearer)

## 7️⃣ TESTAR TOKEN
```bash
# Edite o arquivo
nano test-movimentacao-real.js

# Substitua na linha 5:
const TOKEN = 'SEU_TOKEN_COPIADO_AQUI';

# Execute o teste
node test-movimentacao-real.js
```

## ⚠️ PROBLEMAS COMUNS:

### Token expira rápido?
- Tokens OAuth expiram em 1-2 horas
- Use **usuário API** (não expira)

### Erro 401 mesmo com token novo?
- Verifique se copiou o token completo
- Token deve começar com letras/números

### Aplicação não autoriza?
- Verifique se Client ID/Secret estão corretos
- Callback URL deve estar igual no Bling

## 💡 DICA:
Use **usuário API** em vez de OAuth para não ter que renovar token constantemente!