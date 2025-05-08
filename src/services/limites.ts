
import { api } from "./api";

export interface LimiteGastoDTO {
  id: number;
  categoria: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
}

export const LimitesService = {
  listar: async (): Promise<LimiteGastoDTO[]> => {
    const response = await api.get("/api/limites-gastos");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<LimiteGastoDTO> => {
    const response = await api.get(`/api/limites-gastos/${id}`);
    return response.data;
  },

  criar: async (limite: LimiteGastoDTO): Promise<LimiteGastoDTO> => {
    const response = await api.post("/api/limites-gastos", limite);
    return response.data;
  },

  atualizar: async (id: number, limite: LimiteGastoDTO): Promise<LimiteGastoDTO> => {
    const response = await api.put(`/api/limites-gastos/${id}`, limite);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/limites-gastos/${id}`);
  },
};
