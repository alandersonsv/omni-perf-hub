import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database } from '@/integrations/supabase/types';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { useToast } from '@/hooks/use-toast';

interface GoogleAdsIntegrationProps {
  agencyId: string;
}

// Use the correct Supabase type for Google Ads campaign data
type GoogleAdsCampaignBase = Database['public']['Tables']['google_ads_campaigns_kpi']['Row'];

// Extended interface with calculated metrics and mapped fields
interface GoogleAdsCampaign extends GoogleAdsCampaignBase {
  // Mapped fields for compatibility
  name: string;
  cost: number;
  // Calculated metrics
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

// Interface for summary metrics
interface GoogleAdsSummary {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

// Use the correct Supabase type for integrations
type Integration = Database['public']['Tables']['integrations']['Row'];

const GoogleAdsIntegration: React.FC<GoogleAdsIntegrationProps> = ({ agencyId }) => {
  const supabase = useSupabaseClient<Database>();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  
  // Function to add calculated metrics to campaign data
  const addCalculatedMetrics = (baseCampaign: GoogleAdsCampaignBase): GoogleAdsCampaign => {
    const impressions = baseCampaign.impressions || 0;
    const clicks = baseCampaign.clicks || 0;
    const cost = baseCampaign.total_spent || 0;
    const conversions = baseCampaign.conversions || 0;
    const conversionValue = baseCampaign.conversion_value || 0;
    
    return {
      ...baseCampaign,
      // Map Supabase fields to expected interface fields
      name: baseCampaign.campaign_name,
      cost: cost,
      // Add calculated metrics
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? cost / clicks : 0,
      cpa: conversions > 0 ? cost / conversions : 0,
      roas: cost > 0 ? conversionValue / cost : 0,
    };
  };
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('platform', 'google_ads');

        if (error) throw error;

        setIntegrations(data || []);
        if (data && data.length > 0) {
          setSelectedAccount(data[0].account_id);
        }
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError('Failed to load Google Ads integrations');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [agencyId, supabase]);

