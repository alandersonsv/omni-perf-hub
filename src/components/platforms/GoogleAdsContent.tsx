import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { PieChart } from "@/components/dashboard/PieChart";
import { FilterState } from "@/types/dashboardTypes";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type GoogleAdsCampaign = Database['public']['Tables']['google_ads_campaigns_kpi']['Row'];

interface GoogleAdsContentProps {
  page: string;
  filters: FilterState;
}

export function GoogleAdsContent({ page, filters }: GoogleAdsContentProps) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoogleAdsData();
  }, [user, filters]);

  const fetchGoogleAdsData = async () => {
    if (!user?.user_metadata?.agency_id) return;
    
    try {
      let query = supabase
        .from('google_ads_campaigns_kpi')
        .select(`
          *,
          client_accounts!inner(
            client_id,
            agency_clients!inner(
              id,
              name
            )
          )
        `)
        .eq('agency_id', user.user_metadata.agency_id)
        .gte('date', filters.dateRange.from)
        .lte('date', filters.dateRange.to);

      // Apply client filter if specific client is selected
      if (filters.client && filters.client !== 'all') {
        query = query.eq('client_accounts.client_id', filters.client);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching Google Ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    if (campaigns.length === 0) return [];

    const totals = campaigns.reduce((acc, campaign) => {
      acc.impressions += campaign.impressions || 0;
      acc.clicks += campaign.clicks || 0;
      acc.cost += campaign.total_spent || 0;
      acc.conversions += campaign.conversions || 0;
      acc.conversionValue += campaign.conversion_value || 0;
      return acc;
    }, { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversionValue: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
    const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0;
    const roas = totals.cost > 0 ? totals.conversionValue / totals.cost : 0;
    const ticketMedio = totals.conversions > 0 ? totals.conversionValue / totals.conversions : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    return [
      { title: 'Investimento', value: `R$ ${totals.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+7%', changeType: 'positive' as const, icon: 'DollarSign' },
      { title: 'Receita', value: `R$ ${totals.conversionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+12%', changeType: 'positive' as const, icon: 'TrendingUp' },
      { title: 'ROAS', value: `${roas.toFixed(2)}x`, change: '+0.2', changeType: 'positive' as const, icon: 'Target' },
      { title: 'Vendas', value: totals.conversions.toString(), change: '+9%', changeType: 'positive' as const, icon: 'ShoppingCart' },
      { title: 'CPA', value: `R$ ${cpa.toFixed(2)}`, change: '-5%', changeType: 'positive' as const, icon: 'Calculator' },
      { title: 'CTR', value: `${ctr.toFixed(1)}%`, change: '+0.1%', changeType: 'positive' as const, icon: 'MousePointer' },
      { title: '% Conversão', value: `${conversionRate.toFixed(1)}%`, change: '+0.2%', changeType: 'positive' as const, icon: 'Percent' },
      { title: 'Ticket Médio', value: `R$ ${ticketMedio.toFixed(2)}`, change: '+3%', changeType: 'positive' as const, icon: 'Receipt' },
    ];
  };

  // Prepare chart data from real campaigns
  const prepareChartData = () => {
    return campaigns.map(campaign => ({
      date: campaign.date,
      investimento: campaign.total_spent || 0,
      receita: campaign.conversion_value || 0,
      vendas: campaign.conversions || 0
    })).reverse(); // Reverse to show chronological order
  };

  // Prepare campaign table data
  const prepareCampaignData = () => {
    const campaignMap = new Map();
    
    campaigns.forEach(campaign => {
      const campaignId = campaign.campaign_id || 'unknown';
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          campaign: campaign.campaign_name || `Campanha ${campaignId}`,
          investment: 0,
          revenue: 0,
          sales: 0,
          impressions: 0,
          clicks: 0
        });
      }
      
      const campaignData = campaignMap.get(campaignId);
      campaignData.investment += campaign.total_spent || 0;
      campaignData.revenue += campaign.conversion_value || 0;
      campaignData.sales += campaign.conversions || 0;
      campaignData.impressions += campaign.impressions || 0;
      campaignData.clicks += campaign.clicks || 0;
    });

    return Array.from(campaignMap.values()).map(campaign => ({
      ...campaign,
      roas: campaign.investment > 0 ? campaign.revenue / campaign.investment : 0,
      cpa: campaign.sales > 0 ? campaign.investment / campaign.sales : 0,
      ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      cpc: campaign.clicks > 0 ? campaign.investment / campaign.clicks : 0,
      conversions: campaign.sales
    }));
  };

  const kpis = calculateKPIs();
  const chartData = prepareChartData();
  const campaignTable = prepareCampaignData();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados do Google Ads...</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  // Show the same data for all pages for now
  return (
    <div className="p-6 space-y-6">
      <MetricsGrid metrics={kpis} color="google" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={chartData}
          title="Tendência Diária - Google Ads"
          lines={[
            { dataKey: 'investimento', name: 'Investimento', color: 'hsl(var(--google))' },
            { dataKey: 'receita', name: 'Receita', color: 'hsl(var(--primary))' },
            { dataKey: 'vendas', name: 'Vendas', color: 'hsl(var(--ecommerce))' }
          ]}
        />
        
        <DataTable
          title="Performance por Campanha"
          data={campaignTable}
          columns={[
            { key: 'campaign', label: 'Campanha' },
            { key: 'investment', label: 'Investimento', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` },
            { key: 'sales', label: 'Vendas' },
            { key: 'cpa', label: 'CPA', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'ctr', label: 'CTR', format: (v) => `${v.toFixed(1)}%` },
            { key: 'cpc', label: 'CPC', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'conversions', label: 'Conversões' }
          ]}
        />
      </div>
    </div>
  );
}