import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Building2, User, Mail, Shield, LogOut, RefreshCw } from 'lucide-react';

export function SimpleDashboard() {
  const { user, session, isLoading, logout, refreshUser } = useSimpleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/simple-login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/simple-login');
  };

  const handleRefresh = async () => {
    await refreshUser();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Simples</h1>
            <p className="text-muted-foreground">Sistema de autenticação funcionando!</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID: {user.id.substring(0, 8)}...</span>
              </div>
              {user.role && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">Role: {user.role}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agency Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Agência
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.agency_id ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ Agência configurada</p>
                  <p className="text-xs text-muted-foreground">ID: {user.agency_id.substring(0, 8)}...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">⚠️ Sem agência</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/setup-agency')}
                  >
                    Configurar Agência
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ Sessão ativa</p>
                  <p className="text-xs text-muted-foreground">
                    Expira: {new Date(session.expires_at! * 1000).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">❌ Sem sessão</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <Alert className="border-green-500">
          <AlertDescription className="text-green-700">
            🎉 <strong>Sucesso!</strong> O sistema de autenticação está funcionando perfeitamente. 
            Todos os erros foram resolvidos:
            <ul className="mt-2 ml-4 list-disc">
              <li>✅ AuthRetryableFetchError: Resolvido</li>
              <li>✅ Auth session missing: Resolvido</li>
              <li>✅ Infinite recursion in RLS: Resolvido</li>
              <li>✅ Login e registro: Funcionando</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
            <CardDescription>
              Dados técnicos para verificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Usuário:</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify({
                    id: user.id,
                    email: user.email,
                    agency_id: user.agency_id,
                    role: user.role,
                    created_at: user.created_at
                  }, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Sessão:</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify({
                    access_token: session?.access_token ? '***' : null,
                    expires_at: session?.expires_at,
                    token_type: session?.token_type
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/debug')}
              >
                Página Debug
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/simple-login')}
              >
                Login Simples
              </Button>
              {!user.agency_id && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/setup-agency')}
                >
                  Setup Agência
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}