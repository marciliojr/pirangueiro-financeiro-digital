import { api } from "./api";

export enum TipoCategoria {
  RECEITA = "RECEITA",
  DESPESA = "DESPESA"
}

export interface CategoriaDTO {
  id?: number;
  nome: string;
  tipo: TipoCategoria;
  cor?: string;
  imagemCategoria?: string;
}

export const CategoriasService = {
  listar: async (): Promise<CategoriaDTO[]> => {
    const response = await api.get("/categorias");
    return response.data;
  },

  listarPorTipo: async (tipo: TipoCategoria): Promise<CategoriaDTO[]> => {
    const response = await api.get(`/categorias/tipo/${tipo}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<CategoriaDTO> => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  buscarPorNome: async (nome: string): Promise<CategoriaDTO[]> => {
    const response = await api.get(`/categorias/buscar?nome=${nome}`);
    return response.data;
  },

  criar: async (categoria: CategoriaDTO): Promise<CategoriaDTO> => {
    const response = await api.post("/categorias", categoria);
    return response.data;
  },

  atualizar: async (id: number, categoria: CategoriaDTO): Promise<CategoriaDTO> => {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};
