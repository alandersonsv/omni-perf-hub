import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, Building, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    agencyEmail: '',
    agencyPhone: ''
  });
  
  // Estados para validações específicas por campo
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    agencyEmail: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Funções de validação específicas
  const validateEmail = (email: string): string => {
    if (!email) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (!/(?=.*[a-z])/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/(?=.*\d)/.test(password)) return 'Senha deve conter pelo menos um número';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (confirmPassword !== password) return 'Senhas não coincidem';
    return '';
  };

  const validateAgencyName = (agencyName: string): string => {
    if (!agencyName.trim()) return 'Nome da agência é obrigatório';
    if (agencyName.trim().length < 2) return 'Nome da agência deve ter pelo menos 2 caracteres';
    return '';
  };

  const validateAgencyEmail = (agencyEmail: string): string => {
    if (agencyEmail && !validateEmail(agencyEmail)) {
      return 'Formato de email da agência inválido';
    }
    return '';
  };

  // Verificar se email já existe
  const checkEmailExists = async (email: string) => {
    if (!email || validateEmail(email)) return;
    
    setIsCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
      
      if (data) {
        setFieldErrors(prev => ({ ...prev, email: 'Este email já está cadastrado' }));
      }
    } catch (error) {
      // Email não encontrado, está disponível
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpar erro geral quando usuário começar a digitar
    if (error) setError('');

    // Validação em tempo real
    let fieldError = '';
    switch (name) {
      case 'email':
        fieldError = validateEmail(value);
        if (!fieldError && value) {
          // Verificar se email já existe após 1 segundo de inatividade
          setTimeout(() => checkEmailExists(value), 1000);
        }
        break;
      case 'password':
        fieldError = validatePassword(value);
        // Re-validar confirmação de senha se já foi preenchida
        if (formData.confirmPassword) {
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
          }));
        }
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(value, formData.password);
        break;
      case 'agencyName':
        fieldError = validateAgencyName(value);
        break;
      case 'agencyEmail':
        fieldError = validateAgencyEmail(value);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validar todos os campos antes de enviar
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      agencyName: validateAgencyName(formData.agencyName),
      agencyEmail: validateAgencyEmail(formData.agencyEmail)
    };

    // Verificar se há erros
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setFieldErrors(errors);
      setError('Por favor, corrija os erros nos campos destacados.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Tentando registrar usuário:', formData.email);
      
      // Verificar se agência já existe
      const { data: existingAgency } = await supabase
        .from('agencies')
        .select('name')
        .ilike('name', formData.agencyName.trim())
        .single();
      
      if (existingAgency) {
        setFieldErrors(prev => ({ ...prev, agencyName: 'Nome da agência já está em uso' }));
        setError('Nome da agência já está cadastrado. Escolha outro nome.');
        setIsLoading(false);
        return;
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            agency_name: formData.agencyName.trim(),
            agency_email: formData.agencyEmail.trim() || null,
            agency_phone: formData.agencyPhone.trim() || null
          }
        }
      });

      if (authError) {
        console.error('Erro no registro auth:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('Usuário criado com sucesso:', authData.user.email);
        setSuccess('Conta criada com sucesso! Redirecionando para o login...');
        
        // Limpar formulário
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          agencyName: '',
          agencyEmail: '',
          agencyPhone: ''
        });
        
        setFieldErrors({
          email: '',
          password: '',
          confirmPassword: '',
          agencyName: '',
          agencyEmail: ''
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Mensagens de erro específicas baseadas no código de erro do Supabase
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already_registered') ||
          error.code === 'user_already_exists') {
        setFieldErrors(prev => ({ ...prev, email: 'Este email já está cadastrado' }));
        setError('Este email já está cadastrado. Tente fazer login ou use "Esqueci a Senha".');
      } else if (error.message?.includes('Invalid email') || 
                 error.message?.includes('invalid_email')) {
        setFieldErrors(prev => ({ ...prev, email: 'Formato de email inválido' }));
        setError('Email inválido. Verifique o formato do email.');
      } else if (error.message?.includes('Password') || 
                 error.message?.includes('Weak password') ||
                 error.message?.includes('password')) {
        setFieldErrors(prev => ({ ...prev, password: 'Senha muito fraca ou inválida' }));
        setError('Senha deve ter pelo menos 6 caracteres, incluir letras e números.');
      } else if (error.message?.includes('Email rate limit') ||
                 error.message?.includes('rate_limit')) {
        setError('Muitas tentativas de registro. Aguarde alguns minutos e tente novamente.');
      } else if (error.message?.includes('network') ||
                 error.message?.includes('fetch')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(`Erro ao criar conta: ${error.message || 'Erro desconhecido. Tente novamente.'}`);
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
            <div className="space-y-2">
              <Label htmlFor="email" className={fieldErrors.email ? 'text-destructive' : ''}>Email *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldErrors.email ? 'border-destructive focus:border-destructive' : ''}
                  required
                />
                {isCheckingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isCheckingEmail && formData.email && !fieldErrors.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {fieldErrors.email && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={fieldErrors.password ? 'text-destructive' : ''}>Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres, letras e números"
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? 'border-destructive focus:border-destructive' : ''}
                  required
                />
                {formData.password && !fieldErrors.password && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {fieldErrors.password && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={fieldErrors.confirmPassword ? 'text-destructive' : ''}>Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? 'border-destructive focus:border-destructive' : ''}
                  required
                />
                {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {fieldErrors.confirmPassword && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Dados da Agência</h3>
              
              <div className="space-y-2">
                <Label htmlFor="agencyName" className={fieldErrors.agencyName ? 'text-destructive' : ''}>Nome da Agência *</Label>
                <div className="relative">
                  <Input
                    id="agencyName"
                    name="agencyName"
                    type="text"
                    placeholder="Nome da sua agência"
                    value={formData.agencyName}
                    onChange={handleChange}
                    className={fieldErrors.agencyName ? 'border-destructive focus:border-destructive' : ''}
                    required
                  />
                  {formData.agencyName && !fieldErrors.agencyName && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {fieldErrors.agencyName && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                  )}
                </div>
                {fieldErrors.agencyName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.agencyName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyEmail" className={fieldErrors.agencyEmail ? 'text-destructive' : ''}>Email da Agência</Label>
                <div className="relative">
                  <Input
                    id="agencyEmail"
                    name="agencyEmail"
                    type="email"
                    placeholder="contato@agencia.com (opcional)"
                    value={formData.agencyEmail}
                    onChange={handleChange}
                    className={fieldErrors.agencyEmail ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formData.agencyEmail && !fieldErrors.agencyEmail && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {fieldErrors.agencyEmail && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                  )}
                </div>
                {fieldErrors.agencyEmail && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.agencyEmail}
                  </p>
                )}
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