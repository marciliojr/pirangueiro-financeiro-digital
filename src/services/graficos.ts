import { api } from "./api";
import { CategoriasService } from "./categorias";

export interface DadosGraficoDTO {
    categoria: string;
    valor: number;
    cor: string;        // Formato: "#RRGGBB"
    percentual: number; // Valor entre 0 e 100
}

export interface CartaoLimiteDTO {
    nomeCartao: string;
    limiteTotal: number;
    limiteUsado: number;
    limiteDisponivel: number;
    percentualUtilizado: number;
}

export interface DashboardFinanceiroDTO {
    saldoAtual: number;
    taxaEconomiaMensal: number;
    limitesCartoes: CartaoLimiteDTO[];
}

export interface GraficoReceitasDespesasDTO {
    mes: number;
    ano: number;
    receitas: DadosGraficoDTO[];
    despesas: DadosGraficoDTO[];
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

export interface GraficoDespesasCartaoDTO {
    meses: string[];
    series: {
        nomeCartao: string;
        valores: number[];
        valorTotal: number;
    }[];
    valorTotalPeriodo: number;
}

export interface GraficoSazonalidadeGastosDTO {
    meses: string[];
    mediasGastos: number[];
    maiorMedia: number;
    menorMedia: number;
    mesMaiorGasto: string;
    mesMenorGasto: string;
}

export interface DadosSazonalidadeDTO {
    mes: string;
    mesCompleto: string;
    valor: number;
}

export interface GraficoTendenciaGastosDTO {
    meses: string[];
    valores: number[];
    coeficienteAngular: number;
    mediaGastos: number;
    tendencia: string;
    valorPrevistoProximoMes: number;
}

export const GraficosService = {
    buscarReceitasDespesas: async (mes: number, ano: number): Promise<GraficoReceitasDespesasDTO> => {
        try {
            const response = await api.get(`/graficos/receitas-despesas?mes=${mes}&ano=${ano}`);
            
            // Se não houver dados, retornar estrutura vazia
            if (!response.data) {
                return {
                    mes,
                    ano,
                    receitas: [],
                    despesas: [],
                    totalReceitas: 0,
                    totalDespesas: 0,
                    saldo: 0
                };
            }

            // Buscar todas as categorias para ter acesso às cores
            const categoriasReceitas = await CategoriasService.listarReceitas();
            const categoriasDespesas = await CategoriasService.listarDespesas();

            // Criar um mapa de nome da categoria para cor
            const mapaCores = new Map<string, string>();
            [...categoriasReceitas, ...categoriasDespesas].forEach(cat => {
                mapaCores.set(cat.nome, cat.cor || "#6366F1"); // Cor padrão se não definida
            });
            
            // Garantir que todas as receitas tenham uma cor da sua categoria
            const receitas = (response.data.receitas || []).map((receita: DadosGraficoDTO) => ({
                ...receita,
                cor: mapaCores.get(receita.categoria) || "#4287f5" // Azul como fallback
            }));

            // Garantir que todas as despesas tenham uma cor da sua categoria
            const despesas = (response.data.despesas || []).map((despesa: DadosGraficoDTO) => ({
                ...despesa,
                cor: mapaCores.get(despesa.categoria) || "#f54242" // Vermelho como fallback
            }));

            return {
                ...response.data,
                receitas,
                despesas,
                totalReceitas: response.data.totalReceitas || 0,
                totalDespesas: response.data.totalDespesas || 0,
                saldo: response.data.saldo || 0
            };
        } catch (error) {
            console.error("Erro ao buscar dados do gráfico:", error);
            // Retornar estrutura vazia em caso de erro
            return {
                mes,
                ano,
                receitas: [],
                despesas: [],
                totalReceitas: 0,
                totalDespesas: 0,
                saldo: 0
            };
        }
    },

    buscarDashboardFinanceiro: async (mes: number, ano: number): Promise<DashboardFinanceiroDTO> => {
        try {
            const response = await api.get(`/graficos/dashboard-financeiro?mes=${mes}&ano=${ano}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar dados do dashboard financeiro:", error);
            return {
                saldoAtual: 0,
                taxaEconomiaMensal: 0,
                limitesCartoes: []
            };
        }
    },

    buscarDespesasPorCartao: async (mesesAtras: number = 12): Promise<GraficoDespesasCartaoDTO> => {
        try {
            const response = await api.get(`/graficos/despesas-por-cartao?mesesAtras=${mesesAtras}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar despesas por cartão:", error);
            return {
                meses: [],
                series: [],
                valorTotalPeriodo: 0
            };
        }
    },

    buscarSazonalidadeGastos: async (): Promise<DadosSazonalidadeDTO[]> => {
        try {
            const response = await api.get('/graficos/sazonalidade-gastos');
            
            // Se não houver dados, retornar array vazio
            if (!response.data || !response.data.meses || response.data.meses.length === 0) {
                return [];
            }

            // Mapeamento de meses completos para abreviados
            const mesesParaAbreviado: { [key: string]: string } = {
                'JANEIRO': 'Jan',
                'FEVEREIRO': 'Fev',
                'MARÇO': 'Mar',
                'ABRIL': 'Abr',
                'MAIO': 'Mai',
                'JUNHO': 'Jun',
                'JULHO': 'Jul',
                'AGOSTO': 'Ago',
                'SETEMBRO': 'Set',
                'OUTUBRO': 'Out',
                'NOVEMBRO': 'Nov',
                'DEZEMBRO': 'Dez'
            };

            // Transformar os dados da API no formato esperado pelo componente
            return response.data.meses.map((mes: string, index: number) => ({
                mes: mesesParaAbreviado[mes] || mes.substring(0, 3),
                mesCompleto: mes.charAt(0).toUpperCase() + mes.slice(1).toLowerCase(),
                valor: response.data.mediasGastos[index] || 0
            }));
        } catch (error) {
            console.error("Erro ao buscar sazonalidade de gastos:", error);
            return [];
        }
    },

    buscarTendenciaGastos: async (): Promise<GraficoTendenciaGastosDTO> => {
        try {
            const response = await api.get('/graficos/tendencia-gastos');
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar tendência de gastos:", error);
            return {
                meses: [],
                valores: [],
                coeficienteAngular: 0,
                mediaGastos: 0,
                tendencia: "ESTÁVEL",
                valorPrevistoProximoMes: 0
            };
        }
    }
}; 