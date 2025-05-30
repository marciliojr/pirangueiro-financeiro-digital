import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Minus, TrendingUp, FileText, Image } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useState } from 'react';
import { exportChart } from "@/lib/export-chart";

interface GraficoTendenciaGastosProps {
  dados: {
    meses: string[];
    valores: number[];
    coeficienteAngular: number;
    mediaGastos: number;
    tendencia: string;
    valorPrevistoProximoMes: number;
  };
}

// Função para formatar moeda (exemplo)
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Função para formatar labels dos meses
const formatarMes = (mes: string) => {
  const [month, year] = mes.split('/');
  const meses = [
    '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${meses[parseInt(month)]}/${year.slice(-2)}`;
};

export function GraficoTendenciaGastos({ dados }: GraficoTendenciaGastosProps) {
  const [exportando, setExportando] = useState(false);

  // Função para exportar o gráfico
  const handleExport = async (format: 'pdf' | 'jpg') => {
    setExportando(true);
    try {
      const filename = `grafico_tendencia_gastos`;
      await exportChart({
        elementId: 'grafico-tendencia-gastos',
        filename,
        format
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setExportando(false);
    }
  };

  // Preparar dados para o gráfico
  const dadosGrafico = dados.meses.map((mes, index) => ({
    mes: formatarMes(mes),
    mesOriginal: mes,
    valor: dados.valores[index],
    tendencia: dados.valores[0] + (dados.coeficienteAngular * index),
    // Adicionar ponto de previsão
    ...(index === dados.meses.length - 1 && {
      previsao: dados.valorPrevistoProximoMes
    })
  }));

  // Adicionar ponto de previsão para o próximo mês
  const proximoMes = new Date();
  proximoMes.setMonth(proximoMes.getMonth() + 1);
  const labelProximoMes = formatarMes(`${proximoMes.getMonth() + 1}/${proximoMes.getFullYear()}`);

  dadosGrafico.push({
    mes: labelProximoMes,
    mesOriginal: `${proximoMes.getMonth() + 1}/${proximoMes.getFullYear()}`,
    valor: null,
    tendencia: dados.valorPrevistoProximoMes,
    previsao: dados.valorPrevistoProximoMes
  });

  // Configurações de cor e ícone baseadas na tendência
  const getTendenciaConfig = () => {
    switch (dados.tendencia) {
      case "CRESCENTE":
        return {
          cor: "#ef4444",
          corFundo: "#fef2f2",
          icone: ArrowUp,
          texto: "Crescente",
          sinal: "+"
        };
      case "DECRESCENTE":
        return {
          cor: "#22c55e",
          corFundo: "#f0fdf4",
          icone: ArrowDown,
          texto: "Decrescente",
          sinal: "-"
        };
      default:
        return {
          cor: "#6b7280",
          corFundo: "#f9fafb",
          icone: Minus,
          texto: "Estável",
          sinal: "±"
        };
    }
  };

  const tendenciaConfig = getTendenciaConfig();
  const IconeTendencia = tendenciaConfig.icone;

  // Calcular variação percentual
  const primeiroValor = dados.valores[0];
  const ultimoValor = dados.valores[dados.valores.length - 1];
  const variacaoPercentual = ((ultimoValor - primeiroValor) / primeiroValor) * 100;

  return (
    <Card className="w-full" id="grafico-tendencia-gastos">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tendência de Gastos
            </CardTitle>
            <CardDescription>
              Análise dos últimos 12 meses com projeção
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: tendenciaConfig.corFundo }}
            >
              <IconeTendencia 
                className="h-4 w-4" 
                style={{ color: tendenciaConfig.cor }}
              />
              <div className="text-right">
                <p 
                  className="text-sm font-semibold"
                  style={{ color: tendenciaConfig.cor }}
                >
                  {tendenciaConfig.texto}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tendenciaConfig.sinal}{formatarMoeda(Math.abs(dados.coeficienteAngular))}/mês
                </p>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={exportando}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('jpg')}
                disabled={exportando}
                className="flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                JPG
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[350px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={dadosGrafico} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tickFormatter={formatarMoeda}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
                width={80}
              />
              
              {/* Linha de referência da média */}
              <ReferenceLine 
                y={dados.mediaGastos} 
                stroke="#f59e0b" 
                strokeDasharray="8 4"
                label={{ value: "Média", position: "right", fontSize: 12 }}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'valor') return [formatarMoeda(value), "Gasto Real"];
                  if (name === 'tendencia') return [formatarMoeda(value), "Linha de Tendência"];
                  if (name === 'previsao') return [formatarMoeda(value), "Previsão"];
                  return [formatarMoeda(value), name];
                }}
                labelFormatter={(label) => `${label}`}
              />
              
              {/* Linha dos valores reais */}
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                connectNulls={false}
              />
              
              {/* Linha de tendência */}
              <Line
                type="monotone"
                dataKey="tendencia"
                stroke={tendenciaConfig.cor}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={false}
              />
              
              {/* Ponto de previsão */}
              <Line
                type="monotone"
                dataKey="previsao"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 8, fill: '#f59e0b' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Cards de métricas melhoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm font-medium text-blue-800">Média Mensal</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{formatarMoeda(dados.mediaGastos)}</p>
            <p className="text-xs text-blue-600 mt-1">Últimos 12 meses</p>
          </div>
          
          <div className="rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <p className="text-sm font-medium text-amber-800">Previsão</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">{formatarMoeda(dados.valorPrevistoProximoMes)}</p>
            <p className="text-xs text-amber-600 mt-1">Próximo mês</p>
          </div>
          
          <div 
            className="rounded-lg p-4 border"
            style={{ 
              background: `linear-gradient(to right, ${tendenciaConfig.corFundo}, ${tendenciaConfig.corFundo}dd)`,
              borderColor: tendenciaConfig.cor + '40'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tendenciaConfig.cor }}
              ></div>
              <p className="text-sm font-medium" style={{ color: tendenciaConfig.cor }}>
                Variação Total
              </p>
            </div>
            <p className="text-2xl font-bold" style={{ color: tendenciaConfig.cor }}>
              {variacaoPercentual >= 0 ? '+' : ''}{variacaoPercentual.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: tendenciaConfig.cor + 'cc' }}>
              Primeiro vs último mês
            </p>
          </div>
        </div>
        
        {/* Insights adicionais */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">
            <strong>Análise:</strong> Seus gastos apresentam tendência{' '}
            <span style={{ color: tendenciaConfig.cor, fontWeight: 'bold' }}>
              {tendenciaConfig.texto.toLowerCase()}
            </span>
            {dados.tendencia !== 'ESTÁVEL' && (
              <span>
                {' '}com variação de {formatarMoeda(Math.abs(dados.coeficienteAngular))} por mês.
                {dados.tendencia === 'CRESCENTE' 
                  ? ' Considere revisar seus gastos para controlar o crescimento.'
                  : ' Continue mantendo este controle de gastos!'
                }
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}