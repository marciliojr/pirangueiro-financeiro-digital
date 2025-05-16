import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DadosGraficoDTO } from "@/services/graficos";
import { formatarMoeda } from "@/services/api";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Legend } from "recharts";
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

interface LegendPayload {
    value: string;
    id?: string;
    type?: string;
    color?: string;
    payload?: {
        name: string;
        value: number;
        cor: string;
    };
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
    const mx = cx + (outerRadius + 25) * cos;
    const my = cy + (outerRadius + 25) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 18;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize="11">
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
                fontSize="11"
            >{`${payload.name}`}</text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={16}
                textAnchor={textAnchor}
                fill="#999"
                fontSize="11"
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

    // Preparar dados para os gráficos e ordenar por valor
    const dadosReceitas = receitas
        .map(r => ({
            name: r.categoria,
            value: r.valor,
            fill: r.cor
        }))
        .sort((a, b) => b.value - a.value);

    const dadosDespesas = despesas
        .map(d => ({
            name: d.categoria,
            value: d.valor,
            fill: d.cor
        }))
        .sort((a, b) => b.value - a.value);

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
                    <div className="h-[500px] w-full grid grid-cols-2 gap-4">
                        {/* Gráfico de Receitas */}
                        <div className="h-full flex flex-col">
                            <p className="text-center font-medium text-green-600 mb-4">Receitas</p>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndexReceitas}
                                            activeShape={renderActiveShape}
                                            data={dadosReceitas}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            onMouseEnter={onPieEnterReceitas}
                                        >
                                            {dadosReceitas.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Legend
                                            layout="horizontal"
                                            align="left"
                                            verticalAlign="bottom"
                                            wrapperStyle={{
                                                paddingTop: '20px',
                                                width: '100%',
                                                fontSize: '11px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Despesas */}
                        <div className="h-full flex flex-col">
                            <p className="text-center font-medium text-red-600 mb-4">Despesas</p>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndexDespesas}
                                            activeShape={renderActiveShape}
                                            data={dadosDespesas}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            onMouseEnter={onPieEnterDespesas}
                                        >
                                            {dadosDespesas.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Legend
                                            layout="horizontal"
                                            align="left"
                                            verticalAlign="bottom"
                                            wrapperStyle={{
                                                paddingTop: '20px',
                                                width: '100%',
                                                fontSize: '11px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 