import { ReactNode, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatarMoeda } from "@/services/api";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinanceSummaryCardProps {
  title: string;
  value: number;
  totalValue?: number;
  icon: ReactNode;
  color: string;
  iconColor: string;
  showTotal?: boolean;
}

export function FinanceSummaryCard({
  title,
  value,
  totalValue,
  icon,
  color,
  iconColor,
  showTotal = false
}: FinanceSummaryCardProps) {
  const [showValues, setShowValues] = useState(true);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-md", color)}>
            <div className={cn(iconColor)}>{icon}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowValues(!showValues)}
            className="h-8 w-8"
          >
            {showValues ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Valor Mensal:</p>
              <p className="text-lg font-bold">
                {showValues ? formatarMoeda(value) : "••••••"}
              </p>
            </div>
            {showTotal && totalValue !== undefined && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Acumulado:</p>
                <p className="text-lg font-bold">
                  {showValues ? formatarMoeda(totalValue) : "••••••"}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
