import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DataTable } from "@/components/dashboard/DataTable";
import { LineChart } from "@/components/dashboard/LineChart";
import { generateSEOData, generateMetaAdsData } from "@/data/mockData";
import { FilterState } from "@/types/dashboardTypes";

interface SEOContentProps {
  page: string;
  filters: FilterState;
}

export function SEOContent({ page, filters }: SEOContentProps) {
  const { kpis, blogPosts } = generateSEOData(filters);
  const { chartData } = generateMetaAdsData(filters);

  if (page === 'KPIs') {
    return (
      <div className="p-6 space-y-6">
        <MetricsGrid metrics={kpis} color="seo" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={chartData.map(item => ({
              ...item,
              sessoesOrganicas: Math.floor(Math.random() * 800 + 400),
              novosUsuarios: Math.floor(Math.random() * 600 + 300),
              conversoesOrganicas: Math.floor(Math.random() * 8 + 2)
            }))}
            title="Tendência SEO"
            lines={[
              { dataKey: 'sessoesOrganicas', name: 'Sessões Orgânicas', color: 'hsl(var(--seo))' },
              { dataKey: 'novosUsuarios', name: 'Novos Usuários', color: 'hsl(var(--primary))' },
              { dataKey: 'conversoesOrganicas', name: 'Conversões', color: 'hsl(var(--ecommerce))' }
            ]}
          />

          <DataTable
            title="Top Palavras-chave Orgânicas"
            data={[
              { keyword: 'melhor notebook 2024', position: 3, clicks: 1240, impressions: 18420, ctr: 6.7 },
              { keyword: 'comprar laptop', position: 5, clicks: 890, impressions: 24680, ctr: 3.6 },
              { keyword: 'notebook gamer barato', position: 2, clicks: 1560, impressions: 15240, ctr: 10.2 },
              { keyword: 'macbook pro preço', position: 7, clicks: 680, impressions: 19840, ctr: 3.4 }
            ]}
            columns={[
              { key: 'keyword', label: 'Palavra-chave' },
              { key: 'position', label: 'Posição Média' },
              { key: 'clicks', label: 'Cliques' },
              { key: 'impressions', label: 'Impressões' },
              { key: 'ctr', label: 'CTR', format: (v) => `${v.toFixed(1)}%` }
            ]}
          />
        </div>
      </div>
    );
  }

  if (page === 'Conteúdo/Blog') {
    return (
      <div className="p-6 space-y-6">
        <DataTable
          title="Performance dos Posts do Blog"
          data={blogPosts}
          columns={[
            { key: 'post', label: 'Post' },
            { key: 'sessions', label: 'Sessões' },
            { key: 'scroll', label: 'Taxa de Scroll', format: (v) => `${v.toFixed(1)}%` },
            { key: 'timeOnPage', label: 'Tempo Médio (seg)' },
            { key: 'conversions', label: 'Conversões' }
          ]}
        />
      </div>
    );
  }

  return <div className="p-6">Página não encontrada</div>;
}