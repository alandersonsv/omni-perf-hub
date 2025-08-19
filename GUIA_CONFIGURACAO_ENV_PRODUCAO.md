# 🔧 GUIA: CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE EM PRODUÇÃO

## 🚨 IMPORTANTE: CREDENCIAIS REMOVIDAS DO REPOSITÓRIO

As credenciais reais foram removidas do repositório por segurança. Para que a aplicação funcione em produção, você deve configurar as variáveis de ambiente no seu serviço de deploy.

---

## 📋 VARIÁVEIS NECESSÁRIAS

### **Variáveis Públicas (VITE_)**
```
VITE_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
VITE_SUPABASE_ANON_KEY=[SUA_CHAVE_ANON_SUPABASE]
VITE_GOOGLE_CLIENT_ID=[SEU_GOOGLE_CLIENT_ID]
VITE_META_APP_ID=[SEU_META_APP_ID]
VITE_OAUTH_STATE_SECRET=[SUA_STRING_ALEATORIA_PUBLICA]
```

### **Variáveis Secretas (SEM VITE_)**
```
GOOGLE_CLIENT_SECRET=[SEU_GOOGLE_CLIENT_SECRET]
GOOGLE_ADS_DEVELOPER_TOKEN=[SEU_GOOGLE_ADS_TOKEN]
META_APP_SECRET=[SEU_META_APP_SECRET]
SUPABASE_SERVICE_ROLE_KEY=[SUA_CHAVE_SERVICE_ROLE]
GOOGLE_ADS_WEBHOOK_SECRET=[SEU_WEBHOOK_SECRET_GOOGLE]
META_WEBHOOK_SECRET=[SEU_WEBHOOK_SECRET_META]
WOOCOMMERCE_WEBHOOK_SECRET=[SEU_WEBHOOK_SECRET_WOO]
OAUTH_STATE_SECRET=[SUA_STRING_ALEATORIA_SECRETA]
N8N_WEBHOOK_URL=[SUA_URL_N8N]
```

---

## 🌐 CONFIGURAÇÃO NO NETLIFY

### **Passo 1: Acessar Configurações**
1. Acesse [Netlify Dashboard](https://app.netlify.com/)
2. Selecione seu site
3. Vá em **Site Settings**
4. Clique em **Environment Variables**

### **Passo 2: Adicionar Variáveis**
Adicione cada variável individualmente:

**Exemplo:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://[SEU_PROJETO].supabase.co`
- **Scopes:** Deixe marcado "All deploy contexts"

### **Passo 3: Deploy**
Após adicionar todas as variáveis:
1. Clique em **Save**
2. Vá em **Deploys**
3. Clique em **Trigger deploy** > **Deploy site**

---

## ▲ CONFIGURAÇÃO NO VERCEL

### **Passo 1: Acessar Configurações**
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings**
4. Clique em **Environment Variables**

### **Passo 2: Adicionar Variáveis**
Para cada variável:
1. **Name:** Nome da variável (ex: `VITE_SUPABASE_URL`)
2. **Value:** Valor da variável
3. **Environment:** Selecione `Production`, `Preview`, e `Development`
4. Clique **Save**

### **Passo 3: Redeploy**
1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

---

## 💻 DESENVOLVIMENTO LOCAL

### **Opção 1: Usar .env.local (Recomendado)**
```bash
# O arquivo .env.local já está configurado com as credenciais
# Ele não será commitado (está no .gitignore)
npm run dev
```

### **Opção 2: Copiar do .env.example**
```bash
# Copiar template
cp .env.example .env

# Editar .env com suas credenciais reais
# ATENÇÃO: NÃO commitar este arquivo!
```

---

## 🔒 SEGURANÇA E BOAS PRÁTICAS

### **✅ O que FAZER:**
- ✅ Usar variáveis de ambiente no Netlify/Vercel
- ✅ Manter credenciais fora do repositório
- ✅ Usar .env.local para desenvolvimento
- ✅ Rotacionar credenciais periodicamente
- ✅ Usar diferentes credenciais para dev/prod

### **❌ O que NÃO fazer:**
- ❌ Commitar arquivos .env com credenciais reais
- ❌ Compartilhar credenciais por email/chat
- ❌ Usar mesmas credenciais em múltiplos ambientes
- ❌ Deixar credenciais em código-fonte
- ❌ Usar credenciais de produção em desenvolvimento

---

## 🧪 VALIDAÇÃO

### **Teste Local:**
```bash
# Verificar se variáveis estão carregadas
npm run dev

# No console do navegador:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### **Teste Produção:**
1. Fazer deploy com variáveis configuradas
2. Acessar aplicação em produção
3. Verificar se login funciona
4. Verificar console para erros

---

## 🆘 TROUBLESHOOTING

### **Problema: Variáveis não carregam**
**Solução:**
1. Verificar se nomes estão corretos (case-sensitive)
2. Verificar se variáveis VITE_ estão com prefixo
3. Fazer redeploy após adicionar variáveis
4. Limpar cache do navegador

### **Problema: Login não funciona**
**Solução:**
1. Verificar se VITE_SUPABASE_URL está correto
2. Verificar se VITE_SUPABASE_ANON_KEY está válido
3. Verificar se VITE_GOOGLE_CLIENT_ID está correto
4. Verificar logs do Supabase

### **Problema: Build falha**
**Solução:**
1. Verificar se todas as variáveis obrigatórias estão definidas
2. Verificar se não há caracteres especiais nas variáveis
3. Verificar logs de build no Netlify/Vercel

---

## 📞 SUPORTE

### **Links Úteis:**
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

### **Comandos de Debug:**
```bash
# Verificar variáveis de ambiente
npm run validate-env

# Build local para testar
npm run build

# Preview do build
npm run preview
```

---

**📅 Última Atualização:** 19/08/2025  
**🔒 Status:** Credenciais removidas do repositório  
**✅ Próximo Passo:** Configurar variáveis no Netlify/Vercel