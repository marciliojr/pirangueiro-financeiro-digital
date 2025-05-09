import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReceitasService, ReceitaDTO } from "@/services/receitas";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, PiggyBank, FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatarMoeda, formatarData } from "@/services/api";
import { ReceitaForm } from "@/components/receitas/ReceitaForm";
import { ConfirmDialog } from "@/components/receitas/ConfirmDialog";

const Receitas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReceita, setCurrentReceita] = useState<ReceitaDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de receitas
  const { data: receitas = [], isLoading } = useQuery({
    queryKey: ["receitas", searchTerm],
    queryFn: () => searchTerm 
      ? ReceitasService.buscarPorDescricao(searchTerm)
      : ReceitasService.listar(),
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

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Receitas"
        description="Gerencie suas receitas financeiras"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
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
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
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
                  <TableCell>{receita.categoriaId}</TableCell>
                  <TableCell>{receita.contaId}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatarMoeda(receita.valor)}
                  </TableCell>
                  <TableCell>
                    {receita.anexoUrl && (
                      <a 
                        href={receita.anexoUrl} 
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
