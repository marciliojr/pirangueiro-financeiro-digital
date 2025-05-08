
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatarMoeda } from "@/services/api";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinanceSummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  trend: string;
  trendUp: boolean;
  color: string;
  iconColor: string;
}

export function FinanceSummaryCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color,
  iconColor
}: FinanceSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-md", color)}>
            <div className={cn(iconColor)}>{icon}</div>
          </div>
          
          <div className={cn(
            "flex items-center text-xs font-medium",
            trendUp ? "text-emerald-600" : "text-rose-600"
          )}>
            {trendUp ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{formatarMoeda(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
