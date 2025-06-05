import { api } from "./api";
import { UsuariosService } from "./usuarios";

export enum TipoConta {
  CORRENTE = "CORRENTE",
  SALARIO = "SALARIO",
  DIGITAL = "DIGITAL",
  POUPANCA = "POUPANCA",
  INVESTIMENTO = "INVESTIMENTO",
  CARTEIRA = "CARTEIRA",
  OUTRO = "OUTRO"
}

export interface UsuarioDTO {
  id?: number;
  nome: string;
  senha: string;
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
  usuario?: UsuarioDTO;
}

// Constantes para validação de imagem
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5MB
const TIPOS_IMAGEM_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif'];

export const ContasService = {
  listar: async (): Promise<ContaDTO[]> => {
    const usuario = await UsuariosService.obterUsuarioAtual();
    const response = await api.get(`/contas/usuario/${usuario.id}`);
    
    // Debug information processed silently
    
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

  criar: async (conta: ContaDTO): Promise<ContaDTO> => {
    const usuario = await UsuariosService.obterUsuarioAtual();
    const contaComUsuario = { ...conta, usuario: { id: usuario.id } };
    const response = await api.post('/contas', contaComUsuario);
    return response.data;
  },

  atualizar: async (id: number, conta: ContaDTO): Promise<ContaDTO> => {
    const usuario = await UsuariosService.obterUsuarioAtual();
    const contaComUsuario = { ...conta, usuario: { id: usuario.id } };
    const response = await api.put(`/contas/${id}`, contaComUsuario);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/contas/${id}`);
  },
};
