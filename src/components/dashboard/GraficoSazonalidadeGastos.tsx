import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoSazonalidadeGastosDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface GraficoSazonalidadeGastosProps {
    dados: GraficoSazonalidadeGastosDTO;
}

export function GraficoSazonalidadeGastos({ dados }: GraficoSazonalidadeGastosProps) {
    // Preparar dados para o gráfico
    const dadosGrafico = dados.meses.map((mes, index) => ({
        mes: mes,
        media: dados.mediasGastos[index]
    }));

    // Calcular a média geral para a linha de referência
    const mediaGeral = dados.mediasGastos.reduce((acc, curr) => acc + curr, 0) / dados.mediasGastos.length;

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Sazonalidade de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={dadosGrafico}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="mes"
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value) => formatarMoeda(value)}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatarMoeda(value), "Média de Gastos"]}
                                labelFormatter={(label) => `Mês: ${label}`}
                            />
                            <Bar
                                dataKey="media"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                            />
                            <ReferenceLine
                                y={mediaGeral}
                                stroke="#6366f1"
                                strokeDasharray="3 3"
                                label={{ 
                                    value: "Média Geral",
                                    position: "right",
                                    fill: "#6366f1",
                                    fontSize: 12
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Maior Média de Gastos</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{dados.mesMaiorGasto}</span>
                            <span className="text-sm font-medium text-rose-600">
                                {formatarMoeda(dados.maiorMedia)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Menor Média de Gastos</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{dados.mesMenorGasto}</span>
                            <span className="text-sm font-medium text-emerald-600">
                                {formatarMoeda(dados.menorMedia)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 