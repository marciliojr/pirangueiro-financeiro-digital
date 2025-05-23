import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoVariacaoMensalDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DadosGraficoItem {
    mes: string;
    total: number;
    variacao: number;
    corBarra: string;
}

interface GraficoVariacaoMensalDespesasProps {
    dados: GraficoVariacaoMensalDTO;
}

export function GraficoVariacaoMensalDespesas({ dados }: GraficoVariacaoMensalDespesasProps) {
    // Preparar dados para o gráfico com cálculo de variação
    const dadosGrafico: DadosGraficoItem[] = dados.totaisMensais.map((item, index, array) => {
        const mesAnterior = index > 0 ? array[index - 1].total : item.total;
        const variacao = ((item.total - mesAnterior) / mesAnterior) * 100;
        
        return {
            mes: item.mes,
            total: item.total,
            variacao: index === 0 ? 0 : variacao,
            corBarra: variacao > 0 ? "#f43f5e" : "#10b981"
        };
    });

    // Encontrar maior e menor variação
    const variacoes = dadosGrafico.slice(1).map(d => d.variacao); // Ignorar primeiro mês
    const maiorVariacao = Math.max(...variacoes);
    const menorVariacao = Math.min(...variacoes);
    
    const mesMaiorVariacao = dadosGrafico.find(d => d.variacao === maiorVariacao)?.mes || '';
    const mesMenorVariacao = dadosGrafico.find(d => d.variacao === menorVariacao)?.mes || '';

    // Função para renderizar o indicador de tendência
    const renderTendencia = (variacao: number) => {
        if (variacao > 1) return <TrendingUp className="h-4 w-4 text-rose-600" />;
        if (variacao < -1) return <TrendingDown className="h-4 w-4 text-emerald-600" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Variação Mensal de Despesas {dados.ano}</span>
                </CardTitle>
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
                                yAxisId="valor"
                                orientation="left"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value) => formatarMoeda(value)}
                            />
                            <YAxis
                                yAxisId="variacao"
                                orientation="right"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value) => `${value.toFixed(1)}%`}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === "Total") return [formatarMoeda(value), name];
                                    return [`${value.toFixed(1)}%`, "Variação"];
                                }}
                                labelFormatter={(label) => `Mês: ${label}`}
                            />
                            <ReferenceLine y={0} yAxisId="variacao" stroke="#666" strokeDasharray="3 3" />
                            <Bar
                                yAxisId="valor"
                                dataKey="total"
                                name="Total"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="variacao"
                                dataKey="variacao"
                                name="Variação"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Maior Aumento Mensal</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-rose-600" />
                                <span className="text-sm">{mesMaiorVariacao}</span>
                            </div>
                            <span className="text-sm font-medium text-rose-600">
                                +{maiorVariacao.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Maior Redução Mensal</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">{mesMenorVariacao}</span>
                            </div>
                            <span className="text-sm font-medium text-emerald-600">
                                {menorVariacao.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Legenda de Variação:</p>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-rose-600" />
                            <span className="text-sm">Aumento</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-600" />
                            <span className="text-sm">Redução</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 