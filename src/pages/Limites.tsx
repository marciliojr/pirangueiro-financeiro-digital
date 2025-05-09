import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LimitesService, LimiteGastosDTO } from "@/services/limites";
import { CategoriasService } from "@/services/categorias";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, SlidersHorizontal } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LimiteForm } from "@/components/limites/LimiteForm";
import { ConfirmDialog } from "@/components/limites/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const Limites = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLimite, setCurrentLimite] = useState<LimiteGastosDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de limites
  const { data: limites = [], isLoading } = useQuery({
    queryKey: ["limites", searchTerm],
    queryFn: () => searchTerm 
      ? LimitesService.buscarPorDescricao(searchTerm)
      : LimitesService.listar(),
  });

  // Obter categorias para exibir os nomes
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => CategoriasService.listar(),
  });

  // Mutação para excluir limite
  const deleteMutation = useMutation({
    mutationFn: (id: number) => LimitesService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites"] });
      toast.success("Limite de gastos excluído com sucesso!");
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Erro ao excluir limite de gastos");
    }
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["limites"] });
  };

  const openCreateForm = () => {
    setCurrentLimite(null);
    setIsFormOpen(true);
  };

  const openEditForm = (limite: LimiteGastosDTO) => {
    setCurrentLimite(limite);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (limite: LimiteGastosDTO) => {
    setCurrentLimite(limite);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentLimite(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["limites"] });
    setIsFormOpen(false);
  };

  // Função para obter o nome da categoria pelo ID
  const getCategoryName = (categoriaId: number) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nome : "Categoria não encontrada";
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Limites de Gastos"
        description="Gerencie seus limites de gastos por categoria"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Limite
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor Limite</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : limites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Nenhum limite de gastos encontrado
                </TableCell>
              </TableRow>
            ) : (
              limites.map((limite) => (
                <TableRow key={limite.id}>
                  <TableCell className="font-medium">{limite.descricao}</TableCell>
                  <TableCell>{getCategoryName(limite.categoriaId)}</TableCell>
                  <TableCell>{formatCurrency(limite.valorLimite)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(limite)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(limite)}>
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

      {/* Modal de criação/edição de limite */}
      {isFormOpen && (
        <LimiteForm
          limite={currentLimite}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentLimite && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentLimite.id && deleteMutation.mutate(currentLimite.id)}
          title="Excluir Limite de Gastos"
          description={`Tem certeza que deseja excluir o limite "${currentLimite.descricao}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Limites;
