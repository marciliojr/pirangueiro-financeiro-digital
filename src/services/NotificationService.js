import axios from 'axios';

const API_URL = '/api';

export const NotificationService = {
  async getNotificacoes(usuarioId) {
    try {
      const response = await axios.get(`${API_URL}/notificacoes/nao-lidas`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async marcarComoLida(id) {
    try {
      await axios.patch(`${API_URL}/notificacoes/${id}/marcar-como-lida`);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default NotificationService; 
