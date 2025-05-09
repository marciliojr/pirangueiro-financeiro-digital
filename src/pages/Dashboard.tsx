import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Home, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatarMoeda } from "@/services/api";
import { ReceitasService, ReceitaDTO } from "@/services/receitas";
import { DespesasService, DespesaDTO } from "@/services/despesas";
import { LimitesService, LimiteGastoDTO } from "@/services/limites";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";

const Dashboard = () => {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

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

  // Garantir que receitas, despesas e limites sejam arrays
  const receitasArray = Array.isArray(receitas) ? receitas : [];
  const despesasArray = Array.isArray(despesas) ? despesas : [];
  const limitesArray = Array.isArray(limites) ? limites : [];

  // Cálculos financeiros
  const totalReceitas = receitasArray.reduce((acc, receita) => acc + receita.valor, 0);
  const totalDespesas = despesasArray.reduce((acc, despesa) => acc + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const totalLimites = limitesArray.reduce((acc, limite) => acc + limite.valor, 0);

  // Dados para o gráfico de barras
  const chartData = [
    { name: 'Jan', receitas: 3000, despesas: 2500 },
    { name: 'Fev', receitas: 3500, despesas: 2300 },
    { name: 'Mar', receitas: 3200, despesas: 2800 },
    { name: 'Abr', receitas: 4000, despesas: 3000 },
    { name: 'Mai', receitas: 3800, despesas: 2900 },
    { name: 'Jun', receitas: 4200, despesas: 3100 },
  ];

  // Preparar dados para o gráfico de pizza
  const pieData = limitesArray.length > 0
    ? limitesArray.map(limite => ({
        name: limite.categoria,
        value: limite.valor
      }))
    : [
        { name: 'Alimentação', value: 800 },
        { name: 'Transporte', value: 300 },
        { name: 'Lazer', value: 500 },
        { name: 'Saúde', value: 200 }
      ];

  // Se os dados estiverem carregando, você pode mostrar um indicador de carregamento
  if (isLoadingReceitas || isLoadingDespesas || isLoadingLimites) {
    return <div className="container mx-auto py-6">Carregando dados...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Dashboard" 
        description="Visão geral das suas finanças" 
      />

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

      <div className="grid gap-4 md:grid-cols-2">
        <ChartContainer 
          title="Receitas vs Despesas" 
          data={chartData}
          type="bar"
        />
        
        <ChartContainer 
          title="Distribuição de Despesas" 
          data={pieData}
          type="pie"
        />
      </div>
    </div>
  );
};

export default Dashboard;
