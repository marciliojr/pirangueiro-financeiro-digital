
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RelatoriosService } from "@/services/relatorios";
import { DespesasService } from "@/services/despesas";
import { ReceitasService } from "@/services/receitas";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { formatarMoeda, formatarMesAno } from "@/services/api";
import {
  FileText,
  Download,
  CalendarIcon,
  BarChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsLegacyPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";

const Relatorios = () => {
  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());

  const { data: receitas = [] } = useQuery({
    queryKey: ["receitas", mesAtual, anoAtual],
    queryFn: () => ReceitasService.buscarPorMesAno(mesAtual, anoAtual),
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ["despesas", mesAtual, anoAtual],
    queryFn: () => DespesasService.buscarPorMesAno(mesAtual, anoAtual),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => CategoriasService.listar(),
  });

  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => ContasService.listar(),
  });

  const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  // Preparar dados para os gráficos
  const dadosFluxoDiario = prepararDadosFluxoDiario(receitas, despesas);
  const dadosDespesasPorCategoria = prepararDadosDespesasPorCategoria(despesas, categorias);
  const dadosReceitasPorConta = prepararDadosReceitasPorConta(receitas, contas);

  const gerarPDF = async () => {
    try {
      const blob = await RelatoriosService.gerarPDF(mesAtual, anoAtual);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${mesAtual}-${anoAtual}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Análise completa de receitas e despesas"
        action={
          <div className="flex items-center gap-2">
            <Select
              value={String(mesAtual)}
              onValueChange={(value) => setMesAtual(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(anoAtual)}
              onValueChange={(value) => setAnoAtual(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => (
                  <SelectItem
                    key={i}
                    value={String(new Date().getFullYear() - 2 + i)}
                  >
                    {new Date().getFullYear() - 2 + i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="success" onClick={gerarPDF}>
              <Download className="mr-2 h-4 w-4" /> Gerar PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpRight className="mr-2 h-5 w-5 text-success" />
              <div className="text-2xl font-bold">{formatarMoeda(totalReceitas)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownRight className="mr-2 h-5 w-5 text-destructive" />
              <div className="text-2xl font-bold">{formatarMoeda(totalDespesas)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {saldo >= 0 ? (
                <ArrowUpRight className="mr-2 h-5 w-5 text-success" />
              ) : (
                <ArrowDownRight className="mr-2 h-5 w-5 text-destructive" />
              )}
              <div 
                className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}
              >
                {formatarMoeda(saldo)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumo">
        <TabsList className="mb-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="categorias">Despesas por Categoria</TabsTrigger>
          <TabsTrigger value="contas">Receitas por Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Resumo Financeiro - {formatarMesAno(mesAtual, anoAtual)}</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart
                    data={[
                      { nome: 'Receitas', valor: totalReceitas, cor: '#10b981' },
                      { nome: 'Despesas', valor: totalDespesas, cor: '#ef4444' },
                      { nome: 'Saldo', valor: Math.abs(saldo), cor: saldo >= 0 ? '#3b82f6' : '#f97316' }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor">
                      {[
                        { nome: 'Receitas', valor: totalReceitas, cor: '#10b981' },
                        { nome: 'Despesas', valor: totalDespesas, cor: '#ef4444' },
                        { nome: 'Saldo', valor: Math.abs(saldo), cor: saldo >= 0 ? '#3b82f6' : '#f97316' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Fluxo de Caixa Diário - {formatarMesAno(mesAtual, anoAtual)}</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              {dadosFluxoDiario.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={dadosFluxoDiario}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke="#10b981"
                      name="Receitas"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      stroke="#ef4444"
                      name="Despesas"
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="#3b82f6"
                      name="Saldo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Despesas por Categoria - {formatarMesAno(mesAtual, anoAtual)}</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosDespesasPorCategoria.length > 0 ? (
                <div className="flex flex-col items-center md:flex-row">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsLegacyPieChart>
                        <Pie
                          data={dadosDespesasPorCategoria}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="valor"
                          nameKey="nome"
                          label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {dadosDespesasPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                      </RechartsLegacyPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <div className="mt-4 space-y-4">
                      {dadosDespesasPorCategoria.map((categoria) => (
                        <div key={categoria.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="mr-2 h-3 w-3 rounded-full" 
                              style={{ backgroundColor: categoria.cor }}
                            />
                            <span>{categoria.nome}</span>
                          </div>
                          <span className="font-medium">{formatarMoeda(categoria.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Receitas por Conta - {formatarMesAno(mesAtual, anoAtual)}</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosReceitasPorConta.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart
                    data={dadosReceitasPorConta}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="nome" 
                      width={120}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                    <Bar dataKey="valor" fill="#3b82f6" name="Valor">
                      {dadosReceitasPorConta.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Função para processar dados do fluxo de caixa por dia
function prepararDadosFluxoDiario(receitas, despesas) {
  const diasDoMes = {};

  // Obter o último dia do mês para o mês atual
  const data = new Date();
  const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();

  // Inicializa o objeto com todos os dias do mês
  for (let i = 1; i <= ultimoDia; i++) {
    const dia = i.toString().padStart(2, '0');
    diasDoMes[dia] = { dia, receitas: 0, despesas: 0, saldo: 0 };
  }

  // Soma receitas por dia
  receitas.forEach(receita => {
    const dia = new Date(receita.data).getDate().toString().padStart(2, '0');
    if (diasDoMes[dia]) {
      diasDoMes[dia].receitas += receita.valor;
    }
  });

  // Soma despesas por dia
  despesas.forEach(despesa => {
    const dia = new Date(despesa.data).getDate().toString().padStart(2, '0');
    if (diasDoMes[dia]) {
      diasDoMes[dia].despesas += despesa.valor;
    }
  });

  // Calcula saldo para cada dia
  Object.values(diasDoMes).forEach(dia => {
    dia.saldo = dia.receitas - dia.despesas;
  });

  // Converte o objeto em array e filtra apenas os dias que têm dados
  return Object.values(diasDoMes)
    .filter(dia => dia.receitas > 0 || dia.despesas > 0)
    .sort((a, b) => Number(a.dia) - Number(b.dia));
}

// Função para processar dados de categorias
function prepararDadosDespesasPorCategoria(despesas, categorias) {
  const categoriasMap = {};

  despesas.forEach(despesa => {
    const categoriaId = despesa.categoriaId;
    if (!categoriasMap[categoriaId]) {
      const categoria = categorias.find(c => c.id === categoriaId);
      categoriasMap[categoriaId] = {
        id: categoriaId,
        nome: categoria ? categoria.nome : `Categoria ${categoriaId}`,
        valor: 0,
        cor: categoria ? categoria.cor : '#3b82f6'
      };
    }
    categoriasMap[categoriaId].valor += despesa.valor;
  });

  return Object.values(categoriasMap).sort((a, b) => b.valor - a.valor);
}

// Função para processar dados de contas
function prepararDadosReceitasPorConta(receitas, contas) {
  const contasMap = {};

  receitas.forEach(receita => {
    const contaId = receita.contaId;
    if (!contasMap[contaId]) {
      const conta = contas.find(c => c.id === contaId);
      contasMap[contaId] = {
        id: contaId,
        nome: conta ? conta.nome : `Conta ${contaId}`,
        valor: 0
      };
    }
    contasMap[contaId].valor += receita.valor;
  });

  return Object.values(contasMap).sort((a, b) => b.valor - a.valor);
}

export default Relatorios;
