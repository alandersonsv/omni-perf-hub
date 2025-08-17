import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Zap, ArrowLeft, Menu } from 'lucide-react';
import { IntegrationsManagement } from '@/components/dashboard/IntegrationsManagement';
import { useMobile } from '@/hooks/use-mobile';

export function Integrations() {
  const { user, logout } = useAuth();
  const { isMobile } = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Integrações</h1>
          </div>
          {isMobile ? (
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Bem-vindo, {user.name}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
        {isMobile && menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b shadow-md p-2 animate-in slide-in-from-top">
            <span className="block text-sm text-muted-foreground mb-2 px-2">
              Bem-vindo, {user.name}
            </span>
            <Button onClick={logout} variant="outline" size="sm" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Integrações</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Conecte suas plataformas de marketing e análise para visualizar todos os dados em um só lugar.
          </p>
        </div>

        <IntegrationsManagement />
      </div>
    </div>
  );
}