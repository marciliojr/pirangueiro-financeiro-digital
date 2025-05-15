import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DadosGraficoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface GraficoReceitasDespesasProps {
    receitas: DadosGraficoDTO[];
    despesas: DadosGraficoDTO[];
}

interface DadosGrafico {
    name: string;
    value: number;
    cor: string;
}

interface ActiveShapeProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: DadosGrafico;
    percent: number;
    value: number;
}

const renderActiveShape = (props: ActiveShapeProps) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                stroke={fill}
                fill="none"
            />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                textAnchor={textAnchor}
                fill="#333"
            >{`${payload.name}`}</text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={18}
                textAnchor={textAnchor}
                fill="#999"
            >
                {`${formatarMoeda(value)} (${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

export function GraficoReceitasDespesas({ receitas, despesas }: GraficoReceitasDespesasProps) {
    const [activeIndexReceitas, setActiveIndexReceitas] = useState<number | undefined>();
    const [activeIndexDespesas, setActiveIndexDespesas] = useState<number | undefined>();

    // Verificar se há dados para exibir
    const temDados = receitas.length > 0 || despesas.length > 0;

    // Preparar dados para os gráficos
    const dadosReceitas = receitas.map(r => ({
        name: r.categoria,
        value: r.valor,
        cor: r.cor
    }));

    const dadosDespesas = despesas.map(d => ({
        name: d.categoria,
        value: d.valor,
        cor: d.cor
    }));

    const onPieEnterReceitas = (_: unknown, index: number) => {
        setActiveIndexReceitas(index);
    };

    const onPieEnterDespesas = (_: unknown, index: number) => {
        setActiveIndexDespesas(index);
    };

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
                    <div className="h-[400px] w-full grid grid-cols-2 gap-4">
                        {/* Gráfico de Receitas */}
                        <div className="h-full">
                            <p className="text-center font-medium text-green-600 mb-4">Receitas</p>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndexReceitas}
                                        activeShape={renderActiveShape}
                                        data={dadosReceitas}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        onMouseEnter={onPieEnterReceitas}
                                    >
                                        {dadosReceitas.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.cor} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gráfico de Despesas */}
                        <div className="h-full">
                            <p className="text-center font-medium text-red-600 mb-4">Despesas</p>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndexDespesas}
                                        activeShape={renderActiveShape}
                                        data={dadosDespesas}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        onMouseEnter={onPieEnterDespesas}
                                    >
                                        {dadosDespesas.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.cor} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 