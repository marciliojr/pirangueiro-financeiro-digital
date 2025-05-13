import { api } from "./api";

export interface DadosGraficoDTO {
    categoria: string;
    valor: number;
    cor: string;        // Formato: "#RRGGBB"
    percentual: number; // Valor entre 0 e 100
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
            
            // Garantir que todas as receitas tenham uma cor (azul se não definida)
            const receitas = (response.data.receitas || []).map((receita: DadosGraficoDTO) => ({
                ...receita,
                cor: receita.cor || "#4287f5"
            }));

            // Garantir que todas as despesas tenham uma cor (vermelho se não definida)
            const despesas = (response.data.despesas || []).map((despesa: DadosGraficoDTO) => ({
                ...despesa,
                cor: despesa.cor || "#f54242"
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
    }
}; 