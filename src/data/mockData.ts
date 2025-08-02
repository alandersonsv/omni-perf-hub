import { FilterState, MetricKPI, FunnelStep, ChartDataPoint, CampaignData, DemographicData, ProductData } from '@/types/dashboardTypes';

// Generate realistic mock data based on filters
export const generateMetaAdsData = (filters: FilterState) => {
  const kpis: MetricKPI[] = [
    { title: 'Investimento', value: 'R$ 15.420', change: '+12%', changeType: 'positive', icon: 'DollarSign' },
    { title: 'Faturamento', value: 'R$ 78.560', change: '+8%', changeType: 'positive', icon: 'TrendingUp' },
    { title: 'ROAS', value: '5.1x', change: '+0.3', changeType: 'positive', icon: 'Target' },
    { title: 'Vendas', value: '142', change: '+15%', changeType: 'positive', icon: 'ShoppingCart' },
    { title: 'Ticket Médio', value: 'R$ 553', change: '-2%', changeType: 'negative', icon: 'Receipt' },
    { title: 'CPA', value: 'R$ 108.59', change: '-8%', changeType: 'positive', icon: 'Calculator' },
    { title: '% Conversão', value: '2.8%', change: '+0.4%', changeType: 'positive', icon: 'Percent' },
  ];

  const funnelData: FunnelStep[] = [
    { label: 'Impressões', value: 245000, rate: 100 },
    { label: 'Cliques', value: 12250, rate: 5.0 },
    { label: 'Visitas na Página', value: 10420, rate: 85.1 },
    { label: 'Início da Compra', value: 520, rate: 4.99 },
    { label: 'Vendas', value: 142, rate: 27.3 }
  ];

  const chartData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    investimento: Math.floor(Math.random() * 800 + 400),
    receita: Math.floor(Math.random() * 4000 + 2000),
    vendas: Math.floor(Math.random() * 8 + 2)
  }));

  const campaignTable: CampaignData[] = [
    { campaign: 'Campanha Black Friday', investment: 5420, revenue: 28560, roas: 5.3, sales: 52, cpa: 104.23, ctr: 4.2, cpc: 1.26, conversions: 52 },
    { campaign: 'Remarketing Carrinho', investment: 3240, revenue: 18420, roas: 5.7, sales: 34, cpa: 95.29, ctr: 6.8, cpc: 0.89, conversions: 34 },
    { campaign: 'Prospecção Lookalike', investment: 4560, revenue: 22840, roas: 5.0, sales: 41, cpa: 111.22, ctr: 3.9, cpc: 1.45, conversions: 41 },
    { campaign: 'Retargeting 30 dias', investment: 2200, revenue: 8740, roas: 4.0, sales: 15, cpa: 146.67, ctr: 5.2, cpc: 0.98, conversions: 15 }
  ];

  const demographics: DemographicData = {
    gender: { male: 45, female: 52, other: 3 },
    ageGroups: { '18-24': 15, '25-34': 35, '35-44': 28, '45-54': 15, '55+': 7 },
    devices: { desktop: 42, mobile: 55, tablet: 3 },
    locations: [
      { city: 'São Paulo', sessions: 4200, revenue: 23400 },
      { city: 'Rio de Janeiro', sessions: 2800, revenue: 15600 },
      { city: 'Belo Horizonte', sessions: 1600, revenue: 8900 },
      { city: 'Porto Alegre', sessions: 1200, revenue: 6700 }
    ]
  };

  return { kpis, funnelData, chartData, campaignTable, demographics };
};

export const generateGoogleAdsData = (filters: FilterState) => {
  const kpis: MetricKPI[] = [
    { title: 'Investimento', value: 'R$ 12.840', change: '+7%', changeType: 'positive', icon: 'DollarSign' },
    { title: 'Receita', value: 'R$ 65.240', change: '+12%', changeType: 'positive', icon: 'TrendingUp' },
    { title: 'ROAS', value: '5.08x', change: '+0.2', changeType: 'positive', icon: 'Target' },
    { title: 'Vendas', value: '118', change: '+9%', changeType: 'positive', icon: 'ShoppingCart' },
    { title: 'CPA', value: 'R$ 108.81', change: '-5%', changeType: 'positive', icon: 'Calculator' },
    { title: 'CTR', value: '3.2%', change: '+0.1%', changeType: 'positive', icon: 'MousePointer' },
    { title: '% Conversão', value: '2.1%', change: '+0.2%', changeType: 'positive', icon: 'Percent' },
    { title: 'Ticket Médio', value: 'R$ 553', change: '+3%', changeType: 'positive', icon: 'Receipt' },
  ];

  const keywordTable = [
    { keyword: 'comprar notebook', investment: 2420, clicks: 1240, conversions: 28, cpa: 86.43, ctr: 4.2, cpc: 1.95 },
    { keyword: 'laptop gamer', investment: 1840, clicks: 890, conversions: 19, cpa: 96.84, ctr: 3.8, cpc: 2.07 },
    { keyword: 'computador escritório', investment: 1560, clicks: 720, conversions: 15, cpa: 104.00, ctr: 3.1, cpc: 2.17 },
    { keyword: 'notebook dell', investment: 1220, clicks: 580, conversions: 12, cpa: 101.67, ctr: 2.9, cpc: 2.10 }
  ];

  return { kpis, keywordTable };
};

