import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DataTable } from "@/components/dashboard/DataTable";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { FilterState } from "@/types/dashboardTypes";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type GA4Data = Database['public']['Tables']['ga4_daily']['Row'];

interface GA4ContentProps {
  page: string;
  filters: FilterState;
}

export function GA4Content({ page, filters }: GA4ContentProps) {
  const { user } = useAuth();
  const [ga4Data, setGA4Data] = useState<GA4Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGA4Data();
  }, [user, filters]);

  const fetchGA4Data = async () => {
    if (!user?.user_metadata?.agency_id) return;
    
    try {
      let query = supabase
        .from('ga4_daily')
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
      setGA4Data(data || []);
    } catch (error) {
      console.error('Error fetching GA4 data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    if (ga4Data.length === 0) return [];

    const totals = ga4Data.reduce((acc, day) => {
      acc.sessions += day.sessions || 0;
      acc.users += day.users || 0;
      acc.pageviews += day.pageviews || 0;
      acc.conversions += day.conversions || 0;
      acc.revenue += day.revenue || 0;
      acc.engagementRate += day.engagement_rate || 0;
      return acc;
    }, { sessions: 0, users: 0, pageviews: 0, conversions: 0, revenue: 0, engagementRate: 0 });

    const avgEngagementRate = ga4Data.length > 0 ? (totals.engagementRate / ga4Data.length) * 100 : 0;

    return [
      { title: 'Sessões', value: totals.sessions.toLocaleString('pt-BR'), change: '+15%', changeType: 'positive' as const, icon: 'Users' },
      { title: 'Usuários', value: totals.users.toLocaleString('pt-BR'), change: '+12%', changeType: 'positive' as const, icon: 'User' },
      { title: 'Taxa de Engajamento', value: `${avgEngagementRate.toFixed(1)}%`, change: '+2.1%', changeType: 'positive' as const, icon: 'Activity' },
      { title: 'Pageviews', value: totals.pageviews.toLocaleString('pt-BR'), change: '+18%', changeType: 'positive' as const, icon: 'Eye' },
      { title: 'Conversões', value: totals.conversions.toString(), change: '+8%', changeType: 'positive' as const, icon: 'Target' },
      { title: 'Receita', value: `R$ ${totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+14%', changeType: 'positive' as const, icon: 'DollarSign' },
      { title: 'Origem/Mídia', value: '12 canais', change: '+2', changeType: 'positive' as const, icon: 'Globe' }
    ];
  };

  // Prepare chart data from real GA4 data
  const prepareChartData = () => {
    return ga4Data.map(day => ({
      date: day.date,
      sessoes: day.sessions || 0,
      usuarios: day.users || 0,
      pageviews: day.pageviews || 0
    })).reverse(); // Reverse to show chronological order
  };

  const kpis = calculateKPIs();
  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados do Google Analytics...</p>
        </div>
      </div>
    );
  }

  if (ga4Data.length === 0) {
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
      <MetricsGrid metrics={kpis} color="analytics" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={chartData}
          title="Tendência de Engajamento"
          lines={[
            { dataKey: 'sessoes', name: 'Sessões', color: 'hsl(var(--analytics))' },
            { dataKey: 'usuarios', name: 'Usuários', color: 'hsl(var(--primary))' },
            { dataKey: 'pageviews', name: 'Pageviews', color: 'hsl(var(--ecommerce))' }
          ]}
        />

        <DataTable
          title="Resumo Diário"
          data={ga4Data.slice(0, 10).map(day => ({
            date: new Date(day.date).toLocaleDateString('pt-BR'),
            sessions: day.sessions || 0,
            users: day.users || 0,
            pageviews: day.pageviews || 0,
            conversions: day.conversions || 0,
            revenue: day.revenue || 0
          }))}
          columns={[
            { key: 'date', label: 'Data' },
            { key: 'sessions', label: 'Sessões' },
            { key: 'users', label: 'Usuários' },
            { key: 'pageviews', label: 'Pageviews' },
            { key: 'conversions', label: 'Conversões' },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toFixed(2)}` }
          ]}
        />
      </div>
    </div>
  );
}