import { api } from "./api";
import { ContaDTO } from "./contas";
import { CartaoDTO } from "./cartoes";
import { CategoriaDTO } from "./categorias";

export interface DespesaDTO {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  conta?: ContaDTO;
  cartao?: CartaoDTO;
  categoria?: CategoriaDTO;
  anexo?: string;
  anexoUrl?: string;
  observacao?: string;
  // Mantendo os IDs para compatibilidade com o código existente
  categoriaId?: number;
  contaId?: number;
  cartaoId?: number;
}

export interface PageDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const DespesasService = {
  listar: async (): Promise<DespesaDTO[]> => {
    const response = await api.get("/despesas");
    return response.data;
  },

  listarPorMesAno: async (mes: number, ano: number): Promise<DespesaDTO[]> => {
    const response = await api.get(`/despesas/mes/${mes}/ano/${ano}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<DespesaDTO> => {
    const response = await api.get(`/despesas/${id}`);
    return response.data;
  },

  buscarPorDescricao: async (descricao: string, mes?: number, ano?: number, pagina: number = 0): Promise<PageDTO<DespesaDTO>> => {
    let url = `/despesas/buscar?descricao=${descricao}&pagina=${pagina}`;
    if (mes) url += `&mes=${mes}`;
    if (ano) url += `&ano=${ano}`;
    const response = await api.get(url);
    return response.data;
  },

  criar: async (despesa: DespesaDTO): Promise<DespesaDTO> => {
    const response = await api.post("/despesas", despesa);
    return response.data;
  },

  atualizar: async (id: number, despesa: DespesaDTO): Promise<DespesaDTO> => {
    const response = await api.put(`/despesas/${id}`, despesa);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/despesas/${id}`);
  },
};
