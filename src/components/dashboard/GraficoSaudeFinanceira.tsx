import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFinanceiroDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";

interface GraficoSaudeFinanceiraProps {
    dados: DashboardFinanceiroDTO;
}

export function GraficoSaudeFinanceira({ dados }: GraficoSaudeFinanceiraProps) {
    // Preparar dados para o gráfico de barras dos cartões
    const dadosGrafico = dados.limitesCartoes.map(cartao => ({
        name: cartao.nomeCartao,
        usado: cartao.limiteUsado,
        disponivel: cartao.limiteDisponivel,
        percentual: cartao.percentualUtilizado
    }));

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Análise de Saúde Financeira</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Saldo Atual */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Saldo Atual</h3>
                        <p className={`text-2xl font-bold ${dados.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatarMoeda(dados.saldoAtual)}
                        </p>
                    </div>

                    {/* Taxa de Economia */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Taxa de Economia Mensal</h3>
                        <div className="flex items-center gap-4">
                            <Progress value={dados.taxaEconomiaMensal} className="flex-1" />
                            <span className="text-sm font-medium">
                                {dados.taxaEconomiaMensal.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Cartões */}
                {dados.limitesCartoes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Utilização dos Cartões</h3>
                        <div className="h-[300px]">
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
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                                    <Tooltip
                                        formatter={(value: number) => [formatarMoeda(value)]}
                                        labelFormatter={(label) => `Cartão: ${label}`}
                                    />
                                    <Bar dataKey="usado" stackId="a" name="Limite Usado" fill="#f43f5e" />
                                    <Bar dataKey="disponivel" stackId="a" name="Limite Disponível" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Lista detalhada dos cartões */}
                        <div className="mt-6 space-y-4">
                            {dados.limitesCartoes.map((cartao, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{cartao.nomeCartao}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {cartao.percentualUtilizado.toFixed(1)}% utilizado
                                        </span>
                                    </div>
                                    <Progress value={cartao.percentualUtilizado} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Usado: {formatarMoeda(cartao.limiteUsado)}</span>
                                        <span>Disponível: {formatarMoeda(cartao.limiteDisponivel)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 