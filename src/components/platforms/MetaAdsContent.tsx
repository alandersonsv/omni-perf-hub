import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { PieChart } from "@/components/dashboard/PieChart";
import { generateMetaAdsData } from "@/data/mockData";
import { FilterState } from "@/types/dashboardTypes";

interface MetaAdsContentProps {
  page: string;
  filters: FilterState;
}

export function MetaAdsContent({ page, filters }: MetaAdsContentProps) {
  const { kpis, funnelData, chartData, campaignTable, demographics } = generateMetaAdsData(filters);

  if (page === 'KPIs Principais & Funil') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="meta" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart 
            data={funnelData} 
            title="Funil de Conversão" 
          />
          
          <LineChart
            data={chartData}
            title="Tendência Diária"
            lines={[
              { dataKey: 'investimento', name: 'Investimento', color: 'hsl(var(--primary))' },
              { dataKey: 'receita', name: 'Receita', color: 'hsl(var(--meta))' },
              { dataKey: 'vendas', name: 'Vendas', color: 'hsl(var(--ecommerce))' }
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

  if (page === 'Dados Demográficos') {
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

  if (page === 'Nível de Anúncio') {
    const adSetData = [
      { adSet: 'AdSet Premium', investment: 3420, clicks: 1890, conversions: 42, cpa: 81.43, ctr: 4.2, cpc: 1.81, roas: 5.2 },
      { adSet: 'AdSet Economia', investment: 2890, clicks: 1560, conversions: 35, cpa: 82.57, ctr: 3.8, cpc: 1.85, roas: 4.9 },
      { adSet: 'AdSet Retargeting', investment: 1840, clicks: 980, conversions: 28, cpa: 65.71, ctr: 5.1, cpc: 1.88, roas: 6.1 }
    ];

    const creativeData = [
      { creative: 'Video Produto A', image: '📹', investment: 1240, clicks: 890, cpc: 1.39, conversions: 18, cpa: 68.89, roas: 5.8 },
      { creative: 'Imagem Carousel', image: '🖼️', investment: 980, clicks: 720, cpc: 1.36, conversions: 15, cpa: 65.33, roas: 5.9 },
      { creative: 'Video Stories', image: '📱', investment: 840, clicks: 580, cpc: 1.45, conversions: 12, cpa: 70.00, roas: 5.4 }
    ];

    return (
      <div className="p-6 space-y-6">
        <DataTable
          title="Performance por Ad Set"
          data={adSetData}
          columns={[
            { key: 'adSet', label: 'Ad Set' },
            { key: 'investment', label: 'Investimento', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'clicks', label: 'Cliques' },
            { key: 'conversions', label: 'Conversões' },
            { key: 'cpa', label: 'CPA', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'ctr', label: 'CTR', format: (v) => `${v.toFixed(1)}%` },
            { key: 'cpc', label: 'CPC', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` }
          ]}
        />

        <DataTable
          title="Performance por Criativo"
          data={creativeData}
          columns={[
            { key: 'image', label: 'Tipo' },
            { key: 'creative', label: 'Anúncio' },
            { key: 'investment', label: 'Investimento', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'clicks', label: 'Cliques' },
            { key: 'cpc', label: 'CPC', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'conversions', label: 'Conversões' },
            { key: 'cpa', label: 'CPA', format: (v) => `R$ ${v.toFixed(2)}` },
            { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` }
          ]}
        />
      </div>
    );
  }

  return <div className="p-6">Página não encontrada</div>;
}