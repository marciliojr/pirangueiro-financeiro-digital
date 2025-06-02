import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReceitasService, ReceitaDTO } from "@/services/receitas";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, PiggyBank, FileText, FileDown, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatarMoeda, formatarData } from "@/services/api";
import { ReceitaForm } from "@/components/receitas/ReceitaForm";
import { ConfirmDialog } from "@/components/receitas/ConfirmDialog";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortField = 'descricao' | 'data' | 'categoria' | 'conta' | 'valor';

const meses = [
  { valor: "todos", label: "Todos" },
  { valor: "1", label: "Janeiro" },
  { valor: "2", label: "Fevereiro" },
  { valor: "3", label: "Março" },
  { valor: "4", label: "Abril" },
  { valor: "5", label: "Maio" },
  { valor: "6", label: "Junho" },
  { valor: "7", label: "Julho" },
  { valor: "8", label: "Agosto" },
  { valor: "9", label: "Setembro" },
  { valor: "10", label: "Outubro" },
  { valor: "11", label: "Novembro" },
  { valor: "12", label: "Dezembro" }
];

const gerarAnos = () => {
  const anoAtual = new Date().getFullYear();
  const anos = [{ valor: "todos", label: "Todos" }];
  for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
    anos.push({ valor: i.toString(), label: i.toString() });
  }
  return anos;
};

const anos = gerarAnos();

