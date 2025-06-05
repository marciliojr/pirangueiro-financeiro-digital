import axios from 'axios';

interface Notificacao {
  id: number;
  mensagem: string;
  data: string;
}

const API_URL = '/api';

export const NotificationService = {
  async getNotificacoes(): Promise<Notificacao[]> {
    try {
      const response = await axios.get<Notificacao[]>(`${API_URL}/notificacoes/nao-lidas`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async marcarComoLida(id: number): Promise<boolean> {
    try {
      await axios.patch(`${API_URL}/notificacoes/${id}/marcar-como-lida`);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default NotificationService; 
