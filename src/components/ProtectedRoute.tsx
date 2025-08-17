import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAgency?: boolean;
}

export function ProtectedRoute({ children, requireAgency = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If agency is required but user doesn't have one, redirect to setup
  if (requireAgency && !user.user_metadata?.agency_id) {
    return <Navigate to="/setup-agency" replace />;
  }

  return <>{children}</>;
}