import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RelatoriosService } from "@/services/relatorios";
import { CategoriasService } from "@/services/categorias";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileBarChart, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Filter,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartoesService } from "@/services/cartoes";
import { ContasService } from "@/services/contas";

// Obter mês e ano atual para o filtro inicial
const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1; // getMonth() retorna 0-11
const anoAtual = dataAtual.getFullYear();

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
  { valor: 12, nome: "Dezembro" }
];

// Gerar lista de anos (últimos 5 anos)
const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

const Relatorios = () => {
  const [mesSelecionado, setMesSelecionado] = useState<number>(mesAtual);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(anoAtual);
  const [isDownloading, setIsDownloading] = useState(false);

  // Consulta para buscar dados do relatório
  const { data: relatorio, isLoading } = useQuery({
    queryKey: ["relatorio", mesSelecionado, anoSelecionado],
    queryFn: () => RelatoriosService.buscarRelatorioPorMesAno(mesSelecionado, anoSelecionado),
  });

  // Consulta para buscar categorias
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => CategoriasService.listar(),
  });

  // Obter contas para exibir os nomes
  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => ContasService.listar(),
  });

  // Obter cartões para exibir os nomes
  const { data: cartoes = [] } = useQuery({
    queryKey: ["cartoes"],
    queryFn: () => CartoesService.listar(),
  });

  // Funções auxiliares para obter nomes por ID
  const getCategoryName = (categoriaId?: number) => {
    if (!categoriaId) return "Categoria não especificada";
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nome : "Categoria não encontrada";
  };
  
  const getAccountName = (contaId?: number) => {
    if (!contaId) return "-";
    const conta = contas.find(acc => acc.id === contaId);
    return conta ? conta.nome : "Conta não encontrada";
  };
  
  const getCardName = (cartaoId?: number) => {
    if (!cartaoId) return "-";
    const cartao = cartoes.find(card => card.id === cartaoId);
    return cartao ? cartao.nome : "Cartão não encontrado";
  };

  // Função para gerar o PDF
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const blob = await RelatoriosService.gerarPDF(mesSelecionado, anoSelecionado);
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link temporário e simular clique para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${anoSelecionado}-${mesSelecionado}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Relatório baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar relatório");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Nome do mês formatado
  const mesFormatado = meses.find(m => m.valor === mesSelecionado)?.nome || "";

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Relatórios"
        description="Visualize e analise sua situação financeira"
        action={
          <Button onClick={handleDownloadPDF} disabled={isLoading || isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Baixar PDF
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="mr-2">Filtros:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select 
                  value={mesSelecionado.toString()} 
                  onValueChange={(value) => setMesSelecionado(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.valor} value={mes.valor.toString()}>
                        {mes.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select 
                  value={anoSelecionado.toString()} 
                  onValueChange={(value) => setAnoSelecionado(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o ano" />
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando relatório...</span>
        </div>
      ) : !relatorio ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p>Nenhum dado disponível para o período selecionado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumo financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total de Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(relatorio.totalReceitas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mesFormatado} de {anoSelecionado}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-red-600">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Total de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(relatorio.totalDespesas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mesFormatado} de {anoSelecionado}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium flex items-center ${relatorio.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${relatorio.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(relatorio.saldo)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mesFormatado} de {anoSelecionado}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabelas de Receitas e Despesas */}
          <Tabs defaultValue="receitas" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="receitas">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receitas de {mesFormatado} de {anoSelecionado}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorio.receitas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            Nenhuma receita registrada para este período
                          </TableCell>
                        </TableRow>
                      ) : (
                        relatorio.receitas.map((receita) => (
                          <TableRow key={receita.id}>
                            <TableCell className="font-medium">{receita.descricao}</TableCell>
                            <TableCell>{receita.categoria ? receita.categoria.nome : 
                              getCategoryName(receita.categoriaId)}</TableCell>
                            <TableCell>{receita.conta ? receita.conta.nome : 
                              getAccountName(receita.contaId)}</TableCell>
                            <TableCell>{new Date(receita.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(receita.valor)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="despesas">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Despesas de {mesFormatado} de {anoSelecionado}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Cartão</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorio.despesas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            Nenhuma despesa registrada para este período
                          </TableCell>
                        </TableRow>
                      ) : (
                        relatorio.despesas.map((despesa) => (
                          <TableRow key={despesa.id}>
                            <TableCell className="font-medium">{despesa.descricao}</TableCell>
                            <TableCell>{despesa.categoria ? despesa.categoria.nome : 
                              getCategoryName(despesa.categoriaId)}</TableCell>
                            <TableCell>{despesa.conta ? despesa.conta.nome : 
                              getAccountName(despesa.contaId)}</TableCell>
                            <TableCell>{despesa.cartao ? despesa.cartao.nome : 
                              despesa.cartaoId ? getCardName(despesa.cartaoId) : '-'}</TableCell>
                            <TableCell>{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(despesa.valor)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Relatorios;
