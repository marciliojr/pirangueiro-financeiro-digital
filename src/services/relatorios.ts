
import { api } from "./api";
import type { DespesaDTO } from "./despesas";
import type { ReceitaDTO } from "./receitas";

export interface RelatorioDTO {
  receitas: ReceitaDTO[];
  despesas: DespesaDTO[];
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export const RelatoriosService = {
  buscarRelatorioPorMesAno: async (mes: number, ano: number): Promise<RelatorioDTO> => {
    const response = await api.get(`/relatorios?mes=${mes}&ano=${ano}`);
    return response.data;
  },

  gerarPDF: async (mes: number, ano: number): Promise<Blob> => {
    const response = await api.get(`/relatorios/pdf?mes=${mes}&ano=${ano}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
