import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
  color?: 'analytics' | 'meta' | 'google' | 'ecommerce' | 'seo';
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  className,
  color = 'analytics'
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300",
      className
    )}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}/10 rounded-bl-full`}>
        <Icon className={`w-5 h-5 text-${color} absolute top-3 right-3`} />
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {change && (
            <p className={cn("text-xs", getChangeColor())}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}