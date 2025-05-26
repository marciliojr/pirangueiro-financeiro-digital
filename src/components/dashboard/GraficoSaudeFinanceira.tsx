import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, CreditCard, Wallet, AlertTriangle, CheckCircle } from "lucide-react";

// Interface simulada para demonstração
interface CartaoLimiteDTO {
  nomeCartao: string;
  limiteTotal: number;
  limiteUsado: number;
  limiteDisponivel: number;
  percentualUtilizado: number;
}

interface DashboardFinanceiroDTO {
  saldoAtual: number;
  taxaEconomiaMensal: number;
  limitesCartoes: CartaoLimiteDTO[];
}

interface GraficoSaudeFinanceiraProps {
  dados: DashboardFinanceiroDTO;
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function GraficoSaudeFinanceira({ dados }: GraficoSaudeFinanceiraProps) {
  // Preparar dados para o gráfico de barras dos cartões
  const dadosGrafico = dados.limitesCartoes.map(cartao => ({
    name: cartao.nomeCartao,
    usado: cartao.limiteUsado,
    disponivel: cartao.limiteDisponivel,
    percentual: cartao.percentualUtilizado,
    total: cartao.limiteTotal
  }));

  // Dados para o gráfico de pizza (distribuição de limite usado)
  const dadosPizza = dados.limitesCartoes.map((cartao, index) => ({
    name: cartao.nomeCartao,
    value: cartao.limiteUsado,
    color: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#3b82f6'
  }));

  // Calcular métricas adicionais
  const totalLimiteDisponivel = dados.limitesCartoes.reduce((acc, cartao) => acc + cartao.limiteDisponivel, 0);
  const totalLimiteUsado = dados.limitesCartoes.reduce((acc, cartao) => acc + cartao.limiteUsado, 0);
  const totalLimite = dados.limitesCartoes.reduce((acc, cartao) => acc + cartao.limiteTotal, 0);
  const utilizacaoMediaCartoes = dados.limitesCartoes.length > 0 
    ? dados.limitesCartoes.reduce((acc, cartao) => acc + cartao.percentualUtilizado, 0) / dados.limitesCartoes.length 
    : 0;

  // Função para determinar a cor do indicador de saúde
  const getHealthColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-600';
    if (percentage < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Função para determinar o status de saúde financeira
  const getHealthStatus = () => {
    if (dados.saldoAtual > 0 && utilizacaoMediaCartoes < 50) return { status: 'Excelente', color: 'text-green-600', icon: CheckCircle };
    if (dados.saldoAtual > 0 && utilizacaoMediaCartoes < 70) return { status: 'Boa', color: 'text-yellow-600', icon: TrendingUp };
    return { status: 'Atenção', color: 'text-red-600', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Análise de Saúde Financeira
            </CardTitle>
            <div className={`flex items-center gap-2 ${healthStatus.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{healthStatus.status}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${dados.saldoAtual >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {dados.saldoAtual >= 0 ? (
                  <TrendingUp className={`w-6 h-6 ${dados.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo do Mês</p>
                <p className={`text-xl font-bold ${dados.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(dados.saldoAtual)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa de Economia</p>
              <p className="text-xl font-bold">{dados.taxaEconomiaMensal.toFixed(1)}%</p>
              <Progress value={dados.taxaEconomiaMensal} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Limite Disponível</p>
              <p className="text-xl font-bold text-green-600">
                {formatarMoeda(totalLimiteDisponivel)}
              </p>
              <p className="text-xs text-muted-foreground">
                {((totalLimiteDisponivel / totalLimite) * 100).toFixed(1)}% do total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Utilização Média</p>
              <p className={`text-xl font-bold ${getHealthColor(utilizacaoMediaCartoes)}`}>
                {utilizacaoMediaCartoes.toFixed(1)}%
              </p>
              <Progress value={utilizacaoMediaCartoes} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Utilização dos Cartões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Utilização por Cartão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatarMoeda(value)]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="usado" stackId="a" name="Limite Usado" fill="#ef4444" />
                  <Bar dataKey="disponivel" stackId="a" name="Limite Disponível" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gastos nos Cartões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatarMoeda(value), 'Valor Usado']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento dos Cartões */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Cartões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dados.limitesCartoes.map((cartao, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{cartao.nomeCartao}</h3>
                    <p className="text-sm text-muted-foreground">
                      Limite Total: {formatarMoeda(cartao.limiteTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getHealthColor(cartao.percentualUtilizado)}`}>
                      {cartao.percentualUtilizado.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">utilizado</p>
                  </div>
                </div>
                
                <Progress value={cartao.percentualUtilizado} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valor Usado</p>
                    <p className="font-semibold text-red-600">{formatarMoeda(cartao.limiteUsado)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disponível</p>
                    <p className="font-semibold text-green-600">{formatarMoeda(cartao.limiteDisponivel)}</p>
                  </div>
                </div>

                {/* Alerta de utilização alta */}
                {cartao.percentualUtilizado > 80 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">
                      Atenção: Utilização alta do cartão. Considere reduzir os gastos.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dados.saldoAtual < 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Saldo Negativo</p>
                  <p className="text-sm text-red-700">Suas despesas estão superando suas receitas. Revise seus gastos.</p>
                </div>
              </div>
            )}
            
            {utilizacaoMediaCartoes > 70 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Alta Utilização de Cartões</p>
                  <p className="text-sm text-yellow-700">Utilização média dos cartões acima de 70%. Considere reduzir os gastos.</p>
                </div>
              </div>
            )}
            
            {dados.taxaEconomiaMensal > 20 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Ótima Taxa de Economia</p>
                  <p className="text-sm text-green-700">Parabéns! Você está economizando mais de 20% da sua renda.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}