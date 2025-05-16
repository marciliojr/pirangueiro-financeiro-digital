import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoriasService, CategoriaDTO } from "@/services/categorias";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CategoriaForm } from "@/components/categorias/CategoriaForm";
import { ConfirmDialog } from "@/components/categorias/ConfirmDialog";

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<CategoriaDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de categorias
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias", searchTerm],
    queryFn: () => searchTerm 
      ? CategoriasService.buscarPorNome(searchTerm)
      : CategoriasService.listar(),
  });

  // Mutação para excluir categoria
  const deleteMutation = useMutation({
    mutationFn: (id: number) => CategoriasService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria excluída com sucesso!");
      setIsDeleteDialogOpen(false);
    },
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["categorias"] });
  };

  const openCreateForm = () => {
    setCurrentCategoria(null);
    setIsFormOpen(true);
  };

  const openEditForm = (categoria: CategoriaDTO) => {
    setCurrentCategoria(categoria);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (categoria: CategoriaDTO) => {
    setCurrentCategoria(categoria);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentCategoria(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["categorias"] });
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Categorias"
        description="Gerencie suas categorias de receitas e despesas"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        }
      />

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                queryClient.invalidateQueries({ queryKey: ["categorias"] });
              }}
              className="pl-8"
            />
          </div>
        </form>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ícone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : categorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhuma categoria encontrada
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: categoria.cor }}
                    >
                      {categoria.imagemCategoria ? (
                        <img 
                          src={categoria.imagemCategoria} 
                          alt={categoria.nome}
                          className="w-6 h-6"
                        />
                      ) : (
                        categoria.nome.substring(0, 1).toUpperCase()
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${categoria.tipoReceita ? 'text-green-600' : 'text-red-600'}`}>
                      {categoria.tipoReceita ? "Receita" : "Despesa"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.cor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(categoria)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(categoria)}>
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

      {/* Modal de criação/edição de categoria */}
      {isFormOpen && (
        <CategoriaForm
          categoria={currentCategoria}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentCategoria && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentCategoria.id && deleteMutation.mutate(currentCategoria.id)}
          title="Excluir Categoria"
          description={`Tem certeza que deseja excluir a categoria "${currentCategoria.nome}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Categorias;
