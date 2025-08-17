import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export function OAuthDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar variáveis de ambiente
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const metaAppId = import.meta.env.VITE_META_APP_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const oauthSecret = import.meta.env.VITE_OAUTH_STATE_SECRET;

    // Google Client ID
    if (!googleClientId || googleClientId === 'your_actual_google_client_id_here') {
      diagnostics.push({
        name: 'Google Client ID',
        status: 'error',
        message: 'Não configurado',
        details: 'Configure VITE_GOOGLE_CLIENT_ID no arquivo .env com um valor válido do Google Cloud Console'
      });
    } else {
      diagnostics.push({
        name: 'Google Client ID',
        status: 'success',
        message: 'Configurado',
        details: `ID: ${googleClientId.substring(0, 20)}...`
      });
    }

    // Meta App ID
    if (!metaAppId || metaAppId === 'your_actual_meta_app_id_here') {
      diagnostics.push({
        name: 'Meta App ID',
        status: 'error',
        message: 'Não configurado',
        details: 'Configure VITE_META_APP_ID no arquivo .env com um valor válido do Facebook Developers'
      });
    } else {
      diagnostics.push({
        name: 'Meta App ID',
        status: 'success',
        message: 'Configurado',
        details: `ID: ${metaAppId.substring(0, 20)}...`
      });
    }

    // Supabase URL
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      diagnostics.push({
        name: 'Supabase URL',
        status: 'error',
        message: 'Não configurado',
        details: 'Configure VITE_SUPABASE_URL no arquivo .env'
      });
    } else {
      diagnostics.push({
        name: 'Supabase URL',
        status: 'success',
        message: 'Configurado',
        details: supabaseUrl
      });
    }

    // Supabase Key
    if (!supabaseKey || supabaseKey === 'your_actual_supabase_anon_key_here') {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: 'Não configurado',
        details: 'Configure VITE_SUPABASE_ANON_KEY no arquivo .env'
      });
    } else {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'success',
        message: 'Configurado',
        details: `Key: ${supabaseKey.substring(0, 20)}...`
      });
    }

    // OAuth Secret
    if (!oauthSecret || oauthSecret === 'your_secure_random_string_here') {
      diagnostics.push({
        name: 'OAuth State Secret',
        status: 'warning',
        message: 'Não configurado',
        details: 'Configure VITE_OAUTH_STATE_SECRET para melhor segurança'
      });
    } else {
      diagnostics.push({
        name: 'OAuth State Secret',
        status: 'success',
        message: 'Configurado'
      });
    }

    // 2. Testar conectividade com Supabase
    try {
      const { data, error } = await supabase.from('integrations').select('count').limit(1);
      if (error) {
        if (error.code === '42P17') {
          diagnostics.push({
            name: 'Supabase RLS',
            status: 'error',
            message: 'Erro de recursão infinita detectado',
            details: 'As políticas RLS da tabela team_members precisam ser corrigidas'
          });
        } else {
          diagnostics.push({
            name: 'Conectividade Supabase',
            status: 'error',
            message: 'Erro de conexão',
            details: error.message
          });
        }
      } else {
        diagnostics.push({
          name: 'Conectividade Supabase',
          status: 'success',
          message: 'Conexão estabelecida'
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Conectividade Supabase',
        status: 'error',
        message: 'Falha na conexão',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // 3. Verificar suporte a popups
    try {
      const testPopup = window.open('', 'test', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        diagnostics.push({
          name: 'Suporte a Popups',
          status: 'success',
          message: 'Popups habilitados'
        });
      } else {
        diagnostics.push({
          name: 'Suporte a Popups',
          status: 'error',
          message: 'Popups bloqueados',
          details: 'Habilite popups para este site nas configurações do navegador'
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Suporte a Popups',
        status: 'error',
        message: 'Erro ao testar popups',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'success' ? 'OK' : status === 'warning' ? 'Aviso' : 'Erro'}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnóstico OAuth e Configurações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando diagnóstico...
              </>
            ) : (
              'Executar Diagnóstico'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.name}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}