
import { api } from "./api";

export interface ReceitaDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  contaId: number;
  recebido: boolean;
}

export const ReceitasService = {
  listar: async (): Promise<ReceitaDTO[]> => {
    const response = await api.get("/api/receitas");
    return response.data;
  },

  listarPorMesAno: async (mes: number, ano: number): Promise<ReceitaDTO[]> => {
    const response = await api.get(`/api/receitas/mes/${mes}/ano/${ano}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<ReceitaDTO> => {
    const response = await api.get(`/api/receitas/${id}`);
    return response.data;
  },

  criar: async (receita: ReceitaDTO): Promise<ReceitaDTO> => {
    const response = await api.post("/api/receitas", receita);
    return response.data;
  },

  atualizar: async (id: number, receita: ReceitaDTO): Promise<ReceitaDTO> => {
    const response = await api.put(`/api/receitas/${id}`, receita);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/receitas/${id}`);
  },
};
