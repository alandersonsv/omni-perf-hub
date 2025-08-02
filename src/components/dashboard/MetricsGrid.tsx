import { MetricCard } from "@/components/MetricCard";
import { MetricKPI } from "@/types/dashboardTypes";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  ShoppingCart, 
  Receipt, 
  Calculator, 
  Percent, 
  Users, 
  User, 
  Activity, 
  Eye, 
  Globe,
  Search,
  UserPlus,
  FileText,
  Hash,
  Package,
  MousePointer
} from "lucide-react";

interface MetricsGridProps {
  metrics: MetricKPI[];
  color?: 'analytics' | 'meta' | 'google' | 'ecommerce' | 'seo';
}

const iconMap = {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  Receipt,
  Calculator,
  Percent,
  Users,
  User,
  Activity,
  Eye,
  Globe,
  Search,
  UserPlus,
  FileText,
  Hash,
  Package,
  MousePointer
};

export function MetricsGrid({ metrics, color = 'analytics' }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || DollarSign;
        
        return (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={IconComponent}
            color={color}
          />
        );
      })}
    </div>
  );
}