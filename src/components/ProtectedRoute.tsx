import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

// =====================================================
// PROTECTED ROUTE: STATUS-BASED ROUTING
// Baseado na nova arquitetura Database-First
// =====================================================

type UserStatus = 'loading' | 'no_agency' | 'onboarding_required' | 'ready' | 'error';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedStatuses?: UserStatus[];
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedStatuses = ['ready'],
  fallbackPath 
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.isLoading && state.user) {
      // Roteamento baseado em status
      switch (state.status) {
        case 'no_agency':
          if (!allowedStatuses.includes('no_agency')) {
            console.log('User needs agency, redirecting to setup');
            navigate('/setup-agency', { replace: true });
          }
          break;
        case 'onboarding_required':
          if (!allowedStatuses.includes('onboarding_required')) {
            console.log('User needs onboarding, redirecting to complete');
            navigate('/setup-agency', { replace: true });
          }
          break;
        case 'ready':
          if (!allowedStatuses.includes('ready') && fallbackPath) {
            console.log('User ready but not allowed here, redirecting to:', fallbackPath);
            navigate(fallbackPath, { replace: true });
          }
          break;
        case 'error':
          console.log('Auth error, redirecting to login');
          navigate('/login', { replace: true });
          break;
      }
    } else if (!state.isLoading && !state.user) {
      console.log('No user, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [state.status, state.isLoading, state.user, allowedStatuses, fallbackPath, navigate]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Status not allowed
  if (!allowedStatuses.includes(state.status)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}