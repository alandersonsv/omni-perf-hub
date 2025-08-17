import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { PlatformContent } from '@/components/PlatformContent';
import { FilterState } from '@/types/dashboardTypes';
import type { Database } from '@/integrations/supabase/types';

type Client = Database['public']['Tables']['agency_clients']['Row'];

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState('meta');
  const [selectedPage, setSelectedPage] = useState('KPIs Principais & Funil');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    campaign: 'all',
    source: 'all',
    device: 'all',
    client: 'all'
  });

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user?.user_metadata?.agency_id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('agency_clients')
        .select('*')
        .eq('agency_id', user.user_metadata.agency_id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedClientData = clients.find(client => client.id === selectedClient);

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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Carregando clientes..." : "Selecione um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedClient && selectedClientData && (
              <Alert>
                <AlertDescription>
                  Cliente selecionado: <strong>{selectedClientData.name}</strong>
                </AlertDescription>
              </Alert>
            )}
            
            {!loading && clients.length === 0 && (
              <Alert>
                <AlertDescription>
                  Nenhum cliente encontrado. Adicione clientes na seção de Gerenciamento de Clientes.
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