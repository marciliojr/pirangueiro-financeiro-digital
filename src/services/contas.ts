
import { api } from "./api";

export interface ContaDTO {
  id?: number;
  nome: string;
  tipo: string;
  saldoAtual: number;
  imagemUrl?: string;
}

export const ContasService = {
  listar: async (): Promise<ContaDTO[]> => {
    const response = await api.get("/contas");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<ContaDTO> => {
    const response = await api.get(`/contas/${id}`);
    return response.data;
  },

  buscarPorNome: async (nome: string): Promise<ContaDTO[]> => {
    const response = await api.get(`/contas/buscar?nome=${nome}`);
    return response.data;
  },

  criar: async (conta: ContaDTO): Promise<ContaDTO> => {
    const response = await api.post("/contas", conta);
    return response.data;
  },

  atualizar: async (id: number, conta: ContaDTO): Promise<ContaDTO> => {
    const response = await api.put(`/contas/${id}`, conta);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/contas/${id}`);
  },
};
