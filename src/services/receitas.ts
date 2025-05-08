
import { api } from "./api";
import type { CategoriaDTO } from "./categorias";
import type { ContaDTO } from "./contas";

export interface ReceitaDTO {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;
  contaId: number;
  anexoUrl?: string;
  categoria?: CategoriaDTO;
  conta?: ContaDTO;
}

export const ReceitasService = {
  listar: async (): Promise<ReceitaDTO[]> => {
    const response = await api.get("/receitas");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<ReceitaDTO> => {
    const response = await api.get(`/receitas/${id}`);
    return response.data;
  },

  buscarPorDescricao: async (descricao: string): Promise<ReceitaDTO[]> => {
    const response = await api.get(`/receitas/buscar?descricao=${descricao}`);
    return response.data;
  },

  buscarPorMesAno: async (mes: number, ano: number): Promise<ReceitaDTO[]> => {
    const response = await api.get(`/receitas/mes/${mes}/ano/${ano}`);
    return response.data;
  },

  criar: async (receita: ReceitaDTO): Promise<ReceitaDTO> => {
    const response = await api.post("/receitas", receita);
    return response.data;
  },

  atualizar: async (id: number, receita: ReceitaDTO): Promise<ReceitaDTO> => {
    const response = await api.put(`/receitas/${id}`, receita);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/receitas/${id}`);
  },
};
