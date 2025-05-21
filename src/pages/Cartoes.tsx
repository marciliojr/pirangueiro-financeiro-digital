import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CartoesService, CartaoDTO } from "@/services/cartoes";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, Calendar, CreditCard as CardIcon, FileText } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatarMoeda } from "@/services/api";
import { CartaoForm } from "@/components/cartoes/CartaoForm";
import { ConfirmDialog } from "@/components/cartoes/ConfirmDialog";
import { FaturaModal } from "@/components/cartoes/FaturaModal";
import { Badge } from "@/components/ui/badge";

const Cartoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFaturaModalOpen, setIsFaturaModalOpen] = useState(false);
  const [currentCartao, setCurrentCartao] = useState<CartaoDTO | null>(null);
  const queryClient = useQueryClient();

  // Obter lista de cartões
  const { data: cartoes = [], isLoading } = useQuery({
    queryKey: ["cartoes", searchTerm],
    queryFn: () => searchTerm 
      ? CartoesService.buscarPorNome(searchTerm)
      : CartoesService.listar(),
  });

  // Mutação para excluir cartão
  const deleteMutation = useMutation({
    mutationFn: (id: number) => CartoesService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      toast.success("Cartão excluído com sucesso!");
      setIsDeleteDialogOpen(false);
    },
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["cartoes"] });
  };

  const openCreateForm = () => {
    setCurrentCartao(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (cartao: CartaoDTO) => {
    try {
      console.log('Cartão recebido para edição:', cartao);
      const cartaoAtualizado = await CartoesService.buscarPorId(cartao.id!);
      console.log('Cartão atualizado recebido do backend:', cartaoAtualizado);
      setCurrentCartao(cartaoAtualizado);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Erro ao carregar dados do cartão:', error);
      toast.error("Erro ao carregar dados do cartão");
    }
  };

  const openDeleteDialog = (cartao: CartaoDTO) => {
    setCurrentCartao(cartao);
    setIsDeleteDialogOpen(true);
  };

  const openFaturaModal = (cartao: CartaoDTO) => {
    setCurrentCartao(cartao);
    setIsFaturaModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentCartao(null);
  };

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ["cartoes"] });
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Cartões"
        description="Gerencie seus cartões de crédito"
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
        }
      />

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cartões..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                queryClient.invalidateQueries({ queryKey: ["cartoes"] });
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
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Limite</TableHead>
              <TableHead>Fechamento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Fatura</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : cartoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Nenhum cartão encontrado
                </TableCell>
              </TableRow>
            ) : (
              cartoes.map((cartao) => (
                <TableRow key={cartao.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CardIcon className="h-5 w-5" />
                      {cartao.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(cartao.limite)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dia {cartao.diaFechamento}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dia {cartao.diaVencimento}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => openFaturaModal(cartao)}
                    >
                      <FileText className="h-4 w-4" />
                      Visualizar
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(cartao)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(cartao)}>
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

      {/* Modal de criação/edição de cartão */}
      <CartaoForm
        cartao={currentCartao}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Diálogo de confirmação de exclusão */}
      {isDeleteDialogOpen && currentCartao && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => currentCartao.id && deleteMutation.mutate(currentCartao.id)}
          title="Excluir Cartão"
          description={`Tem certeza que deseja excluir o cartão "${currentCartao.nome}" ? \n*Todas as despesas associadas a este cartão serão removidas.`}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Modal de fatura */}
      {isFaturaModalOpen && currentCartao && (
        <FaturaModal
          cartao={currentCartao}
          isOpen={isFaturaModalOpen}
          onClose={() => setIsFaturaModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Cartoes;
