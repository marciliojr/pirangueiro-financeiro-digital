import { api } from './api';

export interface StatusBackup {
  totalRegistros: number;
  status: string;
  servicoAtivo: boolean;
}

export interface InfoBackup {
  totalRegistros: number;
  dataRestauracao: string;
}

export interface RespostaLimpeza {
  mensagem: string;
  sucesso: boolean;
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
      const response = await api.get('/backup/export', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw new Error('Erro ao exportar backup');
    }
  },

  // 3. Obter informações do backup (sem download)
  async obterInfoBackup(): Promise<StatusBackup> {
    try {
      const response = await api.get('/backup/info');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações do backup:', error);
      throw new Error('Erro ao obter informações do backup');
    }
  },

  // 4. Importar Backup
  async importarBackup(arquivo: File): Promise<InfoBackup> {
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      
      const response = await api.post('/backup/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw new Error('Erro ao importar backup');
    }
  },

  // 5. Limpar Dados do Backup
  async limparDados(): Promise<RespostaLimpeza> {
    try {
      const response = await api.delete('/backup/clear');
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar dados do backup:', error);
      throw new Error('Erro ao limpar dados do backup');
    }
  }
}; 