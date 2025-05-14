import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatarMoeda } from "@/services/api";
import { cn } from "@/lib/utils";

interface FinanceSummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  iconColor: string;
}

export function FinanceSummaryCard({
  title,
  value,
  icon,
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
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{formatarMoeda(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
