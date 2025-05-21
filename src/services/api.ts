import axios from "axios";
import { toast } from "sonner";

interface ErroResponse {
  mensagem: string;
  codigo: string;
  detalhe: string;
  timestamp: string;
}

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
    const erroResponse = error.response?.data as ErroResponse;
    
    let mensagemErro = 'Ocorreu um erro ao processar a requisição';
    
    if (erroResponse) {
      mensagemErro = `${erroResponse.mensagem}`;
      
      if (erroResponse.detalhe) {
        mensagemErro += `\n: ${erroResponse.detalhe}`;
      }
      
    }

    toast.error(mensagemErro, {
      duration: 10000,
      style: {
        color: '#ff0000',
        fontWeight: 'bold',
        backgroundColor: '#ffebeb',
        border: '1px solid #ff0000',
      },
    });
    
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

export function formatarValorMonetario(valor: string): string {
  // Remove tudo que não for número
  const numero = valor.replace(/\D/g, '');
  
  // Converte para número sem dividir por 100
  const valorNumerico = Number(numero);
  
  // Formata o número para o padrão brasileiro
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorNumerico);
}
