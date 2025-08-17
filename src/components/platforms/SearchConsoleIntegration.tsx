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

interface SearchConsoleIntegrationProps {
  agencyId: string;
}

interface SearchConsoleData {
  id: number;
  agency_id: string;
  site_url: string;
  page: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  query?: string;
  country?: string;
  device?: string;
}

// Use the correct Supabase type for integrations
type Integration = Database['public']['Tables']['integrations']['Row'];

const SearchConsoleIntegration: React.FC<SearchConsoleIntegrationProps> = ({ agencyId }) => {
  const supabase = useSupabaseClient<Database>();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchData, setSearchData] = useState<SearchConsoleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'pages' | 'queries' | 'devices'>('pages');

  // Fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('platform', 'search_console');

        if (error) throw error;

        setIntegrations(data || []);
        if (data && data.length > 0) {
          setSelectedSite(data[0].account_id); // account_id stores site_url for Search Console
        }
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError('Falha ao carregar integrações do Search Console');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [agencyId, supabase]);

  // Fetch search console data when site or time range changes
  useEffect(() => {
    if (!selectedSite) return;

    const fetchSearchData = async () => {
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
          .from('search_console_pages_daily')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('site_url', selectedSite)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;

        setSearchData(data || []);
      } catch (err) {
        console.error('Error fetching search console data:', err);
        setError('Falha ao carregar dados do Search Console');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, [agencyId, selectedSite, timeRange, supabase]);

  // Trigger sync
  const handleSync = async () => {
    if (!selectedSite) return;

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-console-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          agency_id: agencyId,
          site_url: selectedSite,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao sincronizar dados do Search Console');
      }

      // Update integration last_sync
      const { error: updateError } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('agency_id', agencyId)
        .eq('platform', 'search_console')
        .eq('account_id', selectedSite);

      if (updateError) throw updateError;

      // Refresh search data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('search_console_pages_daily')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('site_url', selectedSite)
        .order('date', { ascending: true });

      if (refreshError) throw refreshError;

      setSearchData(refreshedData || []);
    } catch (err) {
      console.error('Error syncing Search Console data:', err);
      setError(err instanceof Error ? err.message : 'Falha ao sincronizar dados do Search Console');
    } finally {
      setSyncing(false);
    }
  };

  const { initiateOAuthFlow } = useOAuthFlow();
  const { toast } = useToast();

  // Connect Search Console
  const handleConnect = async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Iniciando conexão",
        description: "Conectando ao Google Search Console...",
      });
      
      await initiateOAuthFlow({
        platformId: "search-console",
        scope: "https://www.googleapis.com/auth/webmasters.readonly",
        provider: "google"
      });
      
      toast({
        title: "Integração conectada",
        description: "Google Search Console foi conectado com sucesso.",
      });
    } catch (err) {
      console.error('Error connecting Search Console:', err);
      setError(err instanceof Error ? err.message : 'Falha ao conectar Search Console');
      toast({
        title: "Erro na conexão",
        description: err instanceof Error ? err.message : "Não foi possível conectar o Google Search Console.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for pages
  const preparePagesChartData = () => {
    // Group by date and sum metrics
    const dailyData = searchData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          count: 0,
        };
      }
      
      acc[date].clicks += item.clicks || 0;
      acc[date].impressions += item.impressions || 0;
      acc[date].ctr += item.ctr || 0;
      acc[date].position += item.position || 0;
      acc[date].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages and format for chart
    return Object.values(dailyData).map(day => ({
      date: day.date,
      clicks: day.clicks,
      impressions: day.impressions,
      ctr: (day.ctr / day.count) * 100, // Convert to percentage
      position: day.position / day.count,
    }));
  };

  const pagesChartData = preparePagesChartData();

  // Get top pages
  const getTopPages = () => {
    // Group by page and sum metrics
    const pageData = searchData.reduce((acc, item) => {
      const page = item.page;
      if (!acc[page]) {
        acc[page] = {
          page,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          count: 0,
        };
      }
      
      acc[page].clicks += item.clicks || 0;
      acc[page].impressions += item.impressions || 0;
      acc[page].ctr += item.ctr || 0;
      acc[page].position += item.position || 0;
      acc[page].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages and sort by clicks
    return Object.values(pageData)
      .map(page => ({
        page: page.page,
        clicks: page.clicks,
        impressions: page.impressions,
        ctr: (page.ctr / page.count) * 100, // Convert to percentage
        position: page.position / page.count,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10); // Top 10 pages
  };

  const topPages = getTopPages();

  // Calculate summary metrics
  const calculateSummary = () => {
    if (searchData.length === 0) {
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      };
    }

    // Group by date to avoid double counting
    const dailyData = searchData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          count: 0,
        };
      }
      
      acc[date].clicks += item.clicks || 0;
      acc[date].impressions += item.impressions || 0;
      acc[date].ctr += item.ctr || 0;
      acc[date].position += item.position || 0;
      acc[date].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Sum daily totals
    const totals = Object.values(dailyData).reduce((acc: any, day: any) => {
      acc.clicks += day.clicks;
      acc.impressions += day.impressions;
      acc.ctrSum += day.ctr / day.count; // Average CTR per day
      acc.positionSum += day.position / day.count; // Average position per day
      acc.days += 1;
      
      return acc;
    }, { clicks: 0, impressions: 0, ctrSum: 0, positionSum: 0, days: 0 });
    
    // Calculate averages
    return {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: (totals.ctrSum / totals.days) * 100, // Convert to percentage
      position: totals.positionSum / totals.days,
    };
  };

  const summary = calculateSummary();

  if (loading && integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Console</CardTitle>
          <CardDescription>Visualize o desempenho do seu site no Google Search</CardDescription>
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
          <CardTitle>Search Console</CardTitle>
          <CardDescription>Conecte seu site do Search Console para visualizar os dados</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-center text-muted-foreground">
            Nenhum site do Search Console conectado. Conecte seu site para visualizar os dados.
          </p>
          <Button onClick={handleConnect}>Conectar Search Console</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Search Console</CardTitle>
            <CardDescription>Visualize o desempenho do seu site no Google Search</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="border rounded p-1 text-sm"
              value={selectedSite || ''}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              {integrations.map((integration) => (
                <option key={integration.account_id} value={integration.account_id}>
                  {integration.credentials?.site_name || integration.account_id}
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
              Conectar Site
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
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.clicks.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Total no período
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.impressions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Total no período
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">CTR</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.ctr.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">
                Taxa de cliques média
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Posição</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.position.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">
                Posição média
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pages" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="pages">Páginas</TabsTrigger>
            <TabsTrigger value="queries">Consultas</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
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

          <TabsContent value="pages" className="space-y-4">
            <div className="h-80 w-full">
              {pagesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pagesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="clicks" name="Cliques" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="impressions" name="Impressões" stroke="#10b981" />
                    <Line yAxisId="right" type="monotone" dataKey="position" name="Posição" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Top 10 Páginas</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Página</th>
                      <th className="text-right p-2">Cliques</th>
                      <th className="text-right p-2">Impressões</th>
                      <th className="text-right p-2">CTR</th>
                      <th className="text-right p-2">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.length > 0 ? (
                      topPages.map((page, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 truncate max-w-xs">{page.page}</td>
                          <td className="p-2 text-right">{page.clicks.toLocaleString()}</td>
                          <td className="p-2 text-right">{page.impressions.toLocaleString()}</td>
                          <td className="p-2 text-right">{page.ctr.toFixed(2)}%</td>
                          <td className="p-2 text-right">{page.position.toFixed(1)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          Nenhum dado disponível para o período selecionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="queries" className="space-y-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Dados de consultas serão implementados em breve</p>
            </div>
          </TabsContent>
          
          <TabsContent value="devices" className="space-y-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Dados de dispositivos serão implementados em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {selectedSite && integrations.find(i => i.account_id === selectedSite)?.last_sync ? (
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            Última sincronização: {new Date(integrations.find(i => i.account_id === selectedSite)?.last_sync as string).toLocaleString()}
          </div>
        ) : (
          <div>Ainda não sincronizado</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SearchConsoleIntegration;