// =====================================================
// SCRIPT DE DIAGNÓSTICO PARA LOGIN EM PRODUÇÃO
// Execute este script no console do navegador em produção
// =====================================================

console.log('🔍 INICIANDO DIAGNÓSTICO DE LOGIN EM PRODUÇÃO...');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌐 URL:', window.location.href);

// 1. Verificar ambiente e configuração
const checkEnvironment = () => {
  console.log('\n🔧 VERIFICANDO AMBIENTE:');
  
  // Verificar se estamos em produção
  const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  console.log('Ambiente:', isProd ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
  console.log('Hostname:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  
  // Verificar variáveis de ambiente (se disponíveis)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    console.log('\n📋 VARIÁVEIS DE AMBIENTE:');
    const env = import.meta.env;
    console.log('MODE:', env.MODE);
    console.log('PROD:', env.PROD);
    console.log('DEV:', env.DEV);
    
    if (env.VITE_SUPABASE_URL) {
      console.log('SUPABASE_URL:', env.VITE_SUPABASE_URL);
    } else {
      console.log('❌ VITE_SUPABASE_URL não definida');
    }
    
    if (env.VITE_SUPABASE_ANON_KEY) {
      console.log('SUPABASE_KEY (prefix):', env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...');
    } else {
      console.log('❌ VITE_SUPABASE_ANON_KEY não definida');
    }
  } else {
    console.log('⚠️ import.meta.env não disponível');
  }
};

// 2. Testar importação do Supabase client
const testSupabaseImport = async () => {
  console.log('\n📦 TESTANDO IMPORTAÇÃO DO SUPABASE:');
  
  try {
    // Tentar diferentes formas de importar
    let supabase = null;
    
    // Método 1: Importação dinâmica
    try {
      const module = await import('./src/integrations/supabase/client.js');
      supabase = module.supabase;
      console.log('✅ Importação dinâmica bem-sucedida');
    } catch (e) {
      console.log('❌ Falha na importação dinâmica:', e.message);
    }
    
    // Método 2: Verificar se está no window
    if (!supabase && window.supabase) {
      supabase = window.supabase;
      console.log('✅ Supabase encontrado no window');
    }
    
    // Método 3: Tentar acessar via módulos carregados
    if (!supabase) {
      console.log('⚠️ Tentando localizar Supabase nos módulos carregados...');
      // Verificar se há alguma referência global
      const scripts = Array.from(document.scripts);
      console.log('Scripts carregados:', scripts.length);
    }
    
    if (supabase) {
      console.log('✅ Supabase client localizado');
      console.log('URL configurada:', supabase.supabaseUrl);
      console.log('Key prefix:', supabase.supabaseKey ? supabase.supabaseKey.substring(0, 20) + '...' : 'N/A');
      return supabase;
    } else {
      console.log('❌ Não foi possível localizar o Supabase client');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao testar importação:', error);
    return null;
  }
};

// 3. Testar conectividade básica
const testConnectivity = async (supabase) => {
  if (!supabase) {
    console.log('\n❌ Não é possível testar conectividade sem o client Supabase');
    return false;
  }
  
  console.log('\n🌐 TESTANDO CONECTIVIDADE:');
  
  try {
    const startTime = performance.now();
    const { data, error } = await supabase.auth.getSession();
    const endTime = performance.now();
    
    console.log(`⏱️ Tempo de resposta: ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.log('❌ Erro na conectividade:', error);
      return false;
    } else {
      console.log('✅ Conectividade OK');
      console.log('Sessão atual:', data.session ? 'Ativa' : 'Nenhuma');
      if (data.session) {
        console.log('User ID:', data.session.user?.id);
        console.log('Email:', data.session.user?.email);
      }
      return true;
    }
  } catch (error) {
    console.log('❌ Exceção na conectividade:', error);
    return false;
  }
};

// 4. Testar login com credenciais específicas
const testLogin = async (supabase, email, password) => {
  if (!supabase) {
    console.log('\n❌ Não é possível testar login sem o client Supabase');
    return false;
  }
  
  console.log('\n🔐 TESTANDO LOGIN:');
  console.log('Email:', email);
  console.log('Password length:', password ? password.length : 0);
  
  try {
    const startTime = performance.now();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    const endTime = performance.now();
    
    console.log(`⏱️ Tempo de login: ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.log('❌ ERRO NO LOGIN:');
      console.log('Mensagem:', error.message);
      console.log('Status:', error.status);
      console.log('Code:', error.code || error.name);
      console.log('Detalhes completos:', error);
      
      // Análise específica de erros comuns
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n🔍 ANÁLISE: Credenciais inválidas');
        console.log('Possíveis causas:');
        console.log('1. Email ou senha incorretos');
        console.log('2. Usuário não existe no banco de dados');
        console.log('3. Configuração incorreta do Supabase');
        console.log('4. Problema de conectividade com o banco');
      }
      
      return false;
    } else {
      console.log('✅ LOGIN SUCESSO!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Email verified:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
      console.log('Metadata:', data.user?.user_metadata);
      console.log('Session expires:', data.session?.expires_at ? new Date(data.session.expires_at * 1000) : 'N/A');
      
      return true;
    }
  } catch (error) {
    console.log('❌ EXCEÇÃO NO LOGIN:', error);
    return false;
  }
};

// 5. Verificar configuração de CORS e rede
const checkNetworkConfig = () => {
  console.log('\n🌐 VERIFICANDO CONFIGURAÇÃO DE REDE:');
  
  // Verificar se há bloqueios de CORS
  console.log('User Agent:', navigator.userAgent);
  console.log('Online:', navigator.onLine);
  
  // Verificar localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage disponível');
  } catch (e) {
    console.log('❌ localStorage bloqueado:', e.message);
  }
  
  // Verificar cookies
  console.log('Cookies enabled:', navigator.cookieEnabled);
  
  // Verificar se há chaves do Supabase no localStorage
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') || key.includes('supabase')
  );
  console.log('Chaves Supabase no localStorage:', supabaseKeys.length);
  if (supabaseKeys.length > 0) {
    console.log('Chaves encontradas:', supabaseKeys);
  }
};

// 6. Função principal de diagnóstico
const runDiagnostic = async () => {
  console.log('🚀 EXECUTANDO DIAGNÓSTICO COMPLETO...');
  
  // Executar todas as verificações
  checkEnvironment();
  checkNetworkConfig();
  
  const supabase = await testSupabaseImport();
  
  if (supabase) {
    const connectivity = await testConnectivity(supabase);
    
    if (connectivity) {
      console.log('\n📝 Para testar login, execute:');
      console.log('testLoginWithCredentials("seu@email.com", "sua_senha")');
      
      // Expor função de teste de login
      window.testLoginWithCredentials = async (email, password) => {
        return await testLogin(supabase, email, password);
      };
    }
  }
  
  console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Verificar se as variáveis de ambiente estão configuradas');
  console.log('2. Confirmar se a URL e chave do Supabase estão corretas');
  console.log('3. Testar login com credenciais conhecidas');
  console.log('4. Verificar logs do servidor Supabase se disponível');
};

// Expor funções globalmente para uso manual
window.checkEnvironment = checkEnvironment;
window.testSupabaseImport = testSupabaseImport;
window.testConnectivity = testConnectivity;
window.checkNetworkConfig = checkNetworkConfig;
window.runDiagnostic = runDiagnostic;

// Executar diagnóstico automaticamente
runDiagnostic();

// Instruções para o usuário
console.log('\n📖 INSTRUÇÕES:');
console.log('Este script executou um diagnóstico automático.');
console.log('Para testar login manualmente, use:');
console.log('testLoginWithCredentials("email@exemplo.com", "senha")');
console.log('\nPara executar novamente: runDiagnostic()');