const Receitas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReceita, setCurrentReceita] = useState<ReceitaDTO | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' } | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<number | undefined>(undefined);
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
  const [pagina, setPagina] = useState(0);
  const tamanhoPagina = 20;
  const queryClient = useQueryClient();

  // Obter lista de receitas
  const { data: receitasData = { content: [], totalElements: 0 }, isLoading } = useQuery({
    queryKey: ["receitas", searchTerm, mesSelecionado, anoSelecionado, pagina, sortConfig],
    queryFn: () => ReceitasService.buscarComFiltros({
      descricao: searchTerm,
      mes: mesSelecionado,
      ano: anoSelecionado,
      pagina,
      tamanhoPagina,
      ordenacao: sortConfig?.field,
      direcao: sortConfig?.direction?.toUpperCase() as 'ASC' | 'DESC'
    }),
  });

  const receitas = receitasData.content;
  
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

  // Mutação para excluir receita
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ReceitasService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      toast.success("Receita excluída com sucesso!");
      setIsDeleteDialogOpen(false);
    },
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(0);
    queryClient.invalidateQueries({ queryKey: ["receitas"] });
  };

  const handleMesChange = (value: string) => {
    const mes = value === "todos" ? undefined : parseInt(value);
    setMesSelecionado(mes);
    setPagina(0);
  };

  const handleAnoChange = (value: string) => {
    const ano = value === "todos" ? undefined : parseInt(value);
    setAnoSelecionado(ano);
    setPagina(0);
  };

  const openCreateForm = () => {
    setCurrentReceita(null);
    setIsFormOpen(true);
  };

  const openEditForm = (receita: ReceitaDTO) => {
    setCurrentReceita(receita);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (receita: ReceitaDTO) => {
    setCurrentReceita(receita);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentReceita(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["receitas"] });
    setIsFormOpen(false);
  };
  
  // Função para obter o nome da categoria pelo ID ou objeto
  const getCategoryName = (receita: ReceitaDTO) => {
    if (receita.categoria) {
      return receita.categoria.nome;
    }
    
    if (receita.categoriaId) {
      const categoria = categorias.find(cat => cat.id === receita.categoriaId);
      return categoria ? categoria.nome : "Categoria não encontrada";
    }
    
    return "Categoria não especificada";
  };
  
  // Função para obter o nome da conta pelo ID ou objeto
  const getAccountName = (receita: ReceitaDTO) => {
    if (receita.conta) {
      return receita.conta.nome;
    }
    
    if (receita.contaId) {
      const conta = contas.find(acc => acc.id === receita.contaId);
      return conta ? conta.nome : "Conta não encontrada";
    }
    
    return "-";
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Configurar fonte para suportar caracteres especiais
    doc.setFont("helvetica");
    
    // Adicionar título
    doc.setFontSize(20);
    doc.text("Extrato de Receitas", 14, 20);
    
    // Adicionar data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);
    
    // Cabeçalhos da tabela
    let yPosition = 50;
    const lineHeight = 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Descrição", 14, yPosition);
    doc.text("Data", 80, yPosition);
    doc.text("Categoria", 110, yPosition);
    doc.text("Conta", 150, yPosition);
    doc.text("Valor", 180, yPosition);
    
    yPosition += lineHeight;
    
    // Linha separadora
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 5;
    
    // Dados das receitas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    receitas.forEach(receita => {
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(receita.descricao.substring(0, 20), 14, yPosition);
      doc.text(formatarData(receita.data), 80, yPosition);
      doc.text(getCategoryName(receita).substring(0, 15), 110, yPosition);
      doc.text(getAccountName(receita).substring(0, 15), 150, yPosition);
      doc.text(formatarMoeda(receita.valor), 180, yPosition);
      
      yPosition += lineHeight;
    });
    
    // Calcular e exibir total
    const total = receitas.reduce((sum, receita) => sum + receita.valor, 0);
    yPosition += 10;
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${formatarMoeda(total)}`, 150, yPosition);
    
    // Salvar o PDF
    doc.save(`receitas_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  // Componente para o botão de ordenação
  const SortButton = ({ field, label, className }: { field: SortField; label: string; className?: string }) => {
    const isActive = sortConfig?.field === field;
    const direction = sortConfig?.direction;

    const handleSort = () => {
      if (!isActive) {
        setSortConfig({ field, direction: 'asc' });
      } else {
        setSortConfig({
          field,
          direction: direction === 'asc' ? 'desc' : 'asc'
        });
      }
      setPagina(0);
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-8 flex items-center gap-1 -ml-3", className)}
        onClick={handleSort}
      >
        {label}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </Button>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Receitas"
        description="Gerencie suas receitas financeiras"
        action={
          <div className="flex gap-2">
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
            <Button variant="outline" onClick={exportarPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagina(0);
                queryClient.invalidateQueries({ queryKey: ["receitas"] });
              }}
              className="pl-8"
            />
          </div>

          <div className="w-48">
            <Select value={mesSelecionado?.toString() || "todos"} onValueChange={handleMesChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.valor} value={mes.valor}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select value={anoSelecionado?.toString() || "todos"} onValueChange={handleAnoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano.valor} value={ano.valor}>
                    {ano.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="descricao" label="Descrição" className="p-0 h-8 hover:bg-transparent flex items-center justify-between w-full" />
              </TableHead>
              <TableHead>
                <SortButton field="data" label="Data" className="p-0 h-8 hover:bg-transparent flex items-center justify-between w-full" />
              </TableHead>
              <TableHead>
                <SortButton field="categoria" label="Categoria" className="p-0 h-8 hover:bg-transparent flex items-center justify-between w-full" />
              </TableHead>
              <TableHead>
                <SortButton field="conta" label="Conta" className="p-0 h-8 hover:bg-transparent flex items-center justify-between w-full" />
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="valor" label="Valor" className="p-0 h-8 hover:bg-transparent flex items-center justify-between w-full justify-end" />
              </TableHead>
              <TableHead>Anexo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : receitas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Nenhuma receita encontrada
                </TableCell>
              </TableRow>
            ) : (
              receitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell className="font-medium">{receita.descricao}</TableCell>
                  <TableCell>{formatarData(receita.data)}</TableCell>
                  <TableCell>{getCategoryName(receita)}</TableCell>
                  <TableCell>{getAccountName(receita)}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatarMoeda(receita.valor)}
                  </TableCell>
                  <TableCell>
                    {(receita.anexo || receita.anexoUrl) && (
                      <a 
                        href={receita.anexo || receita.anexoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="sr-only">Ver anexo</span>
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(receita)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(receita)}
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

        {/* Paginação */}
        {receitasData.totalElements > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {receitas.length} de {receitasData.totalElements} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                disabled={pagina === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <div className="text-sm font-medium">
                Página {pagina + 1} de {Math.ceil(receitasData.totalElements / tamanhoPagina)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(p => p + 1)}
                disabled={(pagina + 1) * tamanhoPagina >= receitasData.totalElements}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de criação/edição de receita */}
      {isFormOpen && (
        <ReceitaForm
          receita={currentReceita}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentReceita && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentReceita.id && deleteMutation.mutate(currentReceita.id)}
          title="Excluir Receita"
          description={`Tem certeza que deseja excluir a receita "${currentReceita.descricao}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Receitas;
