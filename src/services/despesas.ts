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
  anexo?: number[]; // byte[] do backend será convertido para number[]
  anexoUrl?: string; // Mantendo para compatibilidade com exibição
  observacao?: string;
  // Mantendo os IDs para compatibilidade com o código existente
  categoriaId?: number;
  contaId?: number;
  cartaoId?: number;
  quantidadeParcelas?: number;
  numeroParcela?: number;
  totalParcelas?: number;
  pago?: boolean;
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

  buscarSemPaginar: async (descricao?: string, mes?: number, ano?: number): Promise<DespesaDTO[]> => {
    const url = '/despesas/buscar/sempaginar?';
    const params = new URLSearchParams();
    if (descricao) params.append('descricao', descricao);
    if (mes) params.append('mes', mes.toString());
    if (ano) params.append('ano', ano.toString());
    const response = await api.get(`${url}${params.toString()}`);
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

  buscarTotal: async (): Promise<number> => {
    const response = await api.get("/despesas/total");
    return response.data;
  },
};
