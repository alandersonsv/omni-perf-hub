export interface FilterState {
  dateRange: {
    from: string;
    to: string;
  };
  campaign: string;
  source: string;
  device: string;
  client: string;
}

export interface MetricKPI {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate?: number;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface CampaignData extends TableRow {
  campaign: string;
  investment: number;
  revenue: number;
  roas: number;
  sales: number;
  cpa: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

export interface DemographicData {
  gender: { male: number; female: number; other: number };
  ageGroups: { '18-24': number; '25-34': number; '35-44': number; '45-54': number; '55+': number };
  devices: { desktop: number; mobile: number; tablet: number };
  locations: { city: string; sessions: number; revenue: number }[];
}

export interface ProductData extends TableRow {
  product: string;
  views: number;
  addToCart: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
}