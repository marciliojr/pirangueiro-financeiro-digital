import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DadosGraficoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";

interface GraficoReceitasDespesasProps {
    receitas: DadosGraficoDTO[];
    despesas: DadosGraficoDTO[];
    totalReceitas?: number;
    totalDespesas?: number;
    saldo?: number;
    mes?: number;
    ano?: number;
}

interface DadosGrafico {
    name: string;
    value: number;
    fill: string;
    percentual?: number;
}

// Paleta de cores moderna
const CORES_RECEITAS = [
    '#10B981', '#059669', '#047857', '#065F46', 
    '#6EE7B7', '#34D399', '#A7F3D0', '#D1FAE5'
];

const CORES_DESPESAS = [
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
    '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-900">{data.name}</p>
                <p className="text-sm text-gray-600">
                    Valor: <span className="font-semibold">{formatarMoeda(data.value)}</span>
                </p>
                {data.payload.percentual && (
                    <p className="text-sm text-gray-600">
                        Percentual: <span className="font-semibold">{data.payload.percentual.toFixed(1)}%</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostra label para fatias muito pequenas
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            fontSize="11"
            fontWeight="600"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
}: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    bgColor: string; 
}) => (
    <div className={`${bgColor} p-4 rounded-xl border`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className={`text-lg font-bold ${color}`}>
                    {formatarMoeda(value)}
                </p>
            </div>
        </div>
    </div>
);

export function GraficoReceitasDespesas({ 
    receitas, 
    despesas, 
    totalReceitas = 0,
    totalDespesas = 0,
    saldo = 0,
    mes,
    ano 
}: GraficoReceitasDespesasProps) {
    const [hoveredReceita, setHoveredReceita] = useState<string | null>(null);
    const [hoveredDespesa, setHoveredDespesa] = useState<string | null>(null);

    // Verificar se há dados para exibir
    const temDados = receitas.length > 0 || despesas.length > 0;

    // Preparar dados para os gráficos com cores automáticas
    const dadosReceitas: DadosGrafico[] = receitas
        .map((r, index) => ({
            name: r.categoria,
            value: r.valor,
            fill: r.cor || CORES_RECEITAS[index % CORES_RECEITAS.length],
            percentual: r.percentual
        }))
        .sort((a, b) => b.value - a.value);

    const dadosDespesas: DadosGrafico[] = despesas
        .map((d, index) => ({
            name: d.categoria,
            value: d.valor,
            fill: d.cor || CORES_DESPESAS[index % CORES_DESPESAS.length],
            percentual: d.percentual
        }))
        .sort((a, b) => b.value - a.value);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="space-y-6">
            {/* Header com informações do período */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <PieChartIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-gray-900">
                                    Distribuição por Categoria
                                </CardTitle>
                                {mes && ano && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {meses[mes - 1]} de {ano}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>



            {/* Gráficos */}
            <Card className="shadow-lg">
                <CardContent className="p-6">
                    {!temDados ? (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center text-gray-500">
                            <PieChartIcon className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Nenhum dado disponível</p>
                            <p className="text-sm">para o período selecionado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Gráfico de Receitas */}
                            {dadosReceitas.length > 0 && (
                                <div className="space-y-4">
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={dadosReceitas}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    innerRadius={40}
                                                    paddingAngle={2}
                                                    labelLine={false}
                                                    label={CustomLabel}
                                                    onMouseEnter={(_, index) => 
                                                        setHoveredReceita(dadosReceitas[index]?.name || null)
                                                    }
                                                    onMouseLeave={() => setHoveredReceita(null)}
                                                >
                                                    {dadosReceitas.map((entry, index) => (
                                                        <Cell 
                                                            key={`receita-${index}`} 
                                                            fill={entry.fill}
                                                            stroke={hoveredReceita === entry.name ? "#fff" : "none"}
                                                            strokeWidth={hoveredReceita === entry.name ? 2 : 0}
                                                            style={{
                                                                filter: hoveredReceita === entry.name ? 'brightness(1.1)' : 'none',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36}
                                                    wrapperStyle={{ fontSize: '12px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Gráfico de Despesas */}
                            {dadosDespesas.length > 0 && (
                                <div className="space-y-4">
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={dadosDespesas}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    innerRadius={40}
                                                    paddingAngle={2}
                                                    labelLine={false}
                                                    label={CustomLabel}
                                                    onMouseEnter={(_, index) => 
                                                        setHoveredDespesa(dadosDespesas[index]?.name || null)
                                                    }
                                                    onMouseLeave={() => setHoveredDespesa(null)}
                                                >
                                                    {dadosDespesas.map((entry, index) => (
                                                        <Cell 
                                                            key={`despesa-${index}`} 
                                                            fill={entry.fill}
                                                            stroke={hoveredDespesa === entry.name ? "#fff" : "none"}
                                                            strokeWidth={hoveredDespesa === entry.name ? 2 : 0}
                                                            style={{
                                                                filter: hoveredDespesa === entry.name ? 'brightness(1.1)' : 'none',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36}
                                                    wrapperStyle={{ fontSize: '12px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}