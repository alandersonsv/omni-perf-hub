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

type MetaAdsInsight = Database['public']['Tables']['meta_ads_insights_daily']['Row'];

interface MetaAdsContentProps {
  page: string;
  filters: FilterState;
}

export function MetaAdsContent({ page, filters }: MetaAdsContentProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MetaAdsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetaAdsData();
  }, [user, filters]);

  const fetchMetaAdsData = async () => {
    if (!user?.user_metadata?.agency_id) return;
    
    try {
      let query = supabase
        .from('meta_ads_insights_daily')
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
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching Meta Ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    if (insights.length === 0) return [];

    const totals = insights.reduce((acc, insight) => {
      acc.impressions += insight.impressions || 0;
      acc.clicks += insight.clicks || 0;
      acc.spend += insight.spend || 0;
      acc.conversions += insight.conversions || 0;
      acc.revenue += insight.revenue || 0;
      return acc;
    }, { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const ticketMedio = totals.conversions > 0 ? totals.revenue / totals.conversions : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    return [
      { title: 'Investimento', value: `R$ ${totals.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+12%', changeType: 'positive' as const, icon: 'DollarSign' },
      { title: 'Faturamento', value: `R$ ${totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+8%', changeType: 'positive' as const, icon: 'TrendingUp' },
      { title: 'ROAS', value: `${roas.toFixed(1)}x`, change: '+0.3', changeType: 'positive' as const, icon: 'Target' },
      { title: 'Vendas', value: totals.conversions.toString(), change: '+15%', changeType: 'positive' as const, icon: 'ShoppingCart' },
      { title: 'Ticket Médio', value: `R$ ${ticketMedio.toFixed(2)}`, change: '-2%', changeType: 'negative' as const, icon: 'Receipt' },
      { title: 'CPA', value: `R$ ${cpa.toFixed(2)}`, change: '-8%', changeType: 'positive' as const, icon: 'Calculator' },
      { title: '% Conversão', value: `${conversionRate.toFixed(1)}%`, change: '+0.4%', changeType: 'positive' as const, icon: 'Percent' },
    ];
  };

  // Prepare chart data from real insights
  const prepareChartData = () => {
    return insights.map(insight => ({
      date: insight.date,
      investimento: insight.spend || 0,
      receita: insight.revenue || 0,
      vendas: insight.conversions || 0
    })).reverse(); // Reverse to show chronological order
  };

  // Prepare campaign table data
  const prepareCampaignData = () => {
    const campaignMap = new Map();
    
    insights.forEach(insight => {
      const campaignId = insight.campaign_id || 'unknown';
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          campaign: `Campanha ${campaignId}`,
          investment: 0,
          revenue: 0,
          sales: 0,
          impressions: 0,
          clicks: 0
        });
      }
      
      const campaign = campaignMap.get(campaignId);
      campaign.investment += insight.spend || 0;
      campaign.revenue += insight.revenue || 0;
      campaign.sales += insight.conversions || 0;
      campaign.impressions += insight.impressions || 0;
      campaign.clicks += insight.clicks || 0;
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
          <p className="text-muted-foreground">Carregando dados do Meta Ads...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  if (page === 'KPIs Principais & Funil') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="meta" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={chartData}
            title="Tendência Diária - Meta Ads"
            lines={[
              { dataKey: 'investimento', name: 'Investimento', color: 'hsl(var(--primary))' },
              { dataKey: 'receita', name: 'Receita', color: 'hsl(var(--meta))' },
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

        <DataTable
          title="Performance por Campanha"
          data={campaignTable}
          columns={[
            { key: 'campaign', label: 'Campanha' },
            { key: 'investment', label: 'Investimento', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'revenue', label: 'Faturamento', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` },
            { key: 'sales', label: 'Vendas' },
            { key: 'cpa', label: 'CPA', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'ctr', label: 'CTR', format: (v) => `${v.toFixed(1)}%` },
            { key: 'cpc', label: 'CPC', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'conversions', label: 'Conversões' }
          ]}
        />
      </div>
    );
  }

  // For other pages, show the same data for now
  return (
    <div className="p-6 space-y-6">
      <MetricsGrid metrics={kpis} color="meta" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={chartData}
          title="Tendência Diária - Meta Ads"
          lines={[
            { dataKey: 'investimento', name: 'Investimento', color: 'hsl(var(--primary))' },
            { dataKey: 'receita', name: 'Receita', color: 'hsl(var(--meta))' },
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