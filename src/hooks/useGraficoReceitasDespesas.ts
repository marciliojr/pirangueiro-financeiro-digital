import { useState, useEffect } from 'react';
import { GraficosService } from '@/services/graficos';
import { format } from 'date-fns';

interface DadosGraficoMensal {
    mes: string;
    mesFormatado: string;
    receitas: number;
    despesas: number;
    saldo: number;
}

interface UseGraficoReceitasDespesasReturn {
    dados: DadosGraficoMensal[];
    loading: boolean;
    erro: string | null;
    periodo: { dataInicio: string; dataFim: string } | null;
    totalReceitas: number;
    totalDespesas: number;
    saldoTotal: number;
    buscarDados: (inicio?: Date, fim?: Date) => Promise<void>;
    limparErro: () => void;
}

// Utilitário de formatação
const formatarMes = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
    });
};

export function useGraficoReceitasDespesas(): UseGraficoReceitasDespesasReturn {
    const [dados, setDados] = useState<DadosGraficoMensal[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
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

    // Função para limpar erro
    const limparErro = () => {
        setErro(null);
    };

    // Carregar dados iniciais (últimos 12 meses)
    useEffect(() => {
        buscarDados();
    }, []);

    return {
        dados,
        loading,
        erro,
        periodo,
        totalReceitas,
        totalDespesas,
        saldoTotal,
        buscarDados,
        limparErro
    };
} 