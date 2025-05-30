import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraficoDespesasCartaoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback, useEffect } from "react";
import { FileText, Image } from "lucide-react";
import { exportChart } from "@/lib/export-chart";

interface GraficoDespesasCartaoProps {
    dados: GraficoDespesasCartaoDTO;
    onMesesChange: (meses: number) => void;
    mesesAtual: number;
}

interface DataPoint {
    mes: string;
    [key: string]: string | number; // Para permitir propriedades dinâmicas dos cartões
}

export function GraficoDespesasCartao({ dados, onMesesChange, mesesAtual }: GraficoDespesasCartaoProps) {
    const [periodoSelecionado, setPeriodoSelecionado] = useState<string>(mesesAtual.toString());
    const [exportando, setExportando] = useState(false);
    
    // Sincronizar o estado local com o valor recebido do Dashboard
    useEffect(() => {
        setPeriodoSelecionado(mesesAtual.toString());
    }, [mesesAtual]);
    
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

    const handlePeriodoChange = useCallback((value: string) => {
        setPeriodoSelecionado(value);
        onMesesChange(Number(value));
    }, [onMesesChange]);

    // Função para exportar o gráfico
    const handleExport = async (format: 'pdf' | 'jpg') => {
        setExportando(true);
        try {
            const filename = `grafico_despesas_cartao_${periodoSelecionado}meses`;
            await exportChart({
                elementId: 'grafico-despesas-cartao',
                filename,
                format
            });
        } catch (error) {
            console.error('Erro ao exportar:', error);
        } finally {
            setExportando(false);
        }
    };

    return (
        <Card className="col-span-full" id="grafico-despesas-cartao">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Despesas por Cartão</CardTitle>
                    <div className="flex gap-4">
                        <Select
                            value={periodoSelecionado}
                            onValueChange={handlePeriodoChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Últimos 3 meses</SelectItem>
                                <SelectItem value="6">Últimos 6 meses</SelectItem>
                                <SelectItem value="12">Últimos 12 meses</SelectItem>
                                <SelectItem value="18">Período de 18 meses</SelectItem>
                                <SelectItem value="24">Período de 24 meses</SelectItem>
                                <SelectItem value="48">Período de 48 meses</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Botões de Exportação */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('pdf')}
                                disabled={exportando || dados.series.length === 0}
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('jpg')}
                                disabled={exportando || dados.series.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Image className="h-4 w-4" />
                                JPG
                            </Button>
                        </div>
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