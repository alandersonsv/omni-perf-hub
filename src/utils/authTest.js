// Script de teste de autenticação para executar no console do navegador
// Para usar: copie e cole no console do DevTools

// Função para testar login direto
window.testDirectLogin = async (email, password) => {
  console.log('🧪 Testando login direto...');
  console.log('Email:', email);
  
  try {
    // Importar supabase do contexto global
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não encontrado no contexto global');
      return;
    }
    
    console.log('📡 Fazendo requisição de login...');
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Tempo de resposta: ${duration.toFixed(2)}ms`);
    
    if (error) {
      console.error('❌ Erro de login:', error);
      console.error('Código:', error.status);
      console.error('Mensagem:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', data.user);
    console.log('🔑 Sessão:', data.session);
    
    return { success: true, data };
    
  } catch (exception) {
    console.error('💥 Exceção durante login:', exception);
    return { success: false, exception };
  }
};

// Função para verificar sessão atual
window.checkCurrentSession = async () => {
  console.log('🔍 Verificando sessão atual...');
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não encontrado');
      return;
    }
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return { hasSession: false, error };
    }
    
    if (session) {
      console.log('✅ Sessão ativa encontrada');
      console.log('👤 Usuário:', session.user);
      console.log('🔑 Token expira em:', new Date(session.expires_at * 1000));
      return { hasSession: true, session };
    } else {
      console.log('⚠️ Nenhuma sessão ativa');
      return { hasSession: false };
    }
    
  } catch (exception) {
    console.error('💥 Exceção ao verificar sessão:', exception);
    return { hasSession: false, exception };
  }
};

// Função para monitorar mudanças de auth
window.startAuthMonitoring = () => {
  console.log('👁️ Iniciando monitoramento de auth...');
  
  const { supabase } = window;
  
  if (!supabase) {
    console.error('❌ Supabase não encontrado');
    return;
  }
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Mudança de estado de auth:', event);
    console.log('📊 Sessão:', session);
    
    if (session) {
      console.log('👤 Usuário logado:', session.user.email);
      console.log('🔑 Token válido até:', new Date(session.expires_at * 1000));
    } else {
      console.log('👤 Usuário deslogado');
    }
  });
  
  // Salvar subscription para poder parar depois
  window.authSubscription = subscription;
  
  console.log('✅ Monitoramento iniciado. Use stopAuthMonitoring() para parar.');
};

// Função para parar monitoramento
window.stopAuthMonitoring = () => {
  if (window.authSubscription) {
    window.authSubscription.unsubscribe();
    delete window.authSubscription;
    console.log('⏹️ Monitoramento parado');
  } else {
    console.log('⚠️ Nenhum monitoramento ativo');
  }
};

// Função para testar conectividade com Supabase
window.testSupabaseConnection = async () => {
  console.log('🌐 Testando conectividade com Supabase...');
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não encontrado');
      return;
    }
    
    // Testar uma query simples
    const { data, error } = await supabase
      .from('agencies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro de conectividade:', error);
      return { connected: false, error };
    }
    
    console.log('✅ Conectividade OK');
    return { connected: true, data };
    
  } catch (exception) {
    console.error('💥 Exceção de conectividade:', exception);
    return { connected: false, exception };
  }
};

// Função para debug completo
window.fullAuthDebug = async (email = 'alandersonverissimo@gmail.com', password = '') => {
  console.log('🔬 Iniciando debug completo de autenticação...');
  console.log('=' .repeat(50));
  
  // 1. Verificar conectividade
  console.log('\n1️⃣ Testando conectividade...');
  await window.testSupabaseConnection();
  
  // 2. Verificar sessão atual
  console.log('\n2️⃣ Verificando sessão atual...');
  await window.checkCurrentSession();
  
  // 3. Iniciar monitoramento
  console.log('\n3️⃣ Iniciando monitoramento...');
  window.startAuthMonitoring();
  
  // 4. Testar login se senha fornecida
  if (password) {
    console.log('\n4️⃣ Testando login...');
    await window.testDirectLogin(email, password);
  } else {
    console.log('\n4️⃣ Senha não fornecida, pulando teste de login');
    console.log('Para testar login: fullAuthDebug("email", "senha")');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Debug completo finalizado');
  console.log('💡 Use stopAuthMonitoring() para parar o monitoramento');
};

// Expor supabase globalmente se não estiver
if (typeof window !== 'undefined' && !window.supabase) {
  // Tentar importar do contexto da aplicação
  try {
    import('../integrations/supabase/client').then(module => {
      window.supabase = module.supabase;
      console.log('✅ Supabase exposto globalmente');
    });
  } catch (e) {
    console.warn('⚠️ Não foi possível expor Supabase globalmente:', e);
  }
}

console.log('🛠️ Ferramentas de debug carregadas!');
console.log('📋 Funções disponíveis:');
console.log('  - testDirectLogin(email, password)');
console.log('  - checkCurrentSession()');
console.log('  - startAuthMonitoring()');
console.log('  - stopAuthMonitoring()');
console.log('  - testSupabaseConnection()');
console.log('  - fullAuthDebug(email, password)');
console.log('\n🚀 Para começar: fullAuthDebug()');