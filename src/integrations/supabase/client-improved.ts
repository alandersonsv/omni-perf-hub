import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração com validação de ambiente
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const mode = import.meta.env.MODE;
  const isProd = import.meta.env.PROD;
  
  // Log de configuração para debug
  console.log('🔧 Supabase Config Check:', {
    mode,
    isProd,
    hasUrl: !!url,
    hasKey: !!key,
    urlValid: url && !url.includes('your-project') && !url.includes('localhost'),
    keyValid: key && key.length > 50,
    timestamp: new Date().toISOString()
  });
  
  // Validação para produção
  if (isProd) {
    if (!url || url.includes('your-project') || url.includes('localhost')) {
      const error = '❌ ERRO CRÍTICO: VITE_SUPABASE_URL não configurada para produção';
      console.error(error, {
        receivedUrl: url,
        environment: mode,
        timestamp: new Date().toISOString()
      });
      
      // Mostrar alerta visual em produção
      if (typeof window !== 'undefined') {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: #dc2626;
          color: white;
          padding: 10px;
          text-align: center;
          z-index: 9999;
          font-family: monospace;
        `;
        errorDiv.textContent = 'ERRO: Supabase não configurado para produção';
        document.body.appendChild(errorDiv);
      }
      
      throw new Error('Supabase URL não configurada para produção');
    }
    
    if (!key || key.includes('demo') || key.length < 50) {
      const error = '❌ ERRO CRÍTICO: VITE_SUPABASE_ANON_KEY não configurada para produção';
      console.error(error, {
        hasKey: !!key,
        keyLength: key?.length || 0,
        environment: mode,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Supabase Key não configurada para produção');
    }
    
    console.log('✅ Configuração de produção validada com sucesso');
  }
  
  // Fallback para desenvolvimento
  const finalUrl = url || "http://127.0.0.1:54321";
  const finalKey = key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
  
  console.log('✅ Supabase Config Final:', {
    url: finalUrl,
    keyPrefix: finalKey.substring(0, 20) + '...',
    environment: mode,
    isProduction: isProd,
    timestamp: new Date().toISOString()
  });
  
  return { url: finalUrl, key: finalKey };
};

const { url, key } = getSupabaseConfig();

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'metrionix-web',
      'X-Environment': import.meta.env.MODE,
      'X-Build-Time': new Date().toISOString()
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Teste de conectividade na inicialização (apenas em produção)
if (import.meta.env.PROD) {
  console.log('🌐 Testando conectividade Supabase em produção...');
  
  const connectivityTest = async () => {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = performance.now();
      
      if (error) {
        console.error('❌ Erro de conectividade Supabase:', {
          error: error.message,
          status: error.status,
          responseTime: `${(endTime - startTime).toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('✅ Conectividade Supabase OK:', {
          hasSession: !!data.session,
          responseTime: `${(endTime - startTime).toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Falha crítica na conectividade:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Executar teste após um pequeno delay para não bloquear a inicialização
  setTimeout(connectivityTest, 1000);
}

// Expor para debugging global (apenas em produção)
if (import.meta.env.PROD && typeof window !== 'undefined') {
  window.supabaseDebug = {
    client: supabase,
    testConnection: async () => {
      console.log('🧪 Testando conexão manual...');
      const { data, error } = await supabase.auth.getSession();
      console.log('Resultado:', { data, error });
      return { data, error };
    },
    testLogin: async (email: string, password: string) => {
      console.log('🧪 Testando login manual...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Resultado:', { data, error });
      return { data, error };
    },
    getConfig: () => ({
      url: supabase.supabaseUrl,
      keyPrefix: supabase.supabaseKey.substring(0, 20) + '...',
      environment: import.meta.env.MODE
    })
  };
  
  console.log('🔧 Debug tools disponíveis em window.supabaseDebug');
}

// Log de inicialização completa
console.log('🚀 Supabase client inicializado:', {
  url: supabase.supabaseUrl,
  keyPrefix: supabase.supabaseKey.substring(0, 20) + '...',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});