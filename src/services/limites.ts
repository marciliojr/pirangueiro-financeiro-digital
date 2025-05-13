import { api } from "./api";

export interface LimiteGastosDTO {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
}

export const LimitesService = {
  listar: async (): Promise<LimiteGastosDTO[]> => {
    const response = await api.get("/limites-gastos");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<LimiteGastosDTO> => {
    const response = await api.get(`/limites-gastos/${id}`);
    return response.data;
  },

  buscarPorDescricao: async (descricao: string): Promise<LimiteGastosDTO[]> => {
    const response = await api.get(`/limites-gastos/buscar?descricao=${descricao}`);
    return response.data;
  },

  criar: async (limite: LimiteGastosDTO): Promise<LimiteGastosDTO> => {
    console.log("Criando limite:", limite);
    const response = await api.post("/limites-gastos", limite);
    return response.data;
  },

  atualizar: async (id: number, limite: LimiteGastosDTO): Promise<LimiteGastosDTO> => {
    console.log(`Enviando PUT para /limites-gastos/${id}`, limite);
    
    // Garantir que o objeto a ser enviado tenha a estrutura correta
    const payload = {
      descricao: limite.descricao,
      valor: limite.valor,
      data: limite.data,
      // Incluir o ID explicitamente
      id: id
    };
    
    try {
      const response = await api.put(`/limites-gastos/${id}`, payload);
      console.log("Resposta da atualização:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro na atualização do limite:", error);
      throw error;
    }
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/limites-gastos/${id}`);
  },
};
