import { api } from './api';

export const obterMensagemDia = async (): Promise<string> => {
  try {
    const response = await api.get('/pensamentos/obter-mensagem-dia');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 
