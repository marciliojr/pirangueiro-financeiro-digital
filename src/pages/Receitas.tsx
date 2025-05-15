import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReceitasService, ReceitaDTO } from "@/services/receitas";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, PiggyBank, FileText, FileDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatarMoeda, formatarData } from "@/services/api";
import { ReceitaForm } from "@/components/receitas/ReceitaForm";
import { ConfirmDialog } from "@/components/receitas/ConfirmDialog";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

type SortField = 'descricao' | 'data' | 'categoria' | 'conta' | 'valor';

const Receitas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReceita, setCurrentReceita] = useState<ReceitaDTO | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' } | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de receitas
  const { data: receitas = [], isLoading } = useQuery({
    queryKey: ["receitas", searchTerm],
    queryFn: () => searchTerm 
      ? ReceitasService.buscarPorDescricao(searchTerm)
      : ReceitasService.listar(),
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
    queryClient.invalidateQueries({ queryKey: ["receitas"] });
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
    
    // Preparar dados para a tabela
    const dadosTabela = receitas.map(receita => [
      receita.descricao,
      formatarData(receita.data),
      getCategoryName(receita),
      getAccountName(receita),
      formatarMoeda(receita.valor)
    ]);
    
    // Configurar e gerar a tabela
    const tableOptions: UserOptions = {
      head: [['Descrição', 'Data', 'Categoria', 'Conta', 'Valor']],
      body: dadosTabela,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }, // Cor verde para receitas
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30, halign: 'right' }
      }
    };
    
    autoTable(doc, tableOptions);
    
    // Adicionar total
    const totalReceitas = receitas.reduce((acc, receita) => acc + receita.valor, 0);
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 40;
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${formatarMoeda(totalReceitas)}`, 170, finalY + 10, { align: "right" });
    
    // Salvar o PDF
    const dataHoje = new Date().toISOString().split('T')[0];
    doc.save(`extrato_Receitas_${dataHoje}.pdf`);
    
    toast.success("Extrato de receitas exportado com sucesso!");
  };

  // Função para ordenar as receitas
  const sortReceitas = (receitas: ReceitaDTO[]) => {
    if (!sortConfig) return receitas;

    return [...receitas].sort((a, b) => {
      if (sortConfig.field === 'descricao') {
        return sortConfig.direction === 'asc'
          ? a.descricao.localeCompare(b.descricao)
          : b.descricao.localeCompare(a.descricao);
      }
      if (sortConfig.field === 'data') {
        return sortConfig.direction === 'asc'
          ? new Date(a.data).getTime() - new Date(b.data).getTime()
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      if (sortConfig.field === 'categoria') {
        const catA = getCategoryName(a);
        const catB = getCategoryName(b);
        return sortConfig.direction === 'asc'
          ? catA.localeCompare(catB)
          : catB.localeCompare(catA);
      }
      if (sortConfig.field === 'conta') {
        const contaA = getAccountName(a);
        const contaB = getAccountName(b);
        return sortConfig.direction === 'asc'
          ? contaA.localeCompare(contaB)
          : contaB.localeCompare(contaA);
      }
      if (sortConfig.field === 'valor') {
        return sortConfig.direction === 'asc'
          ? a.valor - b.valor
          : b.valor - a.valor;
      }
      return 0;
    });
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
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
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
              <TableHead className="text-right">
                <SortButton field="valor" label="Valor" className="justify-end" />
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
              sortReceitas(receitas).map((receita) => (
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
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(receita)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(receita)}>
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
