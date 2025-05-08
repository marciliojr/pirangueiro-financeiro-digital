
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

  const { data: receitas = [] } = useQuery({
    queryKey: ["receitas", mes, ano],
    queryFn: () => ReceitasService.listarPorMesAno(mes, ano),
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ["despesas", mes, ano],
    queryFn: () => DespesasService.listarPorMesAno(mes, ano),
  });

  const { data: limites = [] } = useQuery({
    queryKey: ["limites"],
    queryFn: LimitesService.listar,
  });

  // Cálculos financeiros
  const totalReceitas = receitas.reduce((acc, receita) => acc + receita.valor, 0);
  const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const totalLimites = limites.reduce((acc, limite) => acc + limite.valor, 0);

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
          trend={receitas.length > 0 ? '+10%' : '0%'}
          trendUp={true}
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-500"
        />
        
        <FinanceSummaryCard 
          title="Despesas" 
          value={totalDespesas} 
          icon={<TrendingDown className="h-5 w-5" />} 
          trend={despesas.length > 0 ? '+5%' : '0%'}
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
          data={[
            { name: 'Jan', receitas: 3000, despesas: 2500 },
            { name: 'Fev', receitas: 3500, despesas: 2300 },
            { name: 'Mar', receitas: 3200, despesas: 2800 },
            { name: 'Abr', receitas: 4000, despesas: 3000 },
            { name: 'Mai', receitas: 3800, despesas: 2900 },
            { name: 'Jun', receitas: 4200, despesas: 3100 },
          ]}
          type="bar"
        />
        
        <ChartContainer 
          title="Distribuição de Despesas" 
          data={
            limites.map(limite => ({
              name: limite.categoria,
              value: limite.valor
            }))
          }
          type="pie"
        />
      </div>
    </div>
  );
};

export default Dashboard;
