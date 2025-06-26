import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, CreditCard, TrendingUpIcon, BarChart3 } from "lucide-react";
import { formatarMoeda } from "@/services/api";
import { ReceitasService } from "@/services/receitas";
import { DespesasService } from "@/services/despesas";
import { GraficosService } from "@/services/graficos";
import { logger, LogModules, LogActions } from "@/utils/logger";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";
import { GraficoReceitasDespesas } from "@/components/dashboard/GraficoReceitasDespesas";
import { GraficoReceitasDespesasMensal } from "@/components/dashboard/GraficoReceitasDespesasMensal";
import GraficoSaudeFinanceira from "@/components/dashboard/GraficoSaudeFinanceira";
import { GraficoDespesasCartao } from "@/components/dashboard/GraficoDespesasCartao";
import { GraficoSazonalidadeGastos } from "@/components/dashboard/GraficoSazonalidadeGastos";
import { GraficoTendenciaGastos } from "@/components/dashboard/GraficoTendenciaGastos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  
  const [mes, setMes] = useState<number>(mesAtual);
  const [ano, setAno] = useState<number>(anoAtual);
  const [mesesAtrasCartao, setMesesAtrasCartao] = useState<number>(12);
  const [tabAtiva, setTabAtiva] = useState<string>("receitas-despesas-mensal");

  // Lista de meses
  const meses = [
    { valor: 1, nome: "Janeiro" },
    { valor: 2, nome: "Fevereiro" },
    { valor: 3, nome: "Março" },
    { valor: 4, nome: "Abril" },
    { valor: 5, nome: "Maio" },
    { valor: 6, nome: "Junho" },
    { valor: 7, nome: "Julho" },
    { valor: 8, nome: "Agosto" },
    { valor: 9, nome: "Setembro" },
    { valor: 10, nome: "Outubro" },
    { valor: 11, nome: "Novembro" },
    { valor: 12, nome: "Dezembro" },
  ];

  // Lista de anos (5 anos para trás e 5 para frente)
  const anos = Array.from({ length: 11 }, (_, i) => anoAtual - 5 + i);

  const { data: receitas = [], isLoading: isLoadingReceitas } = useQuery({
    queryKey: ["receitas", mes, ano],
    queryFn: () => ReceitasService.listarPorMesAno(mes, ano),
  });

  const { data: despesas = [], isLoading: isLoadingDespesas } = useQuery({
    queryKey: ["despesas", mes, ano],
    queryFn: () => DespesasService.listarPorMesAno(mes, ano),
  });

  const { data: dadosGrafico, isLoading: isLoadingGrafico } = useQuery({
    queryKey: ["grafico-receitas-despesas-categoria", mes, ano],
    queryFn: () => GraficosService.buscarReceitasDespesas(mes, ano),
  });

  const { data: dadosSaudeFinanceira, isLoading: isLoadingSaudeFinanceira } = useQuery({
    queryKey: ["dashboard-financeiro", mes, ano],
    queryFn: () => GraficosService.buscarDashboardFinanceiro(mes, ano),
  });

  const { data: dadosDespesasCartao, isLoading: isLoadingDespesasCartao } = useQuery({
    queryKey: ["grafico-despesas-cartao", mesesAtrasCartao],
    queryFn: () => GraficosService.buscarDespesasPorCartao(mesesAtrasCartao),
  });

  const { data: dadosSazonalidade, isLoading: isLoadingSazonalidade } = useQuery({
    queryKey: ["grafico-sazonalidade-gastos"],
    queryFn: () => GraficosService.buscarSazonalidadeGastos(),
  });

  const { data: dadosTendenciaGastos, isLoading: isLoadingTendenciaGastos } = useQuery({
    queryKey: ["grafico-tendencia-gastos"],
    queryFn: () => GraficosService.buscarTendenciaGastos(),
  });

  // Buscar totais acumulados
  const { data: totalReceitasAcumulado = 0 } = useQuery({
    queryKey: ["total-receitas"],
    queryFn: () => ReceitasService.buscarTotal(),
  });

  const { data: totalDespesasAcumulado = 0 } = useQuery({
    queryKey: ["total-despesas"],
    queryFn: () => DespesasService.buscarTotal(),
  });

  // Garantir que receitas e despesas sejam arrays
  const receitasArray = Array.isArray(receitas) ? receitas : [];
  const despesasArray = Array.isArray(despesas) ? despesas : [];

  // Cálculos financeiros
  const totalReceitas = receitasArray.reduce((acc, receita) => acc + receita.valor, 0);
  const totalDespesas = despesasArray.reduce((acc, despesa) => acc + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const saldoTotal = totalReceitasAcumulado - totalDespesasAcumulado;

  // Log carregamento da página
  useEffect(() => {
    logger.info(LogModules.DASHBOARD, LogActions.PAGE_LOAD, {
      mes,
      ano,
      totalReceitas,
      totalDespesas,
      saldo: saldo,
      saldoTotal
    });
  }, [mes, ano, totalReceitas, totalDespesas, saldo, saldoTotal]);

  // Se os dados estiverem carregando, você pode mostrar um indicador de carregamento
  if (isLoadingReceitas || isLoadingDespesas || isLoadingGrafico || isLoadingSaudeFinanceira || isLoadingDespesasCartao || isLoadingSazonalidade || isLoadingTendenciaGastos) {
    return <div className="container mx-auto py-6">Carregando dados...</div>;
  }

  return (
    <div className="container mx-auto py-2 sm:py-4 md:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <PageHeader 
          title="Dashboard" 
          description="Visão geral das suas finanças" 
        />
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Select value={mes.toString()} onValueChange={(value) => {
            const novoMes = Number(value);
            setMes(novoMes);
            logger.info(LogModules.DASHBOARD, LogActions.FILTER_APPLY, { filtro: 'mes', valor: novoMes });
          }}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.valor} value={mes.valor.toString()}>
                  {mes.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ano.toString()} onValueChange={(value) => {
            const novoAno = Number(value);
            setAno(novoAno);
            logger.info(LogModules.DASHBOARD, LogActions.FILTER_APPLY, { filtro: 'ano', valor: novoAno });
          }}>
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
        <FinanceSummaryCard 
          title="Receitas" 
          value={totalReceitas}
          icon={<TrendingUp className="h-5 w-5" />} 
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-500"
        />
        
        <FinanceSummaryCard 
          title="Despesas" 
          value={totalDespesas}
          icon={<TrendingDown className="h-5 w-5" />} 
          color="bg-rose-50 dark:bg-rose-950"
          iconColor="text-rose-500"
        />
        
        <FinanceSummaryCard 
          title="Saldo" 
          value={saldo}
          totalValue={saldoTotal}
          icon={<Wallet className="h-5 w-5" />} 
          color="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-500"
          showTotal={true}
        />
      </div>

      <Tabs value={tabAtiva} onValueChange={(tab) => {
        setTabAtiva(tab);
        logger.info(LogModules.DASHBOARD, 'aba alterada', { aba: tab });
      }} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start border-b mb-6 flex-nowrap">
            <TabsTrigger value="receitas-despesas-mensal" className="flex items-center gap-2 whitespace-nowrap">
              <BarChart3 className="h-4 w-4" />
              <span>Receitas x Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-2 whitespace-nowrap">
              <PieChart className="h-4 w-4" />
              <span>Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="despesas-cartao" className="flex items-center gap-2 whitespace-nowrap">
              <CreditCard className="h-4 w-4" />
              <span>Despesas por Cartão</span>
            </TabsTrigger>
            <TabsTrigger value="saude-financeira" className="flex items-center gap-2 whitespace-nowrap">
              <Activity className="h-4 w-4" />
              <span>Saúde Financeira</span>
            </TabsTrigger>
            <TabsTrigger value="tendencia-gastos" className="flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              <span>Tendência de Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="sazonalidade" className="flex items-center gap-2 whitespace-nowrap">
              <TrendingUpIcon className="h-4 w-4" />
              <span>Sazonalidade</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="receitas-despesas-mensal">
          <GraficoReceitasDespesasMensal />
        </TabsContent>

        <TabsContent value="saude-financeira">
          {dadosSaudeFinanceira && (
            <GraficoSaudeFinanceira dados={dadosSaudeFinanceira} />
          )}
        </TabsContent>

        <TabsContent value="despesas-cartao">
          {dadosDespesasCartao && (
            <GraficoDespesasCartao 
              dados={dadosDespesasCartao} 
              onMesesChange={setMesesAtrasCartao}
              mesesAtual={mesesAtrasCartao}
            />
          )}
        </TabsContent>

        <TabsContent value="tendencia-gastos">
          {dadosTendenciaGastos && (
            <GraficoTendenciaGastos dados={dadosTendenciaGastos} />
          )}
        </TabsContent>

        <TabsContent value="categorias">
          {dadosGrafico && (
            <GraficoReceitasDespesas 
              receitas={dadosGrafico.receitas} 
              despesas={dadosGrafico.despesas} 
            />
          )}
        </TabsContent>

        <TabsContent value="sazonalidade">
          {dadosSazonalidade && (
            <GraficoSazonalidadeGastos 
              data={dadosSazonalidade}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
