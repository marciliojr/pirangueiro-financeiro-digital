import { api } from "./api";

export interface CategoriaDTO {
  id?: number;
  nome: string;
  cor?: string;
  imagemCategoria?: string;
  tipoReceita: boolean;
}

export const CategoriasService = {
  listar: async (): Promise<CategoriaDTO[]> => {
    const response = await api.get("/categorias");
    return response.data;
  },

  listarPorTipo: async (tipo: boolean): Promise<CategoriaDTO[]> => {
    const response = await api.get(`/categorias/tipo/${tipo}`);
    return response.data;
  },

  listarReceitas: async (): Promise<CategoriaDTO[]> => {
    const response = await api.get("/categorias/receitas");
    return response.data;
  },

  listarDespesas: async (): Promise<CategoriaDTO[]> => {
    const response = await api.get("/categorias/despesas");
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
