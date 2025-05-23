import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/services/api";
import { ArrowDown, ArrowUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GraficoTendenciaGastosProps {
  dados: {
    meses: string[];
    valores: number[];
    coeficienteAngular: number;
    mediaGastos: number;
    tendencia: string;
    valorPrevistoProximoMes: number;
  };
}

export function GraficoTendenciaGastos({ dados }: GraficoTendenciaGastosProps) {
  // Preparar dados para o gráfico
  const dadosGrafico = dados.meses.map((mes, index) => ({
    mes,
    valor: dados.valores[index],
    // Calcular a linha de tendência
    tendencia: dados.valores[0] + (dados.coeficienteAngular * index)
  }));

  // Determinar a cor baseada na tendência
  const corTendencia = dados.tendencia === "CRESCENTE" ? "#ef4444" : "#22c55e";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendência de Gastos</CardTitle>
            <CardDescription>Análise dos últimos 12 meses</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {dados.tendencia === "CRESCENTE" ? (
              <ArrowUp className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-emerald-500" />
            )}
            <span className={dados.tendencia === "CRESCENTE" ? "text-red-500" : "text-emerald-500"}>
              {formatarMoeda(Math.abs(dados.coeficienteAngular))}/mês
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} />
              <Tooltip
                formatter={(value: number) => [formatarMoeda(value), "Valor"]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#6b7280"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="tendencia"
                stroke={corTendencia}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Média de Gastos</p>
            <p className="text-2xl font-bold">{formatarMoeda(dados.mediaGastos)}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Previsão Próximo Mês</p>
            <p className="text-2xl font-bold">{formatarMoeda(dados.valorPrevistoProximoMes)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 