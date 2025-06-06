import axios from 'axios';

interface Notificacao {
  id: number;
  mensagem: string;
  data: string;
}

// Configurar base URL baseada no ambiente
const getBaseURL = () => {
  // No Docker (produção), sempre usar URL relativa para aproveitar o proxy do nginx
  // Em desenvolvimento local, usar URL absoluta para o backend
  if (import.meta.env.PROD || window.location.port === '8082') {
    return "/api";
  }
  // Se for desenvolvimento, usar URL absoluta para o backend
  return import.meta.env.VITE_API_URL || "http://localhost:8080/api";
};

const API_URL = getBaseURL();

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