export const generateGA4Data = (filters: FilterState) => {
  const kpis: MetricKPI[] = [
    { title: 'Sessões', value: '28.420', change: '+15%', changeType: 'positive', icon: 'Users' },
    { title: 'Usuários', value: '21.340', change: '+12%', changeType: 'positive', icon: 'User' },
    { title: 'Taxa de Engajamento', value: '68.4%', change: '+2.1%', changeType: 'positive', icon: 'Activity' },
    { title: 'Pageviews', value: '89.240', change: '+18%', changeType: 'positive', icon: 'Eye' },
    { title: 'Conversões', value: '342', change: '+8%', changeType: 'positive', icon: 'Target' },
    { title: 'Receita', value: 'R$ 156.840', change: '+14%', changeType: 'positive', icon: 'DollarSign' },
    { title: 'Origem/Mídia', value: '12 canais', change: '+2', changeType: 'positive', icon: 'Globe' }
  ];

  const landingPages = [
    { page: '/produto/notebook-gamer', sessions: 4820, engagementRate: 72.4, conversions: 89, revenue: 48950 },
    { page: '/categoria/laptops', sessions: 3240, engagementRate: 65.8, conversions: 52, revenue: 28600 },
    { page: '/oferta-especial', sessions: 2890, engagementRate: 78.2, conversions: 67, revenue: 36890 },
    { page: '/produto/macbook-pro', sessions: 2140, engagementRate: 69.1, conversions: 34, revenue: 58940 }
  ];

  return { kpis, landingPages };
};

export const generateSEOData = (filters: FilterState) => {
  const kpis: MetricKPI[] = [
    { title: 'Sessões Orgânicas', value: '18.420', change: '+22%', changeType: 'positive', icon: 'Search' },
    { title: 'Novos Usuários', value: '14.280', change: '+18%', changeType: 'positive', icon: 'UserPlus' },
    { title: 'Páginas Acessadas', value: '45.620', change: '+15%', changeType: 'positive', icon: 'FileText' },
    { title: 'Conversões Orgânicas', value: '186', change: '+28%', changeType: 'positive', icon: 'TrendingUp' },
    { title: 'Palavras-chave', value: '1.240', change: '+45', changeType: 'positive', icon: 'Hash' }
  ];

  const blogPosts = [
    { post: 'Como escolher o melhor notebook', sessions: 3420, scroll: 78.2, timeOnPage: 245, conversions: 24 },
    { post: 'Comparativo MacBook vs Dell', sessions: 2890, scroll: 82.1, timeOnPage: 312, conversions: 31 },
    { post: 'Guia de compra 2024', sessions: 2240, scroll: 75.6, timeOnPage: 198, conversions: 18 },
    { post: 'Notebooks para estudantes', sessions: 1890, scroll: 71.4, timeOnPage: 167, conversions: 15 }
  ];

  return { kpis, blogPosts };
};

export const generateEcommerceData = (filters: FilterState) => {
  const kpis: MetricKPI[] = [
    { title: 'Receita Total', value: 'R$ 234.680', change: '+16%', changeType: 'positive', icon: 'DollarSign' },
    { title: 'Transações', value: '418', change: '+12%', changeType: 'positive', icon: 'ShoppingCart' },
    { title: 'Ticket Médio', value: 'R$ 561.50', change: '+3%', changeType: 'positive', icon: 'Receipt' },
    { title: 'Produtos Vendidos', value: '892', change: '+18%', changeType: 'positive', icon: 'Package' },
    { title: 'Taxa de Conversão', value: '3.2%', change: '+0.4%', changeType: 'positive', icon: 'Percent' },
    { title: 'ROAS por Canal', value: '4.8x', change: '+0.3', changeType: 'positive', icon: 'Target' }
  ];

  const ecommerceFunnel: FunnelStep[] = [
    { label: 'View Item', value: 18420, rate: 100 },
    { label: 'Add to Cart', value: 3284, rate: 17.8 },
    { label: 'Begin Checkout', value: 1240, rate: 37.8 },
    { label: 'Purchase', value: 418, rate: 33.7 }
  ];

  const products: ProductData[] = [
    { product: 'MacBook Pro M3', views: 2420, addToCart: 380, purchases: 89, revenue: 182340, conversionRate: 3.7 },
    { product: 'Dell XPS 13', views: 1890, addToCart: 290, purchases: 67, revenue: 89430, conversionRate: 3.5 },
    { product: 'Gaming Laptop ASUS', views: 1560, addToCart: 240, purchases: 52, revenue: 67890, conversionRate: 3.3 },
    { product: 'Lenovo ThinkPad', views: 1240, addToCart: 180, purchases: 38, revenue: 45670, conversionRate: 3.1 }
  ];

  return { kpis, ecommerceFunnel, products };
};