  // Fetch campaign data when account or time range changes
  useEffect(() => {
    if (!selectedAccount) return;

    const fetchCampaignData = async () => {
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
          .from('google_ads_campaigns_kpi')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('account_id', selectedAccount)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;

        // Transform base data to include calculated metrics
        const campaignsWithMetrics = (data || []).map((campaign: GoogleAdsCampaignBase) => 
          addCalculatedMetrics(campaign)
        );
        setCampaigns(campaignsWithMetrics);
      } catch (err) {
        console.error('Error fetching campaign data:', err);
        setError('Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [agencyId, selectedAccount, timeRange, supabase]);

  // Trigger sync
  const handleSync = async () => {
    if (!selectedAccount) return;

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-ads-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          agency_id: agencyId,
          account_id: selectedAccount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync Google Ads data');
      }

      // Update integration last_sync
      const { error: updateError } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('agency_id', agencyId)
        .eq('platform', 'google_ads')
        .eq('account_id', selectedAccount);

      if (updateError) throw updateError;

      // Refresh campaign data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('google_ads_campaigns_kpi')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('account_id', selectedAccount)
        .order('date', { ascending: true });

      if (refreshError) throw refreshError;

      // Transform refreshed data to include calculated metrics
      const refreshedCampaignsWithMetrics = (refreshedData || []).map((campaign: GoogleAdsCampaignBase) => 
        addCalculatedMetrics(campaign)
      );
      setCampaigns(refreshedCampaignsWithMetrics);
    } catch (err) {
      console.error('Error syncing Google Ads data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync Google Ads data');
    } finally {
      setSyncing(false);
    }
  };

  const { initiateConnection, handleCallback, refreshToken, isConnecting: isOAuthConnecting, error: oauthError } = useOAuthFlow();
  const { toast } = useToast();

  // Connect Google Ads
  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Iniciar o fluxo OAuth para Google
      await initiateConnection('google');
      
      toast({
        title: "Iniciando conexão",
        description: "Conectando com Google Ads...",
      });
    } catch (err) {
      console.error('Error connecting Google Ads:', err);
      setError(err instanceof Error ? err.message : 'Falha ao conectar Google Ads');
      toast({
        title: "Erro na conexão",
        description: err instanceof Error ? err.message : "Não foi possível conectar o Google Ads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Group by date and aggregate metrics
    const dataByDate = campaigns.reduce((acc, campaign) => {
      const date = campaign.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          conversion_value: 0,
        };
      }
      
      acc[date].impressions += campaign.impressions || 0;
      acc[date].clicks += campaign.clicks || 0;
      acc[date].cost += campaign.cost || 0;
      acc[date].conversions += campaign.conversions || 0;
      acc[date].conversion_value += campaign.conversion_value || 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date
    return Object.values(dataByDate).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const chartData = prepareChartData();

  // Calculate summary metrics
  const calculateSummary = (): GoogleAdsSummary => {
    const baseSummary = campaigns.reduce((acc, campaign) => {
      acc.impressions += campaign.impressions || 0;
      acc.clicks += campaign.clicks || 0;
      acc.cost += campaign.cost || 0;
      acc.conversions += campaign.conversions || 0;
      acc.conversion_value += campaign.conversion_value || 0;
      
      return acc;
    }, {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      conversion_value: 0,
    });
    
    // Calculate derived metrics and return complete summary
    return {
      ...baseSummary,
      ctr: baseSummary.impressions > 0 ? (baseSummary.clicks / baseSummary.impressions) * 100 : 0,
      cpc: baseSummary.clicks > 0 ? baseSummary.cost / baseSummary.clicks : 0,
      cpa: baseSummary.conversions > 0 ? baseSummary.cost / baseSummary.conversions : 0,
      roas: baseSummary.cost > 0 ? baseSummary.conversion_value / baseSummary.cost : 0,
    };
  };

  const summary = calculateSummary();

  if (loading && integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Ads</CardTitle>
          <CardDescription>Visualize o desempenho das suas campanhas do Google Ads</CardDescription>
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
          <CardTitle>Google Ads</CardTitle>
          <CardDescription>Conecte sua conta do Google Ads para visualizar o desempenho das campanhas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-center text-muted-foreground">
            Nenhuma conta do Google Ads conectada. Conecte sua conta para visualizar o desempenho das campanhas.
          </p>
          <Button onClick={handleConnect}>Conectar Google Ads</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Google Ads</CardTitle>
            <CardDescription>Visualize o desempenho das suas campanhas do Google Ads</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="border rounded p-1 text-sm"
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {integrations.map((integration) => (
                <option key={integration.account_id} value={integration.account_id}>
                  {integration.account_id}
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
              Conectar Conta
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
              <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.impressions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{summary.clicks.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                CTR: {summary.ctr.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Custo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">R$ {summary.cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                CPC: R$ {summary.cpc.toFixed(2)}
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
                ROAS: {summary.roas.toFixed(2)}x
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="space-y-4">
            <div className="flex justify-end space-x-2 mb-4">
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

            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="campaigns">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Campanha</th>
                    <th className="text-right p-2">Status</th>
                    <th className="text-right p-2">Impressões</th>
                    <th className="text-right p-2">Cliques</th>
                    <th className="text-right p-2">CTR</th>
                    <th className="text-right p-2">Custo</th>
                    <th className="text-right p-2">Conv.</th>
                    <th className="text-right p-2">CPA</th>
                    <th className="text-right p-2">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length > 0 ? (
                    // Group by campaign_id and show the most recent data
                    Object.values(
                      campaigns.reduce((acc, campaign) => {
                        if (!acc[campaign.campaign_id] || new Date(acc[campaign.campaign_id].date) < new Date(campaign.date)) {
                          acc[campaign.campaign_id] = campaign;
                        }
                        return acc;
                      }, {} as Record<string, GoogleAdsCampaign>)
                    ).map((campaign) => (
                      <tr key={campaign.campaign_id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{campaign.name}</td>
                        <td className="text-right p-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {campaign.status === 'ENABLED' ? 'Ativo' : 'Pausado'}
                          </span>
                        </td>
                        <td className="text-right p-2">{campaign.impressions?.toLocaleString() || 0}</td>
                        <td className="text-right p-2">{campaign.clicks?.toLocaleString() || 0}</td>
                        <td className="text-right p-2">{campaign.ctr?.toFixed(2) || 0}%</td>
                        <td className="text-right p-2">R$ {campaign.cost?.toFixed(2) || 0}</td>
                        <td className="text-right p-2">{campaign.conversions?.toLocaleString() || 0}</td>
                        <td className="text-right p-2">R$ {campaign.cpa?.toFixed(2) || 0}</td>
                        <td className="text-right p-2">{campaign.roas?.toFixed(2) || 0}x</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center p-4 text-muted-foreground">
                        Nenhum dado de campanha disponível
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {selectedAccount && integrations.find(i => i.account_id === selectedAccount)?.last_sync ? (
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            Última sincronização: {new Date(integrations.find(i => i.account_id === selectedAccount)?.last_sync as string).toLocaleString()}
          </div>
        ) : (
          <div>Ainda não sincronizado</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoogleAdsIntegration;