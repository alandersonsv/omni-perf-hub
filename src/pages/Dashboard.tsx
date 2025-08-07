import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Building2, BarChart3, Bell, Zap, MessageSquare } from 'lucide-react';
import { UserManagement } from '@/components/dashboard/UserManagement';
import { ClientManagement } from '@/components/dashboard/ClientManagement';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { AlertsManagement } from '@/components/dashboard/AlertsManagement';
import { IntegrationsManagement } from '@/components/dashboard/IntegrationsManagement';
import { TeamManagement } from '@/components/dashboard/TeamManagement';
import { ReportsBuilder } from '@/components/dashboard/ReportsBuilder';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Dashboard Integrado</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Bem-vindo, {user.name}
            </span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Integrações
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Equipe
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsBuilder />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsManagement />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsManagement />
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}