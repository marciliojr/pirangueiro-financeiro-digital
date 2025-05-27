import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3 } from 'lucide-react';

interface TooltipPayload {
  payload: {
    mes: string;
    mesCompleto: string;
    valor: number;
  };
  value: number;
}

export const GraficoSazonalidadeGastos = ({ data = [] }) => {
  // Verifica se há dados
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum dado disponível</p>
            <p className="text-gray-400 text-sm">Carregue dados para visualizar o gráfico de sazonalidade</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculando estatísticas
  const valores = data.map(d => Number(d.valor) || 0);
  const maiorValor = Math.max(...valores);
  const menorValor = Math.min(...valores);
  const mediaGeral = valores.reduce((a, b) => a + b, 0) / valores.length;
  
  const mesMaiorGasto = data.find(d => Number(d.valor) === maiorValor);
  const mesMenorGasto = data.find(d => Number(d.valor) === menorValor);

  // Identificando tendência (segunda metade vs primeira metade)
  const primeiroSemestre = valores.length >= 6 ? valores.slice(0, 6).reduce((a, b) => a + b, 0) / 6 : 0;
  const segundoSemestre = valores.length >= 12 ? valores.slice(6, 12).reduce((a, b) => a + b, 0) / 6 : 
                          valores.length > 6 ? valores.slice(6).reduce((a, b) => a + b, 0) / (valores.length - 6) : 0;
  const tendencia = segundoSemestre > primeiroSemestre ? 'crescente' : 'decrescente';

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const valor = payload[0].value;
      const percentualDaMedia = ((Number(valor) / mediaGeral - 1) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.mesCompleto}</p>
          <p className="text-blue-600 font-bold">
            R$ {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${Number(percentualDaMedia) > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {Number(percentualDaMedia) > 0 ? '+' : ''}{percentualDaMedia}% da média
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Sazonalidade dos Gastos</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600">Média histórica de gastos por mês do ano</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Média Anual</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-gray-800">
            R$ {mediaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 sm:p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">Maior Gasto</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-gray-800">{mesMaiorGasto?.mesCompleto}</span>
          <span className="text-xs sm:text-sm text-gray-600 block">
            R$ {maiorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Menor Gasto</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-gray-800">{mesMenorGasto?.mesCompleto}</span>
          <span className="text-xs sm:text-sm text-gray-600 block">
            R$ {menorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Tendência</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-gray-800 capitalize">{tendencia}</span>
          <span className="text-xs sm:text-sm text-gray-600 block">
            {primeiroSemestre > 0 
              ? ((segundoSemestre - primeiroSemestre) / primeiroSemestre * 100).toFixed(1) 
              : '0.0'}% de variação
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[300px] sm:h-[350px] md:h-[400px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 11 }}
              stroke="#666"
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${(value/1000).toFixed(1)}k`}
              tick={{ fontSize: 11 }}
              stroke="#666"
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Linha da média */}
            <ReferenceLine 
              y={mediaGeral} 
              stroke="#8b5cf6" 
              strokeDasharray="8 8" 
              strokeWidth={2}
              label={{ value: "Média Anual", position: "right", fill: "#8b5cf6", fontSize: 11 }}
            />
            
            {/* Linha principal */}
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#1d4ed8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          Insights Sazonais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="font-medium text-gray-700">• Pico de gastos:</span>
            <span className="text-gray-600 ml-1">
              {data.filter(d => Number(d.valor) > mediaGeral * 1.1).map(d => d.mesCompleto).join(', ') || 'Nenhum'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">• Economia maior:</span>
            <span className="text-gray-600 ml-1">
              {data.filter(d => Number(d.valor) < mediaGeral * 0.9).map(d => d.mesCompleto).join(', ') || 'Nenhum'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">• Variação:</span>
            <span className="text-gray-600 ml-1">
              R$ {(maiorValor - menorValor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
              ({(((maiorValor - menorValor) / mediaGeral) * 100).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">• Estabilidade:</span>
            <span className="text-gray-600 ml-1">
              {((maiorValor - menorValor) / mediaGeral) < 0.3 ? 'Alta' : 
               ((maiorValor - menorValor) / mediaGeral) < 0.6 ? 'Média' : 'Baixa'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoSazonalidadeGastos;