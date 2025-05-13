import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Home, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon } from "lucide-react";
import { formatarMoeda } from "@/services/api";
import { ReceitasService } from "@/services/receitas";
import { DespesasService } from "@/services/despesas";
import { LimitesService } from "@/services/limites";
import { GraficosService } from "@/services/graficos";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";
import { GraficoReceitasDespesas } from "@/components/dashboard/GraficoReceitasDespesas";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const [date, setDate] = useState<Date>(new Date());
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

  const { data: limites = [], isLoading: isLoadingLimites } = useQuery({
    queryKey: ["limites"],
    queryFn: LimitesService.listar,
  });

  const { data: dadosGrafico, isLoading: isLoadingGrafico } = useQuery({
    queryKey: ["grafico-receitas-despesas", mes, ano],
    queryFn: () => GraficosService.buscarReceitasDespesas(mes, ano),
  });

  // Garantir que receitas, despesas e limites sejam arrays
  const receitasArray = Array.isArray(receitas) ? receitas : [];
  const despesasArray = Array.isArray(despesas) ? despesas : [];
  const limitesArray = Array.isArray(limites) ? limites : [];

  // Cálculos financeiros
  const totalReceitas = receitasArray.reduce((acc, receita) => acc + receita.valor, 0);
  const totalDespesas = despesasArray.reduce((acc, despesa) => acc + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const totalLimites = limitesArray.reduce((acc, limite) => acc + limite.valor, 0);

  // Se os dados estiverem carregando, você pode mostrar um indicador de carregamento
  if (isLoadingReceitas || isLoadingDespesas || isLoadingLimites || isLoadingGrafico) {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <FinanceSummaryCard 
          title="Receitas" 
          value={totalReceitas} 
          icon={<TrendingUp className="h-5 w-5" />} 
          trend={receitasArray.length > 0 ? '+10%' : '0%'}
          trendUp={true}
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-500"
        />
        
        <FinanceSummaryCard 
          title="Despesas" 
          value={totalDespesas} 
          icon={<TrendingDown className="h-5 w-5" />} 
          trend={despesasArray.length > 0 ? '+5%' : '0%'}
          trendUp={false}
          color="bg-rose-50 dark:bg-rose-950"
          iconColor="text-rose-500"
        />
        
        <FinanceSummaryCard 
          title="Saldo" 
          value={saldo} 
          icon={<Wallet className="h-5 w-5" />} 
          trend={saldo > 0 ? '+15%' : '-5%'}
          trendUp={saldo > 0}
          color="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-500"
        />
        
        <FinanceSummaryCard 
          title="Limites" 
          value={totalLimites} 
          icon={<Home className="h-5 w-5" />} 
          trend="0%"
          trendUp={true}
          color="bg-purple-50 dark:bg-purple-950"
          iconColor="text-purple-500"
        />
      </div>

      {dadosGrafico && (
        <GraficoReceitasDespesas 
          receitas={dadosGrafico.receitas} 
          despesas={dadosGrafico.despesas} 
        />
      )}
    </div>
  );
};

export default Dashboard;
