import { api } from "./api";

export enum TipoConta {
  CORRENTE = "CORRENTE",
  POUPANCA = "POUPANCA",
  INVESTIMENTO = "INVESTIMENTO",
  CARTEIRA = "CARTEIRA",
  OUTRO = "OUTRO"
}

export interface SaldoContaDTO {
  contaId: number;
  nomeConta: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  mes?: number | null;
  ano?: number | null;
}

export interface ContaDTO {
  id?: number;
  nome: string;
  tipo: TipoConta;
  imagemLogo?: number[]; // byte array
}

// Constantes para validação de imagem
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB
const TIPOS_IMAGEM_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif'];

export const ContasService = {
  listar: async (): Promise<ContaDTO[]> => {
    const response = await api.get("/contas");
    return response.data;
  },

  buscarPorId: async (id: number): Promise<ContaDTO> => {
    const response = await api.get(`/contas/${id}`);
    return response.data;
  },

  buscarSaldo: async (id: number): Promise<SaldoContaDTO> => {
    const response = await api.get(`/contas/${id}/saldo`);
    return response.data;
  },

  buscarPorNome: async (nome: string): Promise<ContaDTO[]> => {
    const response = await api.get(`/contas/buscar?nome=${nome}`);
    return response.data;
  },

  validarImagem: (imagem: File): void => {
    if (imagem.size > TAMANHO_MAXIMO_IMAGEM) {
      throw new Error(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_IMAGEM / 1024 / 1024}MB`);
    }

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(imagem.type)) {
      throw new Error(`Tipo de imagem não permitido. Use: ${TIPOS_IMAGEM_PERMITIDOS.join(', ')}`);
    }
  },

  converterImagemParaByteArray: async (imagem: File): Promise<number[]> => {
    try {
      const arrayBuffer = await imagem.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      return Array.from(bytes);
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      throw new Error('Erro ao processar a imagem. Tente novamente.');
    }
  },

  criar: async (conta: ContaDTO, imagem?: File): Promise<ContaDTO> => {
    try {
      const formData = new FormData();
      const contaParaEnviar = { ...conta };

      if (imagem) {
        ContasService.validarImagem(imagem);
        const byteArray = await ContasService.converterImagemParaByteArray(imagem);
        contaParaEnviar.imagemLogo = byteArray;
      }

      formData.append('conta', new Blob([JSON.stringify(contaParaEnviar)], { type: 'application/json' }));

      const response = await api.post("/contas", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao criar conta:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao criar conta. Verifique os dados e tente novamente.');
    }
  },

  atualizar: async (id: number, conta: ContaDTO, imagem?: File): Promise<ContaDTO> => {
    try {
      const formData = new FormData();
      const contaParaEnviar = { ...conta };

      if (imagem) {
        ContasService.validarImagem(imagem);
        const byteArray = await ContasService.converterImagemParaByteArray(imagem);
        contaParaEnviar.imagemLogo = byteArray;
      }

      formData.append('conta', new Blob([JSON.stringify(contaParaEnviar)], { type: 'application/json' }));

      const response = await api.put(`/contas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Erro ao atualizar conta:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao atualizar conta. Verifique os dados e tente novamente.');
    }
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/contas/${id}`);
  },
};
