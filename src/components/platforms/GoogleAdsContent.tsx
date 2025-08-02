import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { PieChart } from "@/components/dashboard/PieChart";
import { generateGoogleAdsData, generateMetaAdsData } from "@/data/mockData";
import { FilterState } from "@/types/dashboardTypes";

interface GoogleAdsContentProps {
  page: string;
  filters: FilterState;
}

export function GoogleAdsContent({ page, filters }: GoogleAdsContentProps) {
  const { kpis, keywordTable } = generateGoogleAdsData(filters);
  // Reusing funnel and chart data structure from Meta Ads for consistency
  const { funnelData, chartData, demographics } = generateMetaAdsData(filters);

  if (page === 'KPIs e Funil') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="google" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart 
            data={funnelData} 
            title="Funil de Conversão Google Ads" 
          />
          
          <LineChart
            data={chartData}
            title="Tendência Diária - Google Ads"
            lines={[
              { dataKey: 'investimento', name: 'Investimento', color: 'hsl(var(--google))' },
              { dataKey: 'receita', name: 'Receita', color: 'hsl(var(--primary))' },
              { dataKey: 'vendas', name: 'Vendas', color: 'hsl(var(--ecommerce))' }
            ]}
          />
        </div>

        <DataTable
          title="Performance por Campanha"
          data={[
            { campaign: 'Search Brand', investment: 4240, revenue: 22840, roas: 5.4, sales: 38, cpa: 111.58, ctr: 5.2, cpc: 2.15, conversions: 38 },
            { campaign: 'Search Generic', investment: 3840, revenue: 18420, roas: 4.8, sales: 32, cpa: 120.00, ctr: 3.1, cpc: 2.85, conversions: 32 },
            { campaign: 'Display Remarketing', investment: 2560, revenue: 12680, roas: 5.0, sales: 28, cpa: 91.43, ctr: 2.8, cpc: 1.95, conversions: 28 },
            { campaign: 'Shopping Campaigns', investment: 2200, revenue: 11320, roas: 5.1, sales: 20, cpa: 110.00, ctr: 4.5, cpc: 1.75, conversions: 20 }
          ]}
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

  if (page === 'Demografia') {
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

    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PieChart title="Distribuição por Gênero" data={genderData} />
          <PieChart title="Distribuição por Idade" data={ageData} />
          <PieChart title="Distribuição por Dispositivo" data={deviceData} />
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

  if (page === 'Palavras-chave') {
    return (
      <div className="p-6 space-y-6">
        <DataTable
          title="Performance por Palavra-chave"
          data={keywordTable}
          columns={[
            { key: 'keyword', label: 'Palavra-chave' },
            { key: 'investment', label: 'Investimento', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'clicks', label: 'Cliques' },
            { key: 'conversions', label: 'Conversões' },
            { key: 'cpa', label: 'CPA', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'ctr', label: 'CTR', format: (v) => `${v.toFixed(1)}%` },
            { key: 'cpc', label: 'CPC', format: (v) => `R$ ${v.toFixed(2)}` }
          ]}
        />
      </div>
    );
  }

  return <div className="p-6">Página não encontrada</div>;
}