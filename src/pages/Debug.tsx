import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, RefreshCw, Database, HardDrive } from 'lucide-react';

export function Debug() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearAllBrowserData = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB (Supabase pode usar)
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
      
      setMessage('Todos os dados do navegador foram limpos. Recarregando página...');
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage('Erro ao limpar dados: ' + (error as Error).message);
    }
  };

  const checkSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('agencies').select('count').limit(1);
      if (error) {
        setMessage('Erro na conexão com Supabase: ' + error.message);
      } else {
        setMessage('Conexão com Supabase OK. Tabelas acessíveis.');
      }
    } catch (error) {
      setMessage('Erro ao testar conexão: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setMessage('Nenhum usuário logado: ' + error.message);
      } else if (user) {
        setMessage(`Usuário atual logado: ${user.email} (ID: ${user.id})`);
      } else {
        setMessage('Nenhum usuário logado no momento.');
      }
    } catch (error) {
      setMessage('Erro ao verificar usuário atual: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testRegistration = async () => {
    setIsLoading(true);
    const testEmail = 'test-' + Date.now() + '@example.com';
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456'
      });
      
      if (error) {
        setMessage('Erro no teste de registro: ' + error.message);
      } else {
        setMessage(`Teste de registro OK. Usuário criado: ${testEmail}`);
      }
    } catch (error) {
      setMessage('Erro no teste: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBrowserData = () => {
    const data = {
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      cookies: document.cookie.split(';').length,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    setMessage(`Dados do navegador:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Debug - Diagnóstico do Sistema</CardTitle>
          <CardDescription>
            Ferramentas para diagnosticar e resolver problemas de registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={clearAllBrowserData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados do Navegador
            </Button>
            
            <Button 
              onClick={checkSupabaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Testar Conexão Supabase
            </Button>
            
            <Button 
              onClick={checkCurrentUser}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Usuário Atual
            </Button>
            
            <Button 
              onClick={testRegistration}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Teste de Registro
            </Button>
            
            <Button 
              onClick={getCurrentBrowserData}
              variant="secondary"
              className="w-full md:col-span-2"
            >
              Verificar Dados do Navegador
            </Button>
          </div>
          
          {message && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">{message}</pre>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Informações do Sistema:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>URL Atual:</strong> {window.location.href}</p>
              <p><strong>Supabase URL:</strong> http://127.0.0.1:54321</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Instruções:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Clique em "Limpar Todos os Dados do Navegador" primeiro</li>
              <li>Aguarde o reload automático da página</li>
              <li>Teste "Verificar Usuário Atual" para ver se há sessão ativa</li>
              <li>Teste "Teste de Registro" para verificar se funciona</li>
              <li>Se tudo estiver OK, tente registrar normalmente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}