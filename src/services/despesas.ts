
import { api } from "./api";

export interface DespesaDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  contaId: number;
  pago: boolean;
}

export const DespesasService = {
  listar: async (): Promise<DespesaDTO[]> => {
    const response = await api.get("/api/despesas");
    return response.data;
  },

  listarPorMesAno: async (mes: number, ano: number): Promise<DespesaDTO[]> => {
    const response = await api.get(`/api/despesas/mes/${mes}/ano/${ano}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<DespesaDTO> => {
    const response = await api.get(`/api/despesas/${id}`);
    return response.data;
  },

  criar: async (despesa: DespesaDTO): Promise<DespesaDTO> => {
    const response = await api.post("/api/despesas", despesa);
    return response.data;
  },

  atualizar: async (id: number, despesa: DespesaDTO): Promise<DespesaDTO> => {
    const response = await api.put(`/api/despesas/${id}`, despesa);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/despesas/${id}`);
  },
};
