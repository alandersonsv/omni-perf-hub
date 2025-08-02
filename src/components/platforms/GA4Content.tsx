import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DataTable } from "@/components/dashboard/DataTable";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { generateGA4Data, generateMetaAdsData } from "@/data/mockData";
import { FilterState } from "@/types/dashboardTypes";

interface GA4ContentProps {
  page: string;
  filters: FilterState;
}

export function GA4Content({ page, filters }: GA4ContentProps) {
  const { kpis, landingPages } = generateGA4Data(filters);
  const { demographics, chartData } = generateMetaAdsData(filters);

  if (page === 'KPIs de Engajamento') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="analytics" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={chartData.map(item => ({
              ...item,
              sessoes: Math.floor(Math.random() * 1200 + 800),
              usuarios: Math.floor(Math.random() * 900 + 600),
              pageviews: Math.floor(Math.random() * 2500 + 1500)
            }))}
            title="Tendência de Engajamento"
            lines={[
              { dataKey: 'sessoes', name: 'Sessões', color: 'hsl(var(--analytics))' },
              { dataKey: 'usuarios', name: 'Usuários', color: 'hsl(var(--primary))' },
              { dataKey: 'pageviews', name: 'Pageviews', color: 'hsl(var(--ecommerce))' }
            ]}
          />

          <DataTable
            title="Top Origens de Tráfego"
            data={[
              { source: 'google / organic', sessions: 8420, users: 6240, conversions: 89, revenue: 48920 },
              { source: 'facebook / cpc', sessions: 5240, users: 4180, conversions: 67, revenue: 36840 },
              { source: 'direct / (none)', sessions: 3890, users: 2940, conversions: 45, revenue: 24680 },
              { source: 'instagram / cpc', sessions: 2840, users: 2340, conversions: 32, revenue: 18920 }
            ]}
            columns={[
              { key: 'source', label: 'Origem / Mídia' },
              { key: 'sessions', label: 'Sessões' },
              { key: 'users', label: 'Usuários' },
              { key: 'conversions', label: 'Conversões' },
              { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` }
            ]}
          />
        </div>
      </div>
    );
  }

  if (page === 'Público') {
    const genderData = [
      { name: 'Masculino', value: demographics.gender.male, color: '#3b82f6' },
      { name: 'Feminino', value: demographics.gender.female, color: '#ec4899' },
      { name: 'Outros', value: demographics.gender.other, color: '#6b7280' }
    ];

    const ageData = Object.entries(demographics.ageGroups).map(([age, value]) => ({
      name: age,
      value,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));

    const deviceData = Object.entries(demographics.devices).map(([device, value]) => ({
      name: device.charAt(0).toUpperCase() + device.slice(1),
      value,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));

    const userTypeData = [
      { name: 'Novos Usuários', value: 68, color: '#10b981' },
      { name: 'Usuários Retornantes', value: 32, color: '#f59e0b' }
    ];

    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PieChart title="Distribuição por Gênero" data={genderData} />
          <PieChart title="Distribuição por Idade" data={ageData} />
          <PieChart title="Distribuição por Dispositivo" data={deviceData} />
          <PieChart title="Novos vs. Retornantes" data={userTypeData} />
        </div>

        <DataTable
          title="Performance por Localização"
          data={demographics.locations}
          columns={[
            { key: 'city', label: 'Cidade' },
            { key: 'sessions', label: 'Sessões' },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` }
          ]}
        />
      </div>
    );
  }

  if (page === 'Landing Pages') {
    return (
      <div className="p-6 space-y-6">
        <DataTable
          title="Performance das Landing Pages"
          data={landingPages}
          columns={[
            { key: 'page', label: 'Página de Entrada' },
            { key: 'sessions', label: 'Sessões' },
            { key: 'engagementRate', label: 'Taxa de Engajamento', format: (v) => `${v.toFixed(1)}%` },
            { key: 'conversions', label: 'Conversões' },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` }
          ]}
        />
      </div>
    );
  }

  return <div className="p-6">Página não encontrada</div>;
}