import { api } from './api';

interface DetalheItem {
  [key: string]: unknown;
}

interface ContaDetalhada {
  nome: string;
  tipo: string;
  saldo: {
    valor: number;
    formatado: string;
    status: string;
    cor: string;
    icone: string;
  };
  receitas: number;
  despesas: number;
  status: string;
}

interface CartaoDetalhado {
  nome: string;
  limite: number;
  usado: number;
  disponivel: number;
  percentualUsado: number;
  statusUtilizacao: {
    status: string;
    cor: string;
    icone: string;
  };
  despesasPendentes: number;
}

interface CategoriaAnalise {
  categoriaId: number;
  nomeCategoria: string;
  corCategoria: string;
  valor: number;
  percentual: number;
  quantidade: number;
  valorMedio: number;
  tipoReceita: boolean;
}

interface IndicadoresChave {
  [key: string]: number | string;
}

interface EstilosTemasCSS {
  [key: string]: string;
}

export interface RelatorioGerencial {
  cabecalho: {
    titulo: string;
    subtitulo: string;
    dataGeracao: string;
    versao: string;
    icone: string;
  };
  resumoExecutivo: {
    titulo: string;
    saldoGeral: {
      valor: number;
      formatado: string;
      status: string;
      cor: string;
      icone: string;
    };
    situacaoFinanceira: {
      situacao: string;
      cor: string;
      icone: string;
      mensagem: string;
    };
    percentualEconomia: number;
    recomendacoes: string;
    estilo: string;
  };
  receitas: {
    titulo: string;
    cor: string;
    icone: string;
    total: number;
    quantidade: number;
    valorMedio: number;
    detalhes: DetalheItem[];
    estilo: string;
  };
  despesas: {
    titulo: string;
    cor: string;
    icone: string;
    total: number;
    quantidade: number;
    valorMedio: number;
    detalhes: DetalheItem[];
    estilo: string;
  };
  contasBancarias: {
    titulo: string;
    cor: string;
    icone: string;
    saldoTotal: number;
    totalReceitas: number;
    totalDespesas: number;
    detalhesContas: ContaDetalhada[];
    estilo: string;
  };
  cartoesCredito: {
    titulo: string;
    cor: string;
    icone: string;
    limiteTotal: number;
    limiteUsado: number;
    limiteDisponivel: number;
    percentualUtilizacao: number;
    detalhesCartoes: CartaoDetalhado[];
    estilo: string;
  };
  analiseCategoria: {
    titulo: string;
    cor: string;
    icone: string;
    categoriaDespesas: CategoriaAnalise[];
    categoriaReceitas: CategoriaAnalise[];
    categoriaMaiorDespesa: CategoriaAnalise | null;
    categoriaMaiorReceita: CategoriaAnalise | null;
    estilo: string;
  };
  indicadoresChave: IndicadoresChave;
  metadados: {
    totalSecoes: number;
    formatoSugerido: string;
    exportacaoDisponivel: boolean;
    estilosTema: EstilosTemasCSS;
  };
}

interface ResumoExecutivoResponse {
  timestamp: string;
  resumoExecutivo: {
    saldoGeral: number;
    situacaoFinanceira: string;
    receitaTotal: number;
    despesaTotal: number;
    percentualEconomia: number;
    recomendacoes: string;
    indicadoresChave: IndicadoresChave;
  };
  indicadoresPrincipais: IndicadoresChave;
}

export const relatoriosService = {
  async gerarRelatorioGerencial(dataInicio?: string, dataFim?: string): Promise<RelatorioGerencial> {
    const params: { dataInicio?: string; dataFim?: string } = {};
    
    if (dataInicio) {
      params.dataInicio = dataInicio;
    }
    
    if (dataFim) {
      params.dataFim = dataFim;
    }
    
    const response = await api.get('/relatorios/gerencial', {
      params
    });
    return response.data;
  },

  async exportarRelatorioJson(dataInicio?: string, dataFim?: string): Promise<Blob> {
    const params: { dataInicio?: string; dataFim?: string } = {};
    
    if (dataInicio) {
      params.dataInicio = dataInicio;
    }
    
    if (dataFim) {
      params.dataFim = dataFim;
    }
    
    const response = await api.get('/relatorios/gerencial/export/json', {
      responseType: 'blob',
      params
    });
    return response.data;
  },

  async gerarResumoExecutivo(dataInicio?: string, dataFim?: string): Promise<ResumoExecutivoResponse> {
    const params: { dataInicio?: string; dataFim?: string } = {};
    
    if (dataInicio) {
      params.dataInicio = dataInicio;
    }
    
    if (dataFim) {
      params.dataFim = dataFim;
    }
    
    const response = await api.get('/relatorios/gerencial/resumo', {
      params
    });
    return response.data;
  }
}; 