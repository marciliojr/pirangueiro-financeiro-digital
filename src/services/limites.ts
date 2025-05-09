import { api } from "./api";

export interface LimiteGastosDTO {
  id?: number;
  descricao: string;
  valorLimite: number;
  categoriaId: number;
}

export const LimitesService = {
  listar: async (): Promise<LimiteGastosDTO[]> => {
    const response = await api.get("/api/limites-gastos");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<LimiteGastosDTO> => {
    const response = await api.get(`/api/limites-gastos/${id}`);
    return response.data;
  },

  buscarPorDescricao: async (descricao: string): Promise<LimiteGastosDTO[]> => {
    const response = await api.get(`/api/limites-gastos/buscar?descricao=${descricao}`);
    return response.data;
  },

  criar: async (limite: LimiteGastosDTO): Promise<LimiteGastosDTO> => {
    const response = await api.post("/api/limites-gastos", limite);
    return response.data;
  },

  atualizar: async (id: number, limite: LimiteGastosDTO): Promise<LimiteGastosDTO> => {
    const response = await api.put(`/api/limites-gastos/${id}`, limite);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/limites-gastos/${id}`);
  },
};
