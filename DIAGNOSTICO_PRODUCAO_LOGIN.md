# 🚨 DIAGNÓSTICO: FALHA DE LOGIN EM PRODUÇÃO

## 📋 PROBLEMA REPORTADO

**Sintomas:**
- Login falha em produção com "Email ou senha inválidos"
- Credenciais estão corretas (funcionam em desenvolvimento)
- Usuário não consegue acessar o dashboard

**Ambiente:**
- ✅ Desenvolvimento: Funcionando
- ❌ Produção: Falhando

---

## 🔍 ANÁLISE INICIAL

### 1. Configuração do Supabase Client

**Arquivo:** `src/integrations/supabase/client.ts`

```typescript
// Configuração atual
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "demo_key";
```

**Possíveis Problemas:**
1. **Variáveis de ambiente não configuradas em produção**
2. **URL/chave incorretas para o ambiente de produção**
3. **Fallback para localhost em produção**

### 2. Variáveis de Ambiente

**Arquivo:** `.env`

```env
# Valores atuais (placeholders)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**❌ PROBLEMA IDENTIFICADO:**
- URLs e chaves são placeholders
- Não são valores reais de produção

---

## 🧪 SCRIPT DE DIAGNÓSTICO

### Execute no Console do Navegador (Produção)

```javascript
// =====================================================
// DIAGNÓSTICO COMPLETO DE LOGIN EM PRODUÇÃO
// =====================================================

console.log('🔍 INICIANDO DIAGNÓSTICO DE PRODUÇÃO...');

// 1. Verificar configuração do Supabase
const checkSupabaseConfig = () => {
  console.log('\n📡 CONFIGURAÇÃO SUPABASE:');
  console.log('URL:', window.location.origin);
  console.log('Environment:', import.meta?.env?.MODE || 'unknown');
  
  // Tentar acessar configuração do Supabase
  if (window.supabase) {
    console.log('Supabase URL:', window.supabase.supabaseUrl);
    console.log('Supabase Key (prefix):', window.supabase.supabaseKey?.substring(0, 20) + '...');
  } else {
    console.log('❌ Supabase client não encontrado no window');
  }
};

// 2. Testar conectividade
const testConnectivity = async () => {
  console.log('\n🌐 TESTE DE CONECTIVIDADE:');
  
  try {
    // Importar supabase client
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    
    console.log('✅ Supabase client importado com sucesso');
    console.log('URL configurada:', supabase.supabaseUrl);
    console.log('Key prefix:', supabase.supabaseKey.substring(0, 20) + '...');
    
    // Testar conexão básica
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erro ao obter sessão:', error);
    } else {
      console.log('✅ Conexão com Supabase OK');
      console.log('Sessão atual:', data.session ? 'Ativa' : 'Nenhuma');
    }
    
    return supabase;
  } catch (error) {
    console.log('❌ Erro ao importar/conectar Supabase:', error);
    return null;
  }
};

// 3. Testar login direto
const testDirectLogin = async (email, password) => {
  console.log('\n🔐 TESTE DE LOGIN DIRETO:');
  console.log('Email:', email);
  
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    
    const startTime = performance.now();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    const endTime = performance.now();
    
    console.log(`⏱️ Tempo de resposta: ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.log('❌ ERRO DE LOGIN:');
      console.log('Mensagem:', error.message);
      console.log('Código:', error.status);
      console.log('Detalhes completos:', error);
      return false;
    } else {
      console.log('✅ LOGIN SUCESSO:');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Metadata:', data.user?.user_metadata);
      console.log('Session expires:', new Date(data.session?.expires_at * 1000));
      return true;
    }
  } catch (error) {
    console.log('❌ EXCEÇÃO NO LOGIN:', error);
    return false;
  }
};

// 4. Verificar variáveis de ambiente
const checkEnvironmentVars = () => {
  console.log('\n🔧 VARIÁVEIS DE AMBIENTE:');
  
  const vars = {
    'VITE_SUPABASE_URL': import.meta?.env?.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta?.env?.VITE_SUPABASE_ANON_KEY,
    'MODE': import.meta?.env?.MODE,
    'PROD': import.meta?.env?.PROD,
    'DEV': import.meta?.env?.DEV
  };
  
  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      if (key.includes('KEY')) {
        console.log(`${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`${key}: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: NÃO DEFINIDA`);
    }
  });
};

// 5. Executar diagnóstico completo
const runFullDiagnostic = async () => {
  console.log('🚀 EXECUTANDO DIAGNÓSTICO COMPLETO...');
  
  checkSupabaseConfig();
  checkEnvironmentVars();
  
  const supabase = await testConnectivity();
  
  if (supabase) {
    console.log('\n📝 Para testar login, execute:');
    console.log('testDirectLogin("seu@email.com", "sua_senha")');
  }
  
  console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
};

// Expor funções globalmente
window.checkSupabaseConfig = checkSupabaseConfig;
window.testConnectivity = testConnectivity;
window.testDirectLogin = testDirectLogin;
window.checkEnvironmentVars = checkEnvironmentVars;
window.runFullDiagnostic = runFullDiagnostic;

// Executar diagnóstico automaticamente
runFullDiagnostic();
```

---

## 🔧 POSSÍVEIS SOLUÇÕES

### 1. Verificar Configuração de Produção

**Passos:**
1. Confirmar se as variáveis de ambiente estão configuradas no serviço de deploy
2. Verificar se os valores são reais (não placeholders)
3. Testar conectividade com o Supabase em produção

### 2. Configuração de Variáveis de Ambiente

**Para Netlify/Vercel:**
```bash
# Configurar no painel de administração
VITE_SUPABASE_URL=https://seu-projeto-real.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_real_aqui
```

### 3. Fallback de Configuração

**Modificar `client.ts`:**
```typescript
// Adicionar validação
if (SUPABASE_URL.includes('your-project') || SUPABASE_URL.includes('localhost')) {
  console.error('❌ CONFIGURAÇÃO INVÁLIDA: URL do Supabase não configurada para produção');
  throw new Error('Supabase não configurado para produção');
}
```

### 4. Debug de Produção

**Adicionar logs temporários:**
```typescript
// No AuthContext login function
console.log('🔍 PROD DEBUG:', {
  url: supabase.supabaseUrl,
  keyPrefix: supabase.supabaseKey.substring(0, 20),
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD
});
```

---

## 📋 CHECKLIST DE RESOLUÇÃO

### Verificações Imediatas:
- [ ] Executar script de diagnóstico em produção
- [ ] Verificar logs do console para erros específicos
- [ ] Confirmar configuração de variáveis de ambiente
- [ ] Testar conectividade direta com Supabase

### Correções Potenciais:
- [ ] Configurar variáveis de ambiente reais
- [ ] Adicionar validação de configuração
- [ ] Implementar logs de debug para produção
- [ ] Testar login direto via API

### Validação Final:
- [ ] Login funciona em produção
- [ ] Redirecionamento correto após login
- [ ] Sem erros no console
- [ ] Performance adequada (< 5s)

---

**Status:** 🔍 INVESTIGANDO
**Prioridade:** 🚨 CRÍTICA
**Próxima Ação:** Executar diagnóstico em produção