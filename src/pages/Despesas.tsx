import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DespesasService, DespesaDTO } from "@/services/despesas";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { CartoesService } from "@/services/cartoes";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatarMoeda, formatarData, formatarMesAno } from "@/services/api";
import { DespesaForm } from "@/components/despesas/DespesaForm";
import { ConfirmDialog } from "@/components/despesas/ConfirmDialog";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import { logger, LogModules, LogActions } from "@/utils/logger";

type SortField = 'descricao' | 'data' | 'categoria' | 'conta' | 'cartao' | 'valor';
type SortOrder = 'asc' | 'desc';

// Gerar lista de meses
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

// Gerar lista de anos (5 anos antes e 5 anos após o ano atual)
const anoAtual = new Date().getFullYear();
const anos = Array.from(
  { length: 11 }, 
  (_, i) => anoAtual - 5 + i
).sort((a, b) => b - a);

const Despesas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState<number | undefined>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(new Date().getFullYear());
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDespesa, setCurrentDespesa] = useState<DespesaDTO | null>(null);
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const queryClient = useQueryClient();

  // Log carregamento da página
  useEffect(() => {
    logger.info(LogModules.DESPESAS, LogActions.PAGE_LOAD, {
      mes: mesSelecionado,
      ano: anoSelecionado
    });
  }, []);

  // Obter lista de despesas
  const { data: despesasPage, isLoading } = useQuery({
    queryKey: ["despesas", searchTerm, mesSelecionado, anoSelecionado, paginaAtual],
    queryFn: () => DespesasService.buscarPorDescricao(searchTerm, mesSelecionado, anoSelecionado, paginaAtual),
  });
  
  // Obter categorias para exibir os nomes
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

  // Mutação para excluir despesa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      logger.info(LogModules.DESPESAS, LogActions.DELETE, { despesaId: id });
      return DespesasService.excluir(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      logger.info(LogModules.DESPESAS, LogActions.DELETE_SUCCESS);
    },
    onError: (error) => {
      logger.error(LogModules.DESPESAS, LogActions.DELETE_ERROR, { error });
    }
  });

  // Manipuladores de eventos
  const handlePageChange = (newPage: number) => {
    setPaginaAtual(newPage);
    logger.debug(LogModules.DESPESAS, 'página alterada', { pagina: newPage });
  };

  const openCreateForm = () => {
    setCurrentDespesa(null);
    setIsFormOpen(true);
    logger.info(LogModules.DESPESAS, 'formulário de criação aberto');
  };

  const openEditForm = (despesa: DespesaDTO) => {
    setCurrentDespesa(despesa);
    setIsFormOpen(true);
    logger.info(LogModules.DESPESAS, 'formulário de edição aberto', { 
      despesaId: despesa.id, 
      descricao: despesa.descricao 
    });
  };

  const openDeleteDialog = (despesa: DespesaDTO) => {
    setCurrentDespesa(despesa);
    setIsDeleteDialogOpen(true);
    logger.info(LogModules.DESPESAS, 'diálogo de exclusão aberto', { 
      despesaId: despesa.id, 
      descricao: despesa.descricao 
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentDespesa(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["despesas"] });
    setIsFormOpen(false);
  };
  
  // Função para obter o nome da categoria pelo ID ou objeto
  const getCategoryName = (despesa: DespesaDTO) => {
    if (despesa.categoria) {
      return despesa.categoria.nome;
    }
    
    if (despesa.categoriaId) {
      const categoria = categorias.find(cat => cat.id === despesa.categoriaId);
      return categoria ? categoria.nome : "Categoria não encontrada";
    }
    
    return "Categoria não especificada";
  };
  
  // Função para obter o nome da conta pelo ID ou objeto
  const getAccountName = (despesa: DespesaDTO) => {
    if (despesa.conta) {
      return despesa.conta.nome;
    }
    
    if (despesa.contaId) {
      const conta = contas.find(acc => acc.id === despesa.contaId);
      return conta ? conta.nome : "Conta não encontrada";
    }
    
    return "-";
  };

  // Função para obter o nome do cartão pelo ID ou objeto
  const getCardName = (despesa: DespesaDTO) => {
    if (despesa.cartao) {
      return despesa.cartao.nome;
    }
    
    if (despesa.cartaoId) {
      const cartao = cartoes.find(card => card.id === despesa.cartaoId);
      return cartao ? cartao.nome : "Cartão não encontrado";
    }
    
    return "-"; // Retorna "-" se não houver cartão
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortDespesas = (despesas: DespesaDTO[]) => {
    return [...despesas].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'descricao':
          comparison = a.descricao.localeCompare(b.descricao);
          break;
        case 'data':
          comparison = new Date(a.data).getTime() - new Date(b.data).getTime();
          break;
        case 'categoria':
          comparison = getCategoryName(a).localeCompare(getCategoryName(b));
          break;
        case 'conta':
          comparison = getAccountName(a).localeCompare(getAccountName(b));
          break;
        case 'cartao':
          comparison = getCardName(a).localeCompare(getCardName(b));
          break;
        case 'valor':
          comparison = a.valor - b.valor;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const SortButton = ({ field, label, className }: { field: SortField; label: string; className?: string }) => {
    const isActive = sortField === field;
    const icon = isActive
      ? sortOrder === 'asc'
        ? <ArrowUp className="ml-2 h-4 w-4" />
        : <ArrowDown className="ml-2 h-4 w-4" />
      : <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;

    return (
      <Button
        variant="ghost"
        className={cn(
          "p-0 h-8 hover:bg-transparent flex items-center justify-between w-full",
          isActive && "text-primary font-medium",
          className
        )}
        onClick={() => handleSort(field)}
      >
        <span>{label}</span>
        {icon}
      </Button>
    );
  };

  const exportarPDF = async () => {
    logger.info(LogModules.DESPESAS, LogActions.EXPORT, { 
      formato: 'PDF',
      mes: mesSelecionado,
      ano: anoSelecionado,
      termo: searchTerm
    });
    
    const doc = new jsPDF();
    
    // Configurar fonte para suportar caracteres especiais
    doc.setFont("helvetica");
    
    // Adicionar título
    doc.setFontSize(20);
    doc.text("Extrato de Despesas", 14, 20);
    
    // Adicionar data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);
    
    if (mesSelecionado && anoSelecionado) {
      doc.text(`Período: ${formatarMesAno(mesSelecionado, anoSelecionado)}`, 14, 40);
    }
    
    // Cabeçalhos da tabela
    let yPosition = 55;
    const lineHeight = 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Descrição", 14, yPosition);
    doc.text("Data", 70, yPosition);
    doc.text("Categoria", 95, yPosition);
    doc.text("Conta", 125, yPosition);
    doc.text("Cartão", 155, yPosition);
    doc.text("Valor", 180, yPosition);
    
    yPosition += lineHeight;
    
    // Linha separadora
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 5;
    
    // Dados das despesas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    const despesasParaExportar = despesasPage?.content || [];
    const despesasOrdenadasExport = sortDespesas(despesasParaExportar);
    
    despesasOrdenadasExport.forEach(despesa => {
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(despesa.descricao.substring(0, 15), 14, yPosition);
      doc.text(formatarData(despesa.data), 70, yPosition);
      doc.text(getCategoryName(despesa).substring(0, 12), 95, yPosition);
      doc.text(getAccountName(despesa).substring(0, 12), 125, yPosition);
      doc.text(getCardName(despesa).substring(0, 12), 155, yPosition);
      doc.text(formatarMoeda(despesa.valor), 180, yPosition);
      
      yPosition += lineHeight;
    });
    
    // Calcular e exibir total
    const total = despesasParaExportar.reduce((sum, despesa) => sum + despesa.valor, 0);
    yPosition += 10;
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${formatarMoeda(total)}`, 150, yPosition);
    
    // Salvar o PDF
    const nomeArquivo = `despesas_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    toast.success("Relatório PDF gerado com sucesso!");
    logger.info(LogModules.DESPESAS, LogActions.EXPORT_SUCCESS, { 
      arquivo: nomeArquivo,
      totalRegistros: despesasParaExportar.length 
    });
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Despesas"
        description="Gerencie suas despesas financeiras"
        action={
          <div className="flex gap-2">
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
            <Button variant="outline" onClick={exportarPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => {
                const termo = e.target.value;
                setSearchTerm(termo);
                setPaginaAtual(0);
                if (termo.length >= 3 || termo.length === 0) {
                  logger.info(LogModules.DESPESAS, 'busca realizada', { termo });
                }
              }}
              className="pl-8"
            />
          </div>

          <Select
            value={mesSelecionado?.toString()}
            onValueChange={(value) => {
              setPaginaAtual(0);
              const novoMes = value === "undefined" ? undefined : parseInt(value);
              setMesSelecionado(novoMes);
              logger.info(LogModules.DESPESAS, LogActions.FILTER_APPLY, { 
                filtro: 'mes', 
                valor: novoMes 
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">Todos os meses</SelectItem>
              {meses.map((mes) => (
                <SelectItem key={mes.valor} value={mes.valor.toString()}>
                  {mes.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={anoSelecionado?.toString()}
            onValueChange={(value) => {
              setPaginaAtual(0);
              const novoAno = value === "undefined" ? undefined : parseInt(value);
              setAnoSelecionado(novoAno);
              logger.info(LogModules.DESPESAS, LogActions.FILTER_APPLY, { 
                filtro: 'ano', 
                valor: novoAno 
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">Todos os anos</SelectItem>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="descricao" label="Descrição" />
              </TableHead>
              <TableHead>
                <SortButton field="data" label="Data" />
              </TableHead>
              <TableHead>
                <SortButton field="categoria" label="Categoria" />
              </TableHead>
              <TableHead>
                <SortButton field="conta" label="Conta" />
              </TableHead>
              <TableHead>
                <SortButton field="cartao" label="Cartão" />
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="valor" label="Valor" className="justify-end" />
              </TableHead>
              <TableHead className="w-[100px]">Parcelas</TableHead>
              <TableHead className="w-[120px]">Prestação Paga</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : !despesasPage?.content || despesasPage.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  Nenhuma despesa encontrada
                </TableCell>
              </TableRow>
            ) : (
              sortDespesas(despesasPage.content).map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>{formatarData(despesa.data)}</TableCell>
                  <TableCell>{getCategoryName(despesa)}</TableCell>
                  <TableCell>{getAccountName(despesa)}</TableCell>
                  <TableCell>{getCardName(despesa)}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatarMoeda(despesa.valor)}
                  </TableCell>
                  <TableCell>
                    {despesa.quantidadeParcelas && despesa.quantidadeParcelas > 1 ? (
                      <span className="text-sm">
                        {despesa.numeroParcela}/{despesa.totalParcelas}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {despesa.cartao ? (
                      <span className={`text-sm font-medium ${despesa.pago ? 'text-green-600' : 'text-red-600'}`}>
                        {despesa.pago ? 'Sim' : 'Não'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(despesa)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(despesa)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {despesasPage && despesasPage.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {despesasPage.content.length} de {despesasPage.totalElements} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(paginaAtual - 1)}
                disabled={paginaAtual === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <div className="text-sm font-medium">
                Página {paginaAtual + 1} de {despesasPage.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(paginaAtual + 1)}
                disabled={paginaAtual === despesasPage.totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de criação/edição de despesa */}
      {isFormOpen && (
        <DespesaForm
          despesa={currentDespesa}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentDespesa && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentDespesa.id && deleteMutation.mutate(currentDespesa.id)}
          title="Excluir Despesa"
          description={`Tem certeza que deseja excluir a despesa "${currentDespesa.descricao}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Despesas;
