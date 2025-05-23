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

export interface TotalMensalDTO {
    mes: string;
    total: number;
}

export interface GraficoVariacaoMensalDTO {
    ano: number;
    totaisMensais: TotalMensalDTO[];
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

    buscarVariacaoMensalDespesas: async (ano: number): Promise<GraficoVariacaoMensalDTO> => {
        try {
            const response = await api.get(`/graficos/variacao-mensal-despesas?ano=${ano}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar variação mensal de despesas:", error);
            return {
                ano,
                totaisMensais: []
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
    }
}; 