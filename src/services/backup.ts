import { api } from './api';
import axios from 'axios';

// Instância separada para uploads (sem interceptor de erro)
const uploadApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

interface AxiosErrorType {
  message: string;
  response?: {
    data?: {
      erro?: string;
      mensagem?: string;
    };
    status: number;
    statusText: string;
  };
  request?: unknown;
  config?: {
    url?: string;
    method?: string;
    timeout?: number;
  };
  code?: string;
}

export interface StatusBackup {
  status: string;
  servicoAtivo: boolean;
  versaoServico: string;
  totalRegistrosDisponiveis: number;
  dataVerificacao: string;
  funcionalidades: {
    exportacao: string;
    importacaoAssincrona: string;
    notificacaoEmail: string;
    acompanhamentoStatus: string;
  };
}

export interface InfoBackup {
  dataGeracao: string;
  versao: string;
  sistemaVersao: string;
  totalRegistros: number;
  estatisticas: {
    usuarios: number;
    categorias: number;
    contas: number;
    cartoes: number;
    pensamentos: number;
    limitesGastos: number;
    graficos: number;
    execucoesTarefas: number;
    despesas: number;
    receitas: number;
    notificacoes: number;
    historicos: number;
  };
}

export interface InicioImportacao {
  sucesso: boolean;
  mensagem: string;
  requestId: string;
  status: string;
  dataInicio: string;
  nomeArquivo: string;
  urlStatus: string;
}

export interface StatusImportacao {
  encontrado: boolean;
  requestId: string;
  status: 'INICIADO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';
  mensagem: string;
  dataInicio: string;
  dataFinalizacao?: string;
  nomeArquivo: string;
  totalRegistros?: number;
  versaoBackup?: string;
  tempoProcessamento?: string;
  tempoDecorrido?: string;
  erro?: string;
}

export interface HistoricoImportacao {
  importacoesRecentes: StatusImportacao[];
  dataConsulta: string;
}

export interface RespostaLimpeza {
  sucesso: boolean;
  mensagem: string;
  dataLimpeza: string;
  erro?: string;
}

export const BackupService = {
  // 1. Status do Sistema
  async obterStatus(): Promise<StatusBackup> {
    try {
      const response = await api.get('/backup/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status do backup:', error);
      throw new Error('Erro ao obter status do backup');
    }
  },

  // 2. Exportar Backup (download direto)
  async exportarBackup(): Promise<Blob> {
    try {
      const response = await uploadApi.get('/backup/export', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw new Error('Erro ao exportar backup');
    }
  },

  // 3. Obter informações do backup (sem download)
  async obterInfoBackup(): Promise<InfoBackup> {
    try {
      const response = await api.get('/backup/info');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações do backup:', error);
      throw new Error('Erro ao obter informações do backup');
    }
  },

  // 4. Iniciar Importação (Assíncrona)
  async iniciarImportacao(arquivo: File): Promise<InicioImportacao> {
    try {
      // Validações no frontend antes de enviar
      if (!arquivo) {
        throw new Error('Arquivo não selecionado');
      }
      
      if (!arquivo.name.toLowerCase().endsWith('.json')) {
        throw new Error('Arquivo deve ter extensão .json');
      }
      
      if (arquivo.size === 0) {
        throw new Error('Arquivo está vazio');
      }
      
      if (arquivo.size > 50 * 1024 * 1024) { // 50MB
        throw new Error('Arquivo muito grande (máximo 50MB)');
      }
      
      console.log('Iniciando upload do arquivo:', {
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type
      });
      
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      
      const response = await uploadApi.post('/backup/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000, // 2 minutos de timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
      
      console.log('Resposta do servidor:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorType;
      console.error('Erro detalhado ao iniciar importação:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          timeout: axiosError.config?.timeout
        }
      });
      
      // Tratamento específico de erros
      if (axiosError.response) {
        // Erro de resposta do servidor
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        
        if (status === 413) {
          throw new Error('Arquivo muito grande para upload');
        } else if (status === 415) {
          throw new Error('Tipo de arquivo não suportado');
        } else if (status === 400) {
          throw new Error(data?.erro || data?.mensagem || 'Dados inválidos');
        } else if (status === 500) {
          throw new Error(data?.erro || 'Erro interno do servidor durante o processamento');
        } else {
          throw new Error(data?.erro || data?.mensagem || `Erro ${status}: ${axiosError.response.statusText}`);
        }
      } else if (axiosError.request) {
        // Erro de rede
        throw new Error('Erro de conexão com o servidor. Verifique sua internet.');
      } else if (axiosError.code === 'ECONNABORTED') {
        // Timeout
        throw new Error('Timeout: Upload demorou muito para ser processado');
      } else {
        // Erro desconhecido
        throw new Error(axiosError.message || 'Erro desconhecido ao iniciar importação');
      }
    }
  },

  // 5. Verificar Status da Importação
  async verificarStatusImportacao(requestId: string): Promise<StatusImportacao> {
    try {
      const response = await api.get(`/backup/import/status/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status da importação:', error);
      throw new Error('Erro ao verificar status da importação');
    }
  },

  // 6. Obter Histórico de Importações Recentes
  async obterHistoricoRecente(): Promise<HistoricoImportacao> {
    try {
      const response = await api.get('/backup/import/history');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw new Error('Erro ao obter histórico');
    }
  },

  // 7. Obter Todas as Importações
  async obterTodasImportacoes(): Promise<HistoricoImportacao> {
    try {
      const response = await api.get('/backup/import/history/all');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter todas as importações:', error);
      throw new Error('Erro ao obter todas as importações');
    }
  },

  // 8. Limpar Status Antigos
  async limparStatusAntigos(): Promise<RespostaLimpeza> {
    try {
      const response = await api.delete('/backup/import/cleanup');
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar status antigos:', error);
      throw new Error('Erro ao limpar status antigos');
    }
  },

  // 9. Limpar Todos os Dados do Sistema
  async limparSistema(): Promise<RespostaLimpeza> {
    try {
      const response = await api.delete('/backup/clear');
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar sistema:', error);
      throw new Error('Erro ao limpar sistema');
    }
  }
}; 