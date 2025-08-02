import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelStep } from "@/types/dashboardTypes";
import { TrendingDown } from "lucide-react";

interface FunnelChartProps {
  data: FunnelStep[];
  title: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(step => step.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => {
            const width = (step.value / maxValue) * 100;
            const nextStep = data[index + 1];
            const conversionRate = nextStep ? (nextStep.value / step.value) * 100 : null;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {step.value.toLocaleString()}
                    </span>
                    {step.rate && (
                      <span className="text-xs text-muted-foreground">
                        ({step.rate.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                
                {conversionRate && (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      Taxa de conversão: {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}