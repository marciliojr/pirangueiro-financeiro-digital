import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoDespesasCartaoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface GraficoDespesasCartaoProps {
    dados: GraficoDespesasCartaoDTO;
    onMesesChange: (meses: number) => void;
}

interface DataPoint {
    mes: string;
    [key: string]: string | number; // Para permitir propriedades dinâmicas dos cartões
}

export function GraficoDespesasCartao({ dados, onMesesChange }: GraficoDespesasCartaoProps) {
    const [anoSelecionado, setAnoSelecionado] = useState<string>(new Date().getFullYear().toString());
    
    // Preparar dados para o gráfico
    const dadosGrafico = dados.meses.map((mes, index) => {
        const dataPoint: DataPoint = {
            mes: mes
        };
        
        dados.series.forEach(serie => {
            dataPoint[serie.nomeCartao] = serie.valores[index];
        });
        
        return dataPoint;
    });

    // Gerar cores diferentes para cada cartão
    const cores = [
        "#f43f5e", // Rosa
        "#22c55e", // Verde
        "#3b82f6", // Azul
        "#f59e0b", // Laranja
        "#8b5cf6", // Roxo
        "#10b981", // Verde esmeralda
        "#6366f1", // Índigo
        "#ec4899"  // Rosa escuro
    ];

    // Obter anos únicos dos meses
    const anos = [...new Set(dados.meses.map(mes => mes.split("/")[1]))];

    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Despesas por Cartão</CardTitle>
                    <div className="flex gap-4">
                        <Select
                            value={anoSelecionado}
                            onValueChange={setAnoSelecionado}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {anos.map(ano => (
                                    <SelectItem key={ano} value={ano}>
                                        {ano}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            defaultValue="12"
                            onValueChange={(value) => onMesesChange(Number(value))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Últimos 3 meses</SelectItem>
                                <SelectItem value="6">Últimos 6 meses</SelectItem>
                                <SelectItem value="12">Últimos 12 meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {dados.series.length === 0 ? (
                    <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível para o período selecionado
                    </div>
                ) : (
                    <>
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
                                        formatter={(value: number) => [formatarMoeda(value)]}
                                        labelFormatter={(label) => `Mês: ${label}`}
                                    />
                                    <Legend />
                                    {dados.series.map((serie, index) => (
                                        <Bar
                                            key={serie.nomeCartao}
                                            dataKey={serie.nomeCartao}
                                            fill={cores[index % cores.length]}
                                            name={`${serie.nomeCartao} (Total: ${formatarMoeda(serie.valorTotal)})`}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground text-right">
                            Total do Período: {formatarMoeda(dados.valorTotalPeriodo)}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
} 