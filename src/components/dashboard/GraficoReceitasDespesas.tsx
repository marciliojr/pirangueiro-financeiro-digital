import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DadosGraficoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GraficoReceitasDespesasProps {
    receitas: DadosGraficoDTO[];
    despesas: DadosGraficoDTO[];
}

export function GraficoReceitasDespesas({ receitas, despesas }: GraficoReceitasDespesasProps) {
    // Verificar se há dados para exibir
    const temDados = receitas.length > 0 || despesas.length > 0;

    // Preparar dados para o gráfico
    const dados = temDados ? [
        ...receitas.map(r => ({
            categoria: r.categoria,
            Receitas: r.valor,
            cor: r.cor
        })),
        ...despesas.map(d => ({
            categoria: d.categoria,
            Despesas: d.valor,
            cor: d.cor
        }))
    ] : [];

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Receitas e Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                {!temDados ? (
                    <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível para o período selecionado
                    </div>
                ) : (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dados}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="categoria" />
                                <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                                <Tooltip 
                                    formatter={(value) => formatarMoeda(Number(value))}
                                    contentStyle={{
                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Receitas" fill="#4287f5" />
                                <Bar dataKey="Despesas" fill="#f54242" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 