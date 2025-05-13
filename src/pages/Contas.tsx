import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContasService, ContaDTO, SaldoContaDTO } from "@/services/contas";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash, Upload, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatarMoeda } from "@/services/api";
import { ContaForm } from "@/components/contas/ContaForm";
import { ConfirmDialog } from "@/components/contas/ConfirmDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Contas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConta, setCurrentConta] = useState<ContaDTO | null>(null);
  const [saldos, setSaldos] = useState<Record<number, SaldoContaDTO>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();

  // Obter lista de contas
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas", searchTerm],
    queryFn: () => searchTerm 
      ? ContasService.buscarPorNome(searchTerm)
      : ContasService.listar(),
  });

  // Buscar saldos das contas
  useEffect(() => {
    const buscarSaldos = async () => {
      const saldosTemp: Record<number, SaldoContaDTO> = {};
      for (const conta of contas) {
        if (conta.id) {
          try {
            const saldo = await ContasService.buscarSaldo(conta.id);
            saldosTemp[conta.id] = saldo;
          } catch (error) {
            console.error(`Erro ao buscar saldo da conta ${conta.id}:`, error);
            // Criar um objeto SaldoContaDTO vazio em caso de erro
            saldosTemp[conta.id] = {
              contaId: conta.id,
              nomeConta: conta.nome,
              totalReceitas: 0,
              totalDespesas: 0,
              saldo: 0,
              mes: null,
              ano: null
            };
          }
        }
      }
      setSaldos(saldosTemp);
    };

    if (contas.length > 0) {
      buscarSaldos();
    }
  }, [contas]);

  // Gerenciar URLs das imagens
  useEffect(() => {
    const newImageUrls: Record<number, string> = {};
    
    contas.forEach(conta => {
      if (conta.id && conta.imagemLogo && conta.imagemLogo.length > 0) {
        try {
          // Converter o array de bytes em uma string base64
          const bytes = new Uint8Array(conta.imagemLogo);
          const blob = new Blob([bytes], { type: 'image/png' });
          newImageUrls[conta.id] = URL.createObjectURL(blob);
        } catch (error) {
          console.error('Erro ao converter imagem da conta:', error);
        }
      }
    });

    setImageUrls(newImageUrls);

    // Cleanup function
    return () => {
      Object.values(newImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [contas]);

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
              <TableHead className="text-right">Receitas</TableHead>
              <TableHead className="text-right">Despesas</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
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
            ) : contas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Nenhuma conta encontrada
                </TableCell>
              </TableRow>
            ) : (
              contas.map((conta) => {
                const saldoConta = saldos[conta.id!] || {
                  contaId: conta.id!,
                  nomeConta: conta.nome,
                  totalReceitas: 0,
                  totalDespesas: 0,
                  saldo: 0,
                  mes: null,
                  ano: null
                };

                return (
                  <TableRow key={conta.id}>
                    <TableCell>
                      <Avatar>
                        {conta.id && imageUrls[conta.id] ? (
                          <AvatarImage 
                            src={imageUrls[conta.id]}
                            alt={conta.nome}
                          />
                        ) : (
                          <AvatarFallback>{conta.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{conta.nome}</TableCell>
                    <TableCell>{conta.tipo}</TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableCell className="text-right font-medium text-green-600">
                            <div className="flex items-center justify-end gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {formatarMoeda(saldoConta.totalReceitas)}
                            </div>
                          </TableCell>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total de Receitas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableCell className="text-right font-medium text-red-600">
                            <div className="flex items-center justify-end gap-1">
                              <TrendingDown className="h-4 w-4" />
                              {formatarMoeda(saldoConta.totalDespesas)}
                            </div>
                          </TableCell>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total de Despesas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TableCell className={`text-right font-medium ${saldoConta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarMoeda(saldoConta.saldo)}
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
                );
              })
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
