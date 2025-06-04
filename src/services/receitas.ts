import { api } from "./api";
import { ContaDTO } from "./contas";
import { CategoriaDTO } from "./categorias";

export interface ReceitaDTO {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  conta?: ContaDTO;
  categoria?: CategoriaDTO;
  anexo?: number[]; // byte[] do backend será convertido para number[]
  anexoUrl?: string; // Mantendo para compatibilidade com exibição
  observacao?: string;
  // Mantendo os IDs para compatibilidade com o código existente
  categoriaId?: number;
  contaId?: number;
}

// Função utilitária para converter File para byte array
export const converterArquivoParaByteArray = async (file: File): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const arrayBuffer = reader.result as ArrayBuffer;
        const byteArray = Array.from(new Uint8Array(arrayBuffer));
        resolve(byteArray);
      } else {
        reject(new Error('Falha ao ler o arquivo'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export interface FiltrosReceita {
  descricao?: string;
  mes?: number;
  ano?: number;
  pagina?: number;
  tamanhoPagina?: number;
  ordenacao?: string;
  direcao?: 'ASC' | 'DESC';
}

export const ReceitasService = {
  listar: async (): Promise<ReceitaDTO[]> => {
    const response = await api.get("/receitas");
    return response.data;
  },

  listarPorMesAno: async (mes: number, ano: number): Promise<ReceitaDTO[]> => {
    const response = await api.get(`/receitas/mes/${mes}/ano/${ano}`);
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

  buscarComFiltros: async (filtros: FiltrosReceita): Promise<{ content: ReceitaDTO[], totalElements: number }> => {
    const params = new URLSearchParams();
    if (filtros.descricao) params.append('descricao', filtros.descricao);
    if (filtros.mes) params.append('mes', filtros.mes.toString());
    if (filtros.ano) params.append('ano', filtros.ano.toString());
    if (filtros.pagina !== undefined) params.append('pagina', filtros.pagina.toString());
    if (filtros.tamanhoPagina) params.append('tamanhoPagina', filtros.tamanhoPagina.toString());
    if (filtros.ordenacao) params.append('ordenacao', filtros.ordenacao);
    if (filtros.direcao) params.append('direcao', filtros.direcao);

    const response = await api.get(`/receitas/filtros?${params.toString()}`);
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

  buscarTotal: async (): Promise<number> => {
    const response = await api.get("/receitas/total");
    return response.data;
  },
};
