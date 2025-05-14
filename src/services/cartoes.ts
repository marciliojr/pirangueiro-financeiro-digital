import { api } from "./api";

export interface CartaoDTO {
  id?: number;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}

export interface DespesaDTO {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId?: number;
  categoria?: {
    id: number;
    nome: string;
  };
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

  buscarFatura: async (id: number, mes: number, ano: number): Promise<DespesaDTO[]> => {
    const response = await api.get(`/cartoes/${id}/despesas/fatura?mes=${mes}&ano=${ano}`);
    return response.data;
  }
}; 