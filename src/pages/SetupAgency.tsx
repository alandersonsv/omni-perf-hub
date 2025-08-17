import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, AlertCircle } from 'lucide-react';

export function SetupAgency() {
  const { user, signOut: logout } = useAuth();
  const [formData, setFormData] = useState({
    agencyName: '',
    agencyEmail: user?.email || '',
    agencyPhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user has agency_id, redirect to dashboard
  if (user?.user_metadata?.agency_id) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.agencyName.trim()) {
      setError('Nome da agência é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      // Create agency
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          name: formData.agencyName,
          email: formData.agencyEmail || user.email!,
          phone: formData.agencyPhone,
          subscription_plan: 'trial',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        })
        .select()
        .single();

      if (agencyError) {
        throw agencyError;
      }

      // Create team member entry
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          id: user.id,
          agency_id: agencyData.id,
          email: user.email!,
          role: 'owner',
          accepted_at: new Date().toISOString()
        });

      if (teamError) {
        throw teamError;
      }

      setSuccess('Agência criada com sucesso! Redirecionando...');
      
      // Refresh the page to reload user data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao criar agência:', error);
      setError(error.message || 'Erro ao criar agência. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Configurar Agência</CardTitle>
          <CardDescription>
            Sua conta precisa estar associada a uma agência para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Conta detectada:</strong> {user.email}<br />
              Esta conta não está associada a nenhuma agência.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Opção 1: Criar Nova Agência</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie uma nova agência e torne-se o proprietário
              </p>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Nome da Agência *</Label>
                <Input
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  placeholder="Nome da sua agência"
                  value={formData.agencyName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyEmail">Email da Agência</Label>
                <Input
                  id="agencyEmail"
                  name="agencyEmail"
                  type="email"
                  placeholder="contato@agencia.com"
                  value={formData.agencyEmail}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyPhone">Telefone da Agência</Label>
                <Input
                  id="agencyPhone"
                  name="agencyPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.agencyPhone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert className="border-destructive">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Criando agência...' : 'Criar Agência'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Opção 2: Ser Convidado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Solicite a um administrador de agência existente que envie um convite para seu email: <strong>{user.email}</strong>
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleLogout}
              >
                Sair da Conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}