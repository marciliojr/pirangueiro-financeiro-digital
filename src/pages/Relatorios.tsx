import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  CreditCard,
  PieChart,
  Building2,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarIcon,
  Filter,
  RefreshCw
} from 'lucide-react';
import { relatoriosService, RelatorioGerencial } from '@/services/relatorios';
import { formatarMoeda } from '@/services/api';
import { cn } from '@/lib/utils';
import { logger, LogModules, LogActions } from "@/utils/logger";

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState<RelatorioGerencial | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const componentePdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logger.info(LogModules.RELATORIOS, LogActions.PAGE_LOAD);
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      
      // Formatar datas se existirem
      const dataInicioFormatada = dataInicio ? format(dataInicio, 'yyyy-MM-dd') : undefined;
      const dataFimFormatada = dataFim ? format(dataFim, 'yyyy-MM-dd') : undefined;
      
      logger.info(LogModules.RELATORIOS, LogActions.LOAD, { 
        dataInicio: dataInicioFormatada, 
        dataFim: dataFimFormatada 
      });
      
      const data = await relatoriosService.gerarRelatorioGerencial(dataInicioFormatada, dataFimFormatada);
      setRelatorio(data);
      logger.info(LogModules.RELATORIOS, LogActions.LOAD_SUCCESS);
    } catch (error) {
      logger.error(LogModules.RELATORIOS, LogActions.LOAD_ERROR, { error });
      toast.error('Erro ao carregar relatório gerencial');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltrosDatas = () => {
    logger.info(LogModules.RELATORIOS, LogActions.FILTER_APPLY, { 
      dataInicio, 
      dataFim 
    });
    carregarRelatorio();
  };

  const limparFiltros = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    logger.info(LogModules.RELATORIOS, 'filtros limpos');
    // Recarregar automaticamente após limpar
    setTimeout(() => {
      carregarRelatorio();
    }, 100);
  };

  const filtroRapido = (tipo: 'mes' | 'trimestre' | 'semestre' | 'ano') => {
    logger.info(LogModules.RELATORIOS, 'filtro rápido aplicado', { tipo });
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    switch (tipo) {
      case 'mes': {
        setDataInicio(new Date(ano, mes, 1));
        setDataFim(new Date(ano, mes + 1, 0));
        break;
      }
      case 'trimestre': {
        const trimestreAtual = Math.floor(mes / 3);
        const mesInicioTrimestre = trimestreAtual * 3;
        setDataInicio(new Date(ano, mesInicioTrimestre, 1));
        setDataFim(new Date(ano, mesInicioTrimestre + 3, 0));
        break;
      }
      case 'semestre': {
        const semestreAtual = Math.floor(mes / 6);
        const mesInicioSemestre = semestreAtual * 6;
        setDataInicio(new Date(ano, mesInicioSemestre, 1));
        setDataFim(new Date(ano, mesInicioSemestre + 6, 0));
        break;
      }
      case 'ano': {
        setDataInicio(new Date(ano, 0, 1));
        setDataFim(new Date(ano, 11, 31));
        break;
      }
    }
    
    // Aplicar filtro automaticamente após definir datas
    setTimeout(() => {
      carregarRelatorio();
    }, 100);
  };

  const handleImprimirPdf = useReactToPrint({
    contentRef: componentePdfRef,
    documentTitle: `Relatório Gerencial - ${new Date().toLocaleDateString('pt-BR')}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .no-print {
          display: none !important;
        }
        
        .print-break {
          page-break-before: always;
        }
        
        .print-avoid-break {
          page-break-inside: avoid;
        }
        
        h1, h2, h3 {
          page-break-after: avoid;
        }
        
        .card {
          box-shadow: none !important;
          border: 1px solid #e5e7eb !important;
          margin-bottom: 20px !important;
        }
        
        .bg-green-50, .bg-red-50, .bg-blue-50, .bg-orange-50, .bg-purple-50 {
          background-color: #f9fafb !important;
        }
        
        .text-green-700, .text-red-700, .text-blue-700, .text-orange-700, .text-purple-700 {
          color: #374151 !important;
          font-weight: 600;
        }
      }
    `
  });

  const exportarRelatorioPdf = () => {
    if (!relatorio) {
      toast.error('Nenhum relatório disponível para exportar');
      return;
    }
    
    setExportandoPdf(true);
    logger.info(LogModules.RELATORIOS, LogActions.GENERATE_PDF);
    
    try {
      handleImprimirPdf();
      // Aguarda um momento para a impressão processar
      setTimeout(() => {
        setExportandoPdf(false);
        toast.success('Relatório PDF gerado com sucesso!');
        logger.info(LogModules.RELATORIOS, 'PDF gerado com sucesso');
      }, 1000);
    } catch (error) {
      setExportandoPdf(false);
      logger.error(LogModules.RELATORIOS, LogActions.EXPORT_ERROR, { error });
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'POSITIVO':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'NEGATIVO':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CRITICA':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'ATENCAO':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'SAUDAVEL':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUtilizacaoColor = (percentual: number) => {
    if (percentual <= 30) return 'bg-green-500';
    if (percentual <= 60) return 'bg-yellow-500';
    if (percentual <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Não foi possível carregar o relatório.</p>
        <Button onClick={carregarRelatorio} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho e Filtros - Apenas para tela */}
      <div className="no-print space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {relatorio.cabecalho.icone} {relatorio.cabecalho.titulo}
            </h1>
            <p className="text-muted-foreground">{relatorio.cabecalho.subtitulo}</p>
            <p className="text-sm text-muted-foreground">
              Gerado em: {new Date(relatorio.cabecalho.dataGeracao).toLocaleString('pt-BR')}
              {(dataInicio || dataFim) && (
                <span className="ml-2 text-blue-600">
                  | Período: {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Início'} 
                  {' até '}
                  {dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filtros de Data */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros de Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletores de Data */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">De:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Até:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={aplicarFiltrosDatas} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Aplicar Filtro
              </Button>

              <Button variant="outline" onClick={limparFiltros} disabled={loading}>
                Limpar Filtros
              </Button>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium self-center">Filtros rápidos:</span>
              <Button variant="outline" size="sm" onClick={() => filtroRapido('mes')}>
                Este Mês
              </Button>
              <Button variant="outline" size="sm" onClick={() => filtroRapido('trimestre')}>
                Este Trimestre
              </Button>
              <Button variant="outline" size="sm" onClick={() => filtroRapido('semestre')}>
                Este Semestre
              </Button>
              <Button variant="outline" size="sm" onClick={() => filtroRapido('ano')}>
                Este Ano
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button onClick={carregarRelatorio} variant="outline" disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button onClick={exportarRelatorioPdf} disabled={exportandoPdf || loading}>
            <Download className="h-4 w-4 mr-2" />
            {exportandoPdf ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Conteúdo para impressão */}
      <div ref={componentePdfRef} className="space-y-6">
        
        {/* Cabeçalho - Apenas para PDF */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            📊 RELATÓRIO GERENCIAL FINANCEIRO
          </h1>
          <p className="text-lg mb-2">Análise Completa das Finanças Pessoais</p>
          <p className="text-sm">
            Gerado em: {new Date(relatorio.cabecalho.dataGeracao).toLocaleString('pt-BR')}
          </p>
          <hr className="my-4" />
        </div>

        {/* Resumo Executivo */}
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-background print-avoid-break">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              📈 {relatorio.resumoExecutivo.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {relatorio.resumoExecutivo.saldoGeral.icone}
                  <span className="text-2xl font-bold" style={{ color: relatorio.resumoExecutivo.saldoGeral.cor }}>
                    {relatorio.resumoExecutivo.saldoGeral.formatado}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Saldo Geral</p>
                <Badge variant={relatorio.resumoExecutivo.saldoGeral.status === 'POSITIVO' ? 'default' : 'destructive'}>
                  {relatorio.resumoExecutivo.saldoGeral.status}
                </Badge>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIcon(relatorio.resumoExecutivo.situacaoFinanceira.situacao)}
                  <span className="font-semibold" style={{ color: relatorio.resumoExecutivo.situacaoFinanceira.cor }}>
                    {relatorio.resumoExecutivo.situacaoFinanceira.situacao}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Situação Financeira</p>
                <p className="text-xs mt-1">{relatorio.resumoExecutivo.situacaoFinanceira.mensagem}</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="text-2xl font-bold text-primary">
                    {relatorio.resumoExecutivo.percentualEconomia.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Taxa de Economia</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">💡 Recomendações:</h4>
              <p className="text-sm">{relatorio.resumoExecutivo.recomendacoes}</p>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Seções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Receitas */}
          <Card className="border-l-4 border-l-green-500 print-avoid-break">
            <CardHeader className="bg-green-50 dark:bg-green-950/20">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                {relatorio.receitas.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatarMoeda(relatorio.receitas.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantidade</span>
                  <span className="font-semibold">{relatorio.receitas.quantidade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Médio</span>
                  <span className="font-semibold">{formatarMoeda(relatorio.receitas.valorMedio)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="border-l-4 border-l-red-500 print-avoid-break">
            <CardHeader className="bg-red-50 dark:bg-red-950/20">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
                {relatorio.despesas.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatarMoeda(relatorio.despesas.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantidade</span>
                  <span className="font-semibold">{relatorio.despesas.quantidade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Médio</span>
                  <span className="font-semibold">{formatarMoeda(relatorio.despesas.valorMedio)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contas Bancárias */}
          <Card className="border-l-4 border-l-blue-500 print-avoid-break">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
                {relatorio.contasBancarias.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saldo Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatarMoeda(relatorio.contasBancarias.saldoTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Receitas</span>
                  <span className="font-semibold text-green-600">
                    {formatarMoeda(relatorio.contasBancarias.totalReceitas)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Despesas</span>
                  <span className="font-semibold text-red-600">
                    {formatarMoeda(relatorio.contasBancarias.totalDespesas)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Detalhes das Contas:</h4>
                {relatorio.contasBancarias.detalhesContas.map((conta, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">{conta.nome}</p>
                      <p className="text-xs text-muted-foreground">{conta.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: conta.saldo.cor }}>
                        {conta.saldo.formatado}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {conta.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cartões de Crédito */}
          <Card className="border-l-4 border-l-orange-500 print-avoid-break">
            <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <CreditCard className="h-5 w-5" />
                {relatorio.cartoesCredito.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limite Total</span>
                  <span className="text-xl font-bold">
                    {formatarMoeda(relatorio.cartoesCredito.limiteTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limite Usado</span>
                  <span className="font-semibold text-orange-600">
                    {formatarMoeda(relatorio.cartoesCredito.limiteUsado)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Disponível</span>
                  <span className="font-semibold text-green-600">
                    {formatarMoeda(relatorio.cartoesCredito.limiteDisponivel)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização Geral</span>
                  <span className="font-semibold">{relatorio.cartoesCredito.percentualUtilizacao.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={relatorio.cartoesCredito.percentualUtilizacao} 
                  className="h-2"
                />
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Detalhes dos Cartões:</h4>
                {relatorio.cartoesCredito.detalhesCartoes.map((cartao, index: number) => (
                  <div key={index} className="p-2 bg-muted rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{cartao.nome}</p>
                      <div className="flex items-center gap-2">
                        {cartao.statusUtilizacao.icone}
                        <Badge 
                          variant="outline" 
                          style={{ color: cartao.statusUtilizacao.cor }}
                          className="text-xs"
                        >
                          {cartao.statusUtilizacao.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{formatarMoeda(cartao.usado)} / {formatarMoeda(cartao.limite)}</span>
                      <span className="font-semibold">{cartao.percentualUsado.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={cartao.percentualUsado} 
                      className={`h-1 ${getUtilizacaoColor(cartao.percentualUsado)}`}
                    />
                    {cartao.despesasPendentes > 0 && (
                      <p className="text-xs text-yellow-600">
                        {cartao.despesasPendentes} despesa(s) pendente(s)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise por Categorias */}
        <Card className="border-l-4 border-l-purple-500 print-break print-avoid-break">
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <PieChart className="h-5 w-5" />
              {relatorio.analiseCategoria.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categorias de Despesas */}
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Maiores Categorias de Despesas</h4>
                <div className="space-y-2">
                  {relatorio.analiseCategoria.categoriaDespesas
                    .sort((a, b) => b.valor - a.valor)
                    .slice(0, 5)
                    .map((categoria, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoria.corCategoria }}
                          />
                          <span className="text-sm font-medium">{categoria.nomeCategoria}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatarMoeda(categoria.valor)}</p>
                          <p className="text-xs text-muted-foreground">{categoria.percentual.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Categorias de Receitas */}
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Maiores Categorias de Receitas</h4>
                <div className="space-y-2">
                  {relatorio.analiseCategoria.categoriaReceitas
                    .sort((a, b) => b.valor - a.valor)
                    .slice(0, 5)
                    .map((categoria, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoria.corCategoria }}
                          />
                          <span className="text-sm font-medium">{categoria.nomeCategoria}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatarMoeda(categoria.valor)}</p>
                          <p className="text-xs text-muted-foreground">{categoria.percentual.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Destaque para maiores categorias */}
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatorio.analiseCategoria.categoriaMaiorDespesa && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                  <h5 className="font-semibold text-sm text-red-700 mb-1">🔥 Maior Categoria de Despesa</h5>
                  <p className="font-medium">{relatorio.analiseCategoria.categoriaMaiorDespesa.nomeCategoria}</p>
                  <p className="text-sm text-red-600 font-semibold">
                    {formatarMoeda(relatorio.analiseCategoria.categoriaMaiorDespesa.valor)} 
                    ({relatorio.analiseCategoria.categoriaMaiorDespesa.percentual.toFixed(1)}%)
                  </p>
                </div>
              )}
              
              {relatorio.analiseCategoria.categoriaMaiorReceita && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-sm text-green-700 mb-1">⭐ Maior Categoria de Receita</h5>
                  <p className="font-medium">{relatorio.analiseCategoria.categoriaMaiorReceita.nomeCategoria}</p>
                  <p className="text-sm text-green-600 font-semibold">
                    {formatarMoeda(relatorio.analiseCategoria.categoriaMaiorReceita.valor)} 
                    ({relatorio.analiseCategoria.categoriaMaiorReceita.percentual.toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Relatório gerado automaticamente • {relatorio.metadados.totalSecoes} seções</span>
              <span>Versão {relatorio.cabecalho.versao} • © 2025 Pirangueiro Financeiro</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 