import { api } from './api';

export const AdminService = {
  async limparBaseDados(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete('admin/limpar-base-dados', {
        params: {
          confirmacao: 'CONFIRMAR_LIMPEZA'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar base de dados:', error);
      throw new Error('Erro ao limpar base de dados');
    }
  }
}; 