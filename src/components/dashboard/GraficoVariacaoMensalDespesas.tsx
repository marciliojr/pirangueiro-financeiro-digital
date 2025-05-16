import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoVariacaoMensalDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GraficoVariacaoMensalDespesasProps {
    dados: GraficoVariacaoMensalDTO;
}

export function GraficoVariacaoMensalDespesas({ dados }: GraficoVariacaoMensalDespesasProps) {
    // Log para debug
    console.log('Dados recebidos no componente:', dados);

    // Preparar dados para o gráfico
    const dadosGrafico = dados?.totaisMensais?.map(totalMensal => ({
        mes: totalMensal.mes,
        valor: totalMensal.total || 0 // Garantir que sempre teremos um número
    })) || [];

    // Log para debug
    console.log('Dados processados para o gráfico:', dadosGrafico);

    // Se não houver dados, não renderizar o componente
    if (!dados?.totaisMensais?.length) {
        return null;
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Variação Mensal de Despesas {dados.ano}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={dadosGrafico}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
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
                                formatter={(value: number) => [formatarMoeda(value), "Total"]}
                                labelFormatter={(label) => `Mês: ${label}`}
                                contentStyle={{ fontSize: '11px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#f43f5e"
                                fill="#fecdd3"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 