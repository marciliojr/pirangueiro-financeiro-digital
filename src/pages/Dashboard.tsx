import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, PieChart, Activity, CreditCard, TrendingUpIcon } from "lucide-react";
import { formatarMoeda } from "@/services/api";
import { ReceitasService } from "@/services/receitas";
import { DespesasService } from "@/services/despesas";
import { GraficosService } from "@/services/graficos";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";
import { GraficoReceitasDespesas } from "@/components/dashboard/GraficoReceitasDespesas";
import { GraficoSaudeFinanceira } from "@/components/dashboard/GraficoSaudeFinanceira";
import { GraficoDespesasCartao } from "@/components/dashboard/GraficoDespesasCartao";
import { GraficoSazonalidadeGastos } from "@/components/dashboard/GraficoSazonalidadeGastos";
import { GraficoTendenciaGastos } from "@/components/dashboard/GraficoTendenciaGastos";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [mesesAtrasCartao, setMesesAtrasCartao] = useState<number>(12);
  const mes = date.getMonth() + 1;
  const ano = date.getFullYear();

  const { data: receitas = [], isLoading: isLoadingReceitas } = useQuery({
    queryKey: ["receitas", mes, ano],
    queryFn: () => ReceitasService.listarPorMesAno(mes, ano),
  });

  const { data: despesas = [], isLoading: isLoadingDespesas } = useQuery({
    queryKey: ["despesas", mes, ano],
    queryFn: () => DespesasService.listarPorMesAno(mes, ano),
  });

  const { data: dadosGrafico, isLoading: isLoadingGrafico } = useQuery({
    queryKey: ["grafico-receitas-despesas", mes, ano],
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

  // Se os dados estiverem carregando, você pode mostrar um indicador de carregamento
  if (isLoadingReceitas || isLoadingDespesas || isLoadingGrafico || isLoadingSaudeFinanceira || isLoadingDespesasCartao || isLoadingSazonalidade || isLoadingTendenciaGastos) {
    return <div className="container mx-auto py-6">Carregando dados...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Dashboard" 
          description="Visão geral das suas finanças" 
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <FinanceSummaryCard 
          title="Receitas" 
          value={totalReceitas}
          totalValue={totalReceitasAcumulado}
          icon={<TrendingUp className="h-5 w-5" />} 
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-500"
        />
        
        <FinanceSummaryCard 
          title="Despesas" 
          value={totalDespesas}
          totalValue={totalDespesasAcumulado}
          icon={<TrendingDown className="h-5 w-5" />} 
          color="bg-rose-50 dark:bg-rose-950"
          iconColor="text-rose-500"
        />
        
        <FinanceSummaryCard 
          title="Saldo" 
          value={saldo}
          totalValue={totalReceitasAcumulado - totalDespesasAcumulado}
          icon={<Wallet className="h-5 w-5" />} 
          color="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-500"
        />
      </div>

      <Tabs defaultValue="saude-financeira" className="w-full">
        <TabsList className="w-full justify-start border-b mb-6">
          <TabsTrigger value="saude-financeira" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Saúde Cartões</span>
          </TabsTrigger>
          <TabsTrigger value="despesas-cartao" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Despesas por Cartão</span>
          </TabsTrigger>
          <TabsTrigger value="tendencia-gastos" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Tendência de Gastos</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="sazonalidade" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            <span>Sazonalidade</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saude-financeira">
          {dadosSaudeFinanceira && (
            <GraficoSaudeFinanceira dados={dadosSaudeFinanceira} />
          )}
        </TabsContent>

        <TabsContent value="tendencia-gastos">
          {dadosTendenciaGastos && (
            <GraficoTendenciaGastos dados={dadosTendenciaGastos} />
          )}
        </TabsContent>

        <TabsContent value="despesas-cartao">
          {dadosDespesasCartao && (
            <GraficoDespesasCartao 
              dados={dadosDespesasCartao} 
              onMesesChange={setMesesAtrasCartao}
            />
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
              dados={dadosSazonalidade}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
