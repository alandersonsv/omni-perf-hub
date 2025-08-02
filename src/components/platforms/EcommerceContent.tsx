import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LineChart } from "@/components/dashboard/LineChart";
import { generateEcommerceData, generateMetaAdsData } from "@/data/mockData";
import { FilterState } from "@/types/dashboardTypes";

interface EcommerceContentProps {
  page: string;
  filters: FilterState;
}

export function EcommerceContent({ page, filters }: EcommerceContentProps) {
  const { kpis, ecommerceFunnel, products } = generateEcommerceData(filters);
  const { chartData } = generateMetaAdsData(filters);

  if (page === 'KPIs de Ecommerce') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="ecommerce" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={chartData.map(item => ({
              ...item,
              receitaTotal: Math.floor(Math.random() * 12000 + 6000),
              transacoes: Math.floor(Math.random() * 25 + 10),
              ticketMedio: Math.floor(Math.random() * 200 + 400)
            }))}
            title="Tendência E-commerce"
            lines={[
              { dataKey: 'receitaTotal', name: 'Receita Total', color: 'hsl(var(--ecommerce))' },
              { dataKey: 'transacoes', name: 'Transações', color: 'hsl(var(--primary))' },
              { dataKey: 'ticketMedio', name: 'Ticket Médio', color: 'hsl(var(--meta))' }
            ]}
          />

          <DataTable
            title="ROAS por Canal"
            data={[
              { channel: 'Facebook Ads', investment: 15420, revenue: 78560, roas: 5.1, transactions: 142 },
              { channel: 'Google Ads', investment: 12840, revenue: 65240, roas: 5.08, transactions: 118 },
              { channel: 'Email Marketing', investment: 2400, revenue: 18600, roas: 7.75, transactions: 34 },
              { channel: 'SEO Orgânico', investment: 0, revenue: 28940, roas: 999, transactions: 52 }
            ]}
            columns={[
              { key: 'channel', label: 'Canal' },
              { key: 'investment', label: 'Investimento', format: (v) => v === 0 ? 'Orgânico' : `R$ ${v.toLocaleString()}` },
              { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` },
              { key: 'roas', label: 'ROAS', format: (v) => v === 999 ? '∞' : `${v.toFixed(1)}x` },
              { key: 'transactions', label: 'Transações' }
            ]}
          />
        </div>
      </div>
    );
  }

  if (page === 'Funil de Ecommerce') {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart 
            data={ecommerceFunnel} 
            title="Funil de E-commerce (GA4 Events)" 
          />

          <DataTable
            title="Detalhamento das Etapas"
            data={ecommerceFunnel.map((step, index) => ({
              etapa: step.label,
              eventos: step.value,
              taxa: step.rate ? `${step.rate.toFixed(1)}%` : '-',
              perdas: index > 0 ? ecommerceFunnel[index - 1].value - step.value : 0
            }))}
            columns={[
              { key: 'etapa', label: 'Etapa do Funil' },
              { key: 'eventos', label: 'Eventos' },
              { key: 'taxa', label: 'Taxa de Conversão' },
              { key: 'perdas', label: 'Perdas', format: (v) => v === 0 ? '-' : v.toLocaleString() }
            ]}
          />
        </div>
      </div>
    );
  }

  if (page === 'Produto/Categoria') {
    return (
      <div className="p-6 space-y-6">
        <DataTable
          title="Performance por Produto"
          data={products}
          columns={[
            { key: 'product', label: 'Produto' },
            { key: 'views', label: 'Visualizações' },
            { key: 'addToCart', label: 'Add to Cart' },
            { key: 'purchases', label: 'Compras' },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'conversionRate', label: 'Taxa de Conversão', format: (v) => `${v.toFixed(1)}%` }
          ]}
        />

        <DataTable
          title="Performance por Categoria"
          data={[
            { category: 'Notebooks', views: 8420, addToCart: 1240, purchases: 186, revenue: 284560, conversionRate: 2.2 },
            { category: 'Acessórios', views: 5640, addToCart: 890, purchases: 142, revenue: 89420, conversionRate: 2.5 },
            { category: 'Periféricos', views: 3280, addToCart: 560, purchases: 90, revenue: 45680, conversionRate: 2.7 },
            { category: 'Software', views: 1840, addToCart: 320, purchases: 58, revenue: 28940, conversionRate: 3.2 }
          ]}
          columns={[
            { key: 'category', label: 'Categoria' },
            { key: 'views', label: 'Visualizações' },
            { key: 'addToCart', label: 'Add to Cart' },
            { key: 'purchases', label: 'Compras' },
            { key: 'revenue', label: 'Receita', format: (v) => `R$ ${v.toLocaleString()}` },
            { key: 'conversionRate', label: 'Taxa de Conversão', format: (v) => `${v.toFixed(1)}%` }
          ]}
        />
      </div>
    );
  }

  return <div className="p-6">Página não encontrada</div>;
}