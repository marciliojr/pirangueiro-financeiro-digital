import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DespesasService, DespesaDTO } from "@/services/despesas";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { CartoesService } from "@/services/cartoes";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatarMoeda, formatarData } from "@/services/api";
import { DespesaForm } from "@/components/despesas/DespesaForm";
import { ConfirmDialog } from "@/components/despesas/ConfirmDialog";

const Despesas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDespesa, setCurrentDespesa] = useState<DespesaDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de despesas
  const { data: despesas = [], isLoading } = useQuery({
    queryKey: ["despesas", searchTerm],
    queryFn: () => searchTerm 
      ? DespesasService.buscarPorDescricao(searchTerm)
      : DespesasService.listar(),
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
    mutationFn: (id: number) => DespesasService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa excluída com sucesso!");
      setIsDeleteDialogOpen(false);
    },
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["despesas"] });
  };

  const openCreateForm = () => {
    setCurrentDespesa(null);
    setIsFormOpen(true);
  };

  const openEditForm = (despesa: DespesaDTO) => {
    setCurrentDespesa(despesa);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (despesa: DespesaDTO) => {
    setCurrentDespesa(despesa);
    setIsDeleteDialogOpen(true);
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
    
    return "Conta não especificada";
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

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Despesas"
        description="Gerencie suas despesas financeiras"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        }
      />

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar despesas..."
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
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Cartão</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Anexo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : despesas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  Nenhuma despesa encontrada
                </TableCell>
              </TableRow>
            ) : (
              despesas.map((despesa) => (
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
                    {(despesa.anexo || despesa.anexoUrl) && (
                      <a 
                        href={despesa.anexo || despesa.anexoUrl} 
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
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(despesa)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(despesa)}>
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
