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
import { logger, LogModules, LogActions } from "@/utils/logger";

const Contas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConta, setCurrentConta] = useState<ContaDTO | null>(null);
  const [saldos, setSaldos] = useState<Record<number, SaldoContaDTO>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();

  // Log carregamento da página
  useEffect(() => {
    logger.info(LogModules.CONTAS, LogActions.PAGE_LOAD);
  }, []);

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
            logger.debug(LogModules.CONTAS, 'saldo carregado', { contaId: conta.id, saldo: saldo.saldo });
          } catch (error) {
            logger.error(LogModules.CONTAS, LogActions.LOAD_ERROR, { contaId: conta.id, error });
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

  // Função auxiliar para processar imagem
  const processarImagem = (conta: ContaDTO): string | null => {
    if (!conta.id || !conta.imagemLogo || conta.imagemLogo.length === 0) {
      return null;
    }

    try {
      logger.debug(LogModules.CONTAS, 'processando imagem', { contaId: conta.id });
      
      // Verificar se é um array válido
      if (!Array.isArray(conta.imagemLogo)) {
        logger.warn(LogModules.CONTAS, 'imagem inválida', { contaId: conta.id, tipo: typeof conta.imagemLogo });
        return null;
      }

      // Tentar diferentes abordagens
      const abordagens = [
        // Abordagem 1: Uint8Array direto
        () => {
          const bytes = new Uint8Array(conta.imagemLogo!);
          return { bytes, tipo: 'direct' };
        },
        // Abordagem 2: Mapear valores para garantir que são números
        () => {
          const bytes = new Uint8Array(conta.imagemLogo!.map(b => Number(b)));
          return { bytes, tipo: 'mapped' };
        },
        // Abordagem 3: Base64 se os dados vieram como string
        () => {
          if (typeof conta.imagemLogo === 'string') {
            const binaryString = atob(conta.imagemLogo);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return { bytes, tipo: 'base64' };
          }
          throw new Error('Não é string base64');
        }
      ];

      for (const abordagem of abordagens) {
        try {
          const { bytes, tipo } = abordagem();
          
          if (bytes.length === 0) {
            logger.warn(LogModules.CONTAS, 'imagem vazia', { contaId: conta.id, abordagem: tipo });
            continue;
          }

          // Detectar tipo MIME
          let mimeType = 'image/png';
          if (bytes.length >= 4) {
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
              mimeType = 'image/png';
            } else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
              mimeType = 'image/jpeg';
            }
          }

          const blob = new Blob([bytes], { type: mimeType });
          
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            logger.debug(LogModules.CONTAS, 'imagem processada', { 
              contaId: conta.id, 
              abordagem: tipo, 
              mimeType, 
              tamanho: blob.size 
            });
            return url;
          }
        } catch (error) {
          logger.debug(LogModules.CONTAS, 'falha processamento imagem', { contaId: conta.id, abordagem: abordagem.name });
        }
      }

      logger.warn(LogModules.CONTAS, 'todas abordagens falharam', { contaId: conta.id });
      return null;
    } catch (error) {
      logger.error(LogModules.CONTAS, 'erro processar imagem', { contaId: conta.id, error });
      return null;
    }
  };

  // Gerenciar URLs das imagens
  useEffect(() => {
    const newImageUrls: Record<number, string> = {};
    
    logger.debug(LogModules.CONTAS, 'carregando imagens', { totalContas: contas.length });
    
    contas.forEach(conta => {
      if (conta.id && conta.imagemLogo && conta.imagemLogo.length > 0) {
        const url = processarImagem(conta);
        if (url) {
          newImageUrls[conta.id] = url;
        }
      }
    });

    logger.debug(LogModules.CONTAS, 'imagens carregadas', { totalImagens: Object.keys(newImageUrls).length });
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
    mutationFn: (id: number) => {
      logger.info(LogModules.CONTAS, LogActions.DELETE, { contaId: id });
      return ContasService.excluir(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      logger.info(LogModules.CONTAS, LogActions.DELETE_SUCCESS);
    },
    onError: (error) => {
      logger.error(LogModules.CONTAS, LogActions.DELETE_ERROR, { error });
    }
  });

  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["contas"] });
    logger.info(LogModules.CONTAS, 'busca realizada', { termo: searchTerm });
  };

  const openCreateForm = () => {
    setCurrentConta(null);
    setIsFormOpen(true);
    logger.info(LogModules.CONTAS, 'formulário de criação aberto');
  };

  const openEditForm = (conta: ContaDTO) => {
    setCurrentConta(conta);
    setIsFormOpen(true);
    logger.info(LogModules.CONTAS, 'formulário de edição aberto', { contaId: conta.id, nome: conta.nome });
  };

  const openDeleteDialog = (conta: ContaDTO) => {
    setCurrentConta(conta);
    setIsDeleteDialogOpen(true);
    logger.info(LogModules.CONTAS, 'diálogo de exclusão aberto', { contaId: conta.id, nome: conta.nome });
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                queryClient.invalidateQueries({ queryKey: ["contas"] });
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
                            onLoad={() => logger.debug(LogModules.CONTAS, 'imagem exibida', { contaId: conta.id })}
                            onError={() => logger.warn(LogModules.CONTAS, 'erro exibir imagem', { 
                              contaId: conta.id, 
                              url: imageUrls[conta.id!] 
                            })}
                          />
                        ) : (
                          <AvatarFallback>{conta.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{conta.nome}</TableCell>
                    <TableCell>{conta.tipo}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {formatarMoeda(saldoConta.totalReceitas)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingDown className="h-4 w-4" />
                        {formatarMoeda(saldoConta.totalDespesas)}
                      </div>
                    </TableCell>
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
