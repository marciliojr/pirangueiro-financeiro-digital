import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatarMoeda } from "@/services/api";
import { GraficosService } from "@/services/graficos";
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from "recharts";
import { useState, useEffect } from "react";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Calendar as CalendarIcon, 
    BarChart3, 
    LineChart as LineChartIcon,
    Download,
    FileText,
    Loader2
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Interfaces para os dados da API
interface DadosMensalDTO {
    mes: string;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

interface RespostaGraficoMensalDTO {
    dados: DadosMensalDTO[];
    periodo: {
        dataInicio: string;
        dataFim: string;
    };
}

interface DadosGraficoMensal {
    mes: string;
    mesFormatado: string;
    receitas: number;
    despesas: number;
    saldo: number;
}

interface GraficoReceitasDespesasMensalProps {
    className?: string;
}

// Utilitários de formatação
const formatarMes = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
    });
};

const formatarMesCompleto = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });
};

// Componente de Tooltip customizado
const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-900 mb-2">{label ? formatarMesCompleto(label) : ''}</p>
                {payload.map((entry, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">{formatarMoeda(entry.value)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Componente de Card de Estatísticas
const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
}: { 
    title: string; 
    value: number; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string; 
    bgColor: string; 
}) => (
    <div className={`${bgColor} p-4 rounded-xl border`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
                color === 'text-green-600' ? 'bg-green-100' : 
                color === 'text-red-600' ? 'bg-red-100' : 
                'bg-blue-100'
            }`}>
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

export function GraficoReceitasDespesasMensal({ className }: GraficoReceitasDespesasMensalProps) {
    // Estados
    const [dados, setDados] = useState<DadosGraficoMensal[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'barra'>('linha');
    const [dataInicio, setDataInicio] = useState<Date | undefined>();
    const [dataFim, setDataFim] = useState<Date | undefined>();
    const [periodo, setPeriodo] = useState<{ dataInicio: string; dataFim: string } | null>(null);

    // Calcular totais
    const totalReceitas = dados.reduce((acc, item) => acc + item.receitas, 0);
    const totalDespesas = dados.reduce((acc, item) => acc + item.despesas, 0);
    const saldoTotal = totalReceitas - totalDespesas;

    // Função para buscar dados
    const buscarDados = async (inicio?: Date, fim?: Date) => {
        setLoading(true);
        setErro(null);
        
        try {
            const dataInicioStr = inicio ? format(inicio, 'yyyy-MM-dd') : undefined;
            const dataFimStr = fim ? format(fim, 'yyyy-MM-dd') : undefined;
            
            const resposta = await GraficosService.buscarReceitasDespesasMensal(dataInicioStr, dataFimStr);
            
            const dadosFormatados: DadosGraficoMensal[] = resposta.dados.map(item => ({
                mes: item.mes,
                mesFormatado: formatarMes(item.mes),
                receitas: item.totalReceitas,
                despesas: item.totalDespesas,
                saldo: item.saldo
            }));
            
            setDados(dadosFormatados);
            setPeriodo(resposta.periodo);
        } catch (error) {
            setErro('Erro ao carregar dados. Tente novamente.');
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carregar dados iniciais (últimos 12 meses)
    useEffect(() => {
        buscarDados();
    }, []);

    // Função para aplicar filtro
    const aplicarFiltro = () => {
        if (dataInicio && dataFim) {
            if (dataInicio > dataFim) {
                setErro('Data de início deve ser anterior à data de fim');
                return;
            }
        }
        buscarDados(dataInicio, dataFim);
    };

    // Função para últimos 12 meses
    const ultimos12Meses = () => {
        setDataInicio(undefined);
        setDataFim(undefined);
        buscarDados();
    };

    // Função para download do gráfico
    const downloadGrafico = async (formato: 'png' | 'pdf') => {
        const elemento = document.getElementById('grafico-receitas-despesas');
        if (!elemento) return;

        try {
            const canvas = await html2canvas(elemento);
            
            if (formato === 'png') {
                const link = document.createElement('a');
                link.download = 'receitas-despesas.png';
                link.href = canvas.toDataURL();
                link.click();
            } else {
                const pdf = new jsPDF();
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;

                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save('receitas-despesas.pdf');
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
        }
    };

    // Função para exportar CSV
    const exportarCSV = () => {
        const headers = ['Mês', 'Receitas', 'Despesas', 'Saldo'];
        const csvContent = [
            headers.join(','),
            ...dados.map(item => [
                item.mesFormatado,
                item.receitas.toFixed(2),
                item.despesas.toFixed(2),
                item.saldo.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'receitas-despesas.csv';
        link.click();
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header com controles */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-gray-900">
                                    Receitas x Despesas por Mês
                                </CardTitle>
                                {periodo && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {format(new Date(periodo.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                                        {format(new Date(periodo.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Seletor de Data Início */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[140px] justify-start text-left font-normal",
                                            !dataInicio && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Data início"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dataInicio}
                                        onSelect={setDataInicio}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Seletor de Data Fim */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[140px] justify-start text-left font-normal",
                                            !dataFim && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dataFim ? format(dataFim, "dd/MM/yyyy") : "Data fim"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dataFim}
                                        onSelect={setDataFim}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button onClick={aplicarFiltro} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aplicar Filtro
                            </Button>

                            <Button variant="outline" onClick={ultimos12Meses} disabled={loading}>
                                Últimos 12 Meses
                            </Button>

                            {/* Seletor de Tipo de Gráfico */}
                            <Select value={tipoGrafico} onValueChange={(value: 'linha' | 'barra') => setTipoGrafico(value)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="linha">
                                        <div className="flex items-center gap-2">
                                            <LineChartIcon className="h-4 w-4" />
                                            Linha
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="barra">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4" />
                                            Barra
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Botões de Export */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48">
                                    <div className="space-y-2">
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start"
                                            onClick={() => downloadGrafico('png')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PNG
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start"
                                            onClick={() => downloadGrafico('pdf')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start"
                                            onClick={exportarCSV}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            CSV
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Receitas"
                    value={totalReceitas}
                    icon={TrendingUp}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Total Despesas"
                    value={totalDespesas}
                    icon={TrendingDown}
                    color="text-red-600"
                    bgColor="bg-red-50"
                />
                <StatCard
                    title="Saldo"
                    value={saldoTotal}
                    icon={DollarSign}
                    color={saldoTotal >= 0 ? "text-blue-600" : "text-red-600"}
                    bgColor={saldoTotal >= 0 ? "bg-blue-50" : "bg-red-50"}
                />
            </div>

            {/* Gráfico */}
            <Card className="shadow-lg" id="grafico-receitas-despesas">
                <CardContent className="p-6">
                    {erro && (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center text-red-500">
                            <p className="text-lg font-medium">{erro}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-lg font-medium text-gray-600">Carregando dados...</p>
                        </div>
                    )}

                    {!loading && !erro && dados.length === 0 && (
                        <div className="h-[400px] w-full flex flex-col items-center justify-center text-gray-500">
                            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Sem dados</p>
                            <p className="text-sm">para o período selecionado</p>
                        </div>
                    )}

                    {!loading && !erro && dados.length > 0 && (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {tipoGrafico === 'linha' ? (
                                    <LineChart data={dados}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="mesFormatado" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatarMoeda(value)}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="receitas" 
                                            stroke="#22C55E" 
                                            strokeWidth={3}
                                            name="Receitas"
                                            dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="despesas" 
                                            stroke="#EF4444" 
                                            strokeWidth={3}
                                            name="Despesas"
                                            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="saldo" 
                                            stroke="#3B82F6" 
                                            strokeWidth={3}
                                            name="Saldo"
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                ) : (
                                    <BarChart data={dados}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="mesFormatado" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatarMoeda(value)}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar 
                                            dataKey="receitas" 
                                            fill="#22C55E" 
                                            name="Receitas"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar 
                                            dataKey="despesas" 
                                            fill="#EF4444" 
                                            name="Despesas"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar 
                                            dataKey="saldo" 
                                            fill="#3B82F6" 
                                            name="Saldo"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 