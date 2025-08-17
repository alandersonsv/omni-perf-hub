import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function Register() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    agencyEmail: '',
    agencyPhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (!formData.agencyName.trim()) {
      setError('Nome da agência é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            agency_name: formData.agencyName,
            agency_email: formData.agencyEmail,
            agency_phone: formData.agencyPhone
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // 2. Criar agência na tabela agencies
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .insert({
            name: formData.agencyName,
            email: formData.agencyEmail || formData.email,
            phone: formData.agencyPhone,
            subscription_plan: 'trial',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
          })
          .select()
          .single();

        if (agencyError) {
          throw agencyError;
        }

        // 3. Criar membro da equipe (owner)
        const { error: teamError } = await supabase
          .from('team_members')
          .insert({
            id: authData.user.id,
            agency_id: agencyData.id,
            email: formData.email,
            role: 'owner',
            accepted_at: new Date().toISOString()
          });

        if (teamError) {
          throw teamError;
        }

        setSuccess('Conta criada com sucesso! Verifique seu email para confirmar a conta.');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        setError('Este email já está cadastrado. Use a opção "Esqueci a Senha" na página de login para recuperar sua conta.');
      } else if (error.message?.includes('Invalid email')) {
        setError('Email inválido. Verifique o formato do email e tente novamente.');
      } else if (error.message?.includes('Password')) {
        setError('Senha inválida. A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(error.message || 'Erro ao criar conta. Verifique os dados e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Registre sua agência e comece a usar o dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dados do usuário */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dados da agência */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Dados da Agência</h3>
              
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyEmail">Email da Agência</Label>
                <Input
                  id="agencyEmail"
                  name="agencyEmail"
                  type="email"
                  placeholder="contato@agencia.com (opcional)"
                  value={formData.agencyEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyPhone">Telefone da Agência</Label>
                <Input
                  id="agencyPhone"
                  name="agencyPhone"
                  type="tel"
                  placeholder="(11) 99999-9999 (opcional)"
                  value={formData.agencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <Alert className="border-destructive">
                <AlertDescription className="text-destructive">
                  {error}
                  {error.includes('já está cadastrado') && (
                    <div className="mt-2">
                      <Link to="/login" className="text-primary hover:underline font-medium">
                        Ir para a página de login
                      </Link>
                    </div>
                  )}
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
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}