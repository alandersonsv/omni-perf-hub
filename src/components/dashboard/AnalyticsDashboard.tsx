import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Building2 } from 'lucide-react';
import { getClientsByUserId } from '@/data/mockClientData';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { PlatformContent } from '@/components/PlatformContent';
import { FilterState } from '@/types/dashboardTypes';

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState('Meta Ads');
  const [selectedPage, setSelectedPage] = useState('KPIs');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'Últimos 30 dias',
    campaign: 'Todas',
    source: 'Todas',
    device: 'Todos'
  });

  const userClients = getClientsByUserId(user?.id || '');
  const selectedClientData = userClients.find(client => client.id === selectedClient);

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Cliente</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cliente para visualizar os dados" />
                </SelectTrigger>
                <SelectContent>
                  {userClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClientData && (
              <Alert>
                <Building2 className="w-4 h-4" />
                <AlertDescription>
                  Visualizando dados de: <strong>{selectedClientData.name}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      {selectedClient ? (
        <div className="space-y-6">
          <DashboardHeader
            activePlatform={selectedPlatform}
            activePage={selectedPage}
            onPlatformChange={setSelectedPlatform}
            onPageChange={setSelectedPage}
          />
          
          <DashboardFilters filters={filters} onFiltersChange={setFilters} />
          
          <PlatformContent 
            platform={selectedPlatform} 
            page={selectedPage} 
            filters={filters} 
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Selecione um Cliente</h3>
              <p>Escolha um cliente na lista acima para visualizar seus dados de analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}