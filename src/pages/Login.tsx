import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { state, actions } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Redirect based on user status
  useEffect(() => {
    if (!state.isLoading && state.user) {
      console.log('User logged in, status:', state.status);
      switch (state.status) {
        case 'ready':
          navigate('/dashboard', { replace: true });
          break;
        case 'no_agency':
        case 'onboarding_required':
          navigate('/setup-agency', { replace: true });
          break;
        case 'error':
          toast({
            title: 'Erro de autenticação',
            description: 'Houve um problema ao carregar seus dados. Tente fazer login novamente.',
            variant: 'destructive'
          });
          break;
      }
    }
  }, [state.status, state.isLoading, state.user, navigate, toast]);

  // Show loading during redirect to prevent flash
  if (state.user && !state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      console.log('Tentando fazer login com:', email);
      
      const success = await actions.login(email.trim(), password);

      if (success) {
        console.log('Login bem-sucedido');
        setSuccess('Login realizado com sucesso!');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando...',
        });
        // Redirecionamento será feito pelo useEffect quando user for atualizado
      } else {
        setError('Email ou senha inválidos. Verifique suas credenciais.');
        toast({
          title: 'Erro no login',
          description: 'Email ou senha inválidos.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = 'Erro ao fazer login. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Login</CardTitle>
          <CardDescription className="text-gray-600">
            Entre com suas credenciais para acessar o dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg transition-all duration-200"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg transition-all duration-200"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {error && (
              <Alert className="border-red-200 bg-red-50 rounded-lg">
                <AlertDescription className="text-red-700 font-medium flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 rounded-lg">
                <AlertDescription className="text-green-700 font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              asChild
            >
              <Link to="/forgot-password">
                Esqueci a Senha
              </Link>
            </Button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/register" className="text-primary hover:underline">
              Cadastre-se aqui
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}