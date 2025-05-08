
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContasService, ContaDTO } from "@/services/contas";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, Upload } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatarMoeda } from "@/services/api";
import { ContaForm } from "@/components/contas/ContaForm";
import { ConfirmDialog } from "@/components/contas/ConfirmDialog";

const Contas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConta, setCurrentConta] = useState<ContaDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de contas
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas", searchTerm],
    queryFn: () => searchTerm 
      ? ContasService.buscarPorNome(searchTerm)
      : ContasService.listar(),
  });

  // Mutação para excluir conta
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ContasService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta excluída com sucesso!");
      setIsDeleteDialogOpen(false);
    },
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["contas"] });
  };

  const openCreateForm = () => {
    setCurrentConta(null);
    setIsFormOpen(true);
  };

  const openEditForm = (conta: ContaDTO) => {
    setCurrentConta(conta);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (conta: ContaDTO) => {
    setCurrentConta(conta);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentConta(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["contas"] });
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Contas"
        description="Gerencie suas contas financeiras"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        }
      />

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar contas..."
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
              <TableHead>Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
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
            ) : contas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhuma conta encontrada
                </TableCell>
              </TableRow>
            ) : (
              contas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell>
                    <Avatar>
                      {conta.imagemUrl ? (
                        <AvatarImage src={conta.imagemUrl} alt={conta.nome} />
                      ) : (
                        <AvatarFallback>{conta.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{conta.nome}</TableCell>
                  <TableCell>{conta.tipo}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(conta.saldoAtual)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(conta)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(conta)}>
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

      {/* Modal de criação/edição de conta */}
      {isFormOpen && (
        <ContaForm
          conta={currentConta}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentConta && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentConta.id && deleteMutation.mutate(currentConta.id)}
          title="Excluir Conta"
          description={`Tem certeza que deseja excluir a conta "${currentConta.nome}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Contas;
