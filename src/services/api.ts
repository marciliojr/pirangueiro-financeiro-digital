
import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ocorreu um erro ao processar a requisição';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export function formatarMesAno(mes: number, ano: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${meses[mes - 1]} de ${ano}`;
}

// Helper para upload de arquivos
export const uploadArquivo = async (file: File): Promise<string> => {
  // Simula um upload de arquivo
  // Em um ambiente real, você enviaria para um endpoint da API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://exemplo.com/arquivos/${file.name}`);
    }, 1000);
  });
};
