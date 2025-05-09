import { api } from "./api";

export interface CartaoDTO {
  id?: number;
  nome: string;
  bandeira: string;
  limite: number;
  vencimentoFatura: string;
}

export const CartoesService = {
  listar: async (): Promise<CartaoDTO[]> => {
    const response = await api.get("/cartoes");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<CartaoDTO> => {
    const response = await api.get(`/cartoes/${id}`);
    return response.data;
  },

  buscarPorNome: async (nome: string): Promise<CartaoDTO[]> => {
    const response = await api.get(`/cartoes/buscar?nome=${nome}`);
    return response.data;
  },

  criar: async (cartao: CartaoDTO): Promise<CartaoDTO> => {
    const response = await api.post("/cartoes", cartao);
    return response.data;
  },

  atualizar: async (id: number, cartao: CartaoDTO): Promise<CartaoDTO> => {
    const response = await api.put(`/cartoes/${id}`, cartao);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/cartoes/${id}`);
  },
}; 