import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Database } from '@/integrations/supabase/types';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { useToast } from '@/hooks/use-toast';

interface GA4IntegrationProps {
  agencyId: string;
}

// Use the correct Supabase type for GA4 data
type GA4DataBase = Database['public']['Tables']['ga4_daily']['Row'];

// Extended interface with mapped fields for compatibility
interface GA4Data extends GA4DataBase {
  // Mapped fields for compatibility with existing code
  active_users: number;
  screen_page_views: number;
  total_revenue: number;
  // Additional fields that might be calculated
  average_session_duration?: number;
  engaged_sessions?: number;
  engagement_rate: number;
}

// Use the correct Supabase type for integrations
type Integration = Database['public']['Tables']['integrations']['Row'];

const GA4Integration: React.FC<GA4IntegrationProps> = ({ agencyId }) => {
  const supabase = useSupabaseClient<Database>();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [analyticsData, setAnalyticsData] = useState<GA4Data[]>([]);
  
  // Function to map Supabase data to expected GA4Data format
  const mapSupabaseToGA4Data = (baseData: GA4DataBase): GA4Data => {
    return {
      ...baseData,
      // Map Supabase fields to expected interface fields
      active_users: baseData.users || 0,
      screen_page_views: baseData.pageviews || 0,
      total_revenue: baseData.revenue || 0,
      // Set default values for optional fields
      average_session_duration: 0, // This might need to be calculated or fetched separately
      engaged_sessions: 0, // This might need to be calculated or fetched separately
      engagement_rate: baseData.bounce_rate ? (1 - baseData.bounce_rate) : 0,
    };
  };
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'acquisition'>('overview');

  // Fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('platform', 'ga4');

        if (error) throw error;

        setIntegrations(data || []);
        if (data && data.length > 0) {
          setSelectedProperty(data[0].account_id); // account_id stores property_id for GA4
        }
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError('Falha ao carregar integrações do Google Analytics 4');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [agencyId, supabase]);

  // Fetch analytics data when property or time range changes
  useEffect(() => {
    if (!selectedProperty) return;

    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }

        const { data, error } = await supabase
          .from('ga4_daily')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('property_id', selectedProperty)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;

        // Transform Supabase data to expected GA4Data format
        const mappedData = (data || []).map((item: GA4DataBase) => 
          mapSupabaseToGA4Data(item)
        );
        setAnalyticsData(mappedData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Falha ao carregar dados do Google Analytics 4');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [agencyId, selectedProperty, timeRange, supabase]);

  // Trigger sync
  const handleSync = async () => {
    if (!selectedProperty) return;

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ga4-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          agency_id: agencyId,
          property_id: selectedProperty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao sincronizar dados do Google Analytics 4');
      }

      // Update integration last_sync
      const { error: updateError } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('agency_id', agencyId)
        .eq('platform', 'ga4')
        .eq('account_id', selectedProperty);

      if (updateError) throw updateError;

      // Refresh analytics data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('ga4_daily')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('property_id', selectedProperty)
        .order('date', { ascending: true });

      if (refreshError) throw refreshError;

      // Transform refreshed Supabase data to expected GA4Data format
      const mappedRefreshedData = (refreshedData || []).map((item: GA4DataBase) => 
        mapSupabaseToGA4Data(item)
      );
      setAnalyticsData(mappedRefreshedData);
    } catch (err) {
      console.error('Error syncing GA4 data:', err);
      setError(err instanceof Error ? err.message : 'Falha ao sincronizar dados do Google Analytics 4');
    } finally {
      setSyncing(false);
    }
  };

  const { initiateConnection, handleCallback, refreshToken, isConnecting: isOAuthConnecting, error: oauthError } = useOAuthFlow();
  const { toast } = useToast();

  // Connect Google Analytics 4
  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Iniciar o fluxo OAuth para Google Analytics 4
      await initiateConnection('google');
      
      toast({
        title: "Iniciando conexão",
        description: "Conectando com Google Analytics 4...",
      });
    } catch (err) {
      console.error('Error connecting GA4:', err);
      setError(err instanceof Error ? err.message : 'Falha ao conectar Google Analytics 4');
      toast({
        title: "Erro na conexão",
        description: err instanceof Error ? err.message : "Não foi possível conectar o Google Analytics 4.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    return analyticsData.map(day => ({
      date: day.date,
      users: day.active_users,
      newUsers: day.new_users,
      sessions: day.sessions,
      pageViews: day.screen_page_views,
      conversions: day.conversions,
      revenue: day.total_revenue,
      engagementRate: day.engagement_rate * 100, // Convert to percentage
      bounceRate: day.bounce_rate * 100, // Convert to percentage
    }));
  };

  const chartData = prepareChartData();

  // Calculate summary metrics
  const calculateSummary = () => {
    if (analyticsData.length === 0) {
      return {
        users: 0,
        newUsers: 0,
        sessions: 0,
        pageViews: 0,
        conversions: 0,
        revenue: 0,
        engagementRate: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      };
    }

    const totals = analyticsData.reduce((acc, day) => {
      acc.users += day.active_users || 0;
      acc.newUsers += day.new_users || 0;
      acc.sessions += day.sessions || 0;
      acc.pageViews += day.screen_page_views || 0;
      acc.conversions += day.conversions || 0;
      acc.revenue += day.total_revenue || 0;
      acc.engagementRateSum += day.engagement_rate || 0;
      acc.bounceRateSum += day.bounce_rate || 0;
      acc.sessionDurationSum += day.average_session_duration || 0;
      
      return acc;
    }, {
      users: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      conversions: 0,
      revenue: 0,
      engagementRateSum: 0,
      bounceRateSum: 0,
      sessionDurationSum: 0,
    });
    
    // Calculate averages
    const days = analyticsData.length;
    const summary = {
      users: totals.users,
      newUsers: totals.newUsers,
      sessions: totals.sessions,
      pageViews: totals.pageViews,
      conversions: totals.conversions,
      revenue: totals.revenue,
      engagementRate: (totals.engagementRateSum / days) * 100, // Convert to percentage
      bounceRate: (totals.bounceRateSum / days) * 100, // Convert to percentage
      avgSessionDuration: totals.sessionDurationSum / days,
    };
    
    return summary;
  };

  const summary = calculateSummary();

  // Format session duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading && integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics 4</CardTitle>
          <CardDescription>Visualize o desempenho do seu site com o Google Analytics 4</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics 4</CardTitle>
          <CardDescription>Conecte sua propriedade do Google Analytics 4 para visualizar os dados</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-center text-muted-foreground">
            Nenhuma propriedade do Google Analytics 4 conectada. Conecte sua propriedade para visualizar os dados.
          </p>
          <Button onClick={handleConnect}>Conectar Google Analytics 4</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Google Analytics 4</CardTitle>
            <CardDescription>Visualize o desempenho do seu site com o Google Analytics 4</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="border rounded p-1 text-sm"
              value={selectedProperty || ''}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              {integrations.map((integration) => (
                <option key={integration.account_id} value={integration.account_id}>
                  {integration.credentials?.property_name || integration.account_id}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
            >
              Conectar Propriedade
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.users.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Novos: {summary.newUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Sessões</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.sessions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Duração média: {formatDuration(summary.avgSessionDuration)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.pageViews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Por sessão: {(summary.sessions > 0 ? summary.pageViews / summary.sessions : 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.conversions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Receita: R$ {summary.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end space-x-2 my-4">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 Dias
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 Dias
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90 Dias
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="Usuários" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="sessions" name="Sessões" stroke="#10b981" />
                    <Line type="monotone" dataKey="pageViews" name="Visualizações" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-4">
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="engagementRate" name="Taxa de Engajamento (%)" fill="#3b82f6" />
                    <Bar dataKey="bounceRate" name="Taxa de Rejeição (%)" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{summary.engagementRate.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    Porcentagem de sessões que duraram mais de 10 segundos, tiveram uma conversão ou mais de uma visualização de página
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{summary.bounceRate.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    Porcentagem de sessões que não tiveram engajamento
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="acquisition" className="space-y-4">
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="Usuários" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="newUsers" name="Novos Usuários" stroke="#ec4899" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aquisição de Usuários</CardTitle>
                <CardDescription>Proporção de novos usuários vs. usuários recorrentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{summary.newUsers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Novos Usuários</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {summary.users > 0 ? ((summary.newUsers / summary.users) * 100).toFixed(1) : 0}% do total
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold">{(summary.users - summary.newUsers).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Usuários Recorrentes</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {summary.users > 0 ? (((summary.users - summary.newUsers) / summary.users) * 100).toFixed(1) : 0}% do total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {selectedProperty && integrations.find(i => i.account_id === selectedProperty)?.last_sync ? (
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            Última sincronização: {new Date(integrations.find(i => i.account_id === selectedProperty)?.last_sync as string).toLocaleString()}
          </div>
        ) : (
          <div>Ainda não sincronizado</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default GA4Integration;