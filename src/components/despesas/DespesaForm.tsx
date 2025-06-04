import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DespesasService, DespesaDTO, converterArquivoParaByteArray } from "@/services/despesas";
import { CartoesService } from "@/services/cartoes";
import { ContaDTO } from "@/services/contas";
import { CategoriaDTO } from "@/services/categorias";
import { formatarData, formatarMoeda, formatarValorMonetario } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UppercaseInput } from "@/components/ui/uppercase-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UppercaseTextarea } from "@/components/ui/uppercase-textarea";
import { Upload, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoriasService } from "@/services/categorias";
import { ContasService } from "@/services/contas";
import { CartaoDTO } from "@/services/cartoes";

interface DespesaFormProps {
  despesa: DespesaDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface Categoria {
  id: number;
  nome: string;
}

interface Conta {
  id: number;
  nome: string;
}

interface Cartao {
  id: number;
  nome: string;
}

export function DespesaForm({ despesa, isOpen, onClose, onSubmit }: DespesaFormProps) {
  const [formData, setFormData] = useState<DespesaDTO>({
    id: despesa?.id || undefined,
    descricao: despesa?.descricao || "",
    valor: despesa?.valor || 0,
    data: despesa?.data || format(new Date(), "yyyy-MM-dd"),
    categoriaId: despesa?.categoriaId || despesa?.categoria?.id,
    contaId: despesa?.contaId || despesa?.conta?.id,
    cartaoId: despesa?.cartaoId || undefined,
    anexoUrl: despesa?.anexoUrl || "",
    observacao: despesa?.observacao || "",
    quantidadeParcelas: despesa?.quantidadeParcelas || 1,
    pago: despesa?.pago || false
  });
  const [valorFormatado, setValorFormatado] = useState(formData.valor ? formatarValorMonetario(formData.valor.toString()) : '0,00');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Buscar categorias e contas para os selects
  const { data: categorias = [] } = useQuery<CategoriaDTO[]>({
    queryKey: ["categorias-despesas"],
    queryFn: () => CategoriasService.listarDespesas(),
  });

  const { data: contas = [] } = useQuery<ContaDTO[]>({
    queryKey: ["contas"],
    queryFn: () => ContasService.listar(),
  });

  const { data: cartoes = [] } = useQuery<CartaoDTO[]>({
    queryKey: ["cartoes"],
    queryFn: () => CartoesService.listar(),
  });

  const createMutation = useMutation({
    mutationFn: (data: DespesaDTO) => {
      const despesaData = {
        ...data,
        conta: data.contaId ? contas.find(c => c.id === data.contaId) : undefined,
        categoria: data.categoriaId ? categorias.find(c => c.id === data.categoriaId) : undefined,
        cartao: data.cartaoId ? cartoes.find(c => c.id === data.cartaoId) : undefined
      };
      return DespesasService.criar(despesaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa criada com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DespesaDTO) => {
      const despesaData = {
        ...data,
        conta: data.contaId ? contas.find(c => c.id === data.contaId) : undefined,
        categoria: data.categoriaId ? categorias.find(c => c.id === data.categoriaId) : undefined,
        cartao: data.cartaoId ? cartoes.find(c => c.id === data.cartaoId) : undefined
      };
      return DespesasService.atualizar(despesaData.id!, despesaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa atualizada com sucesso!");
      onSubmit();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "valor") {
      // Não fazemos nada aqui, pois o valor é tratado no handleValorChange
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    
    // Converte para número considerando os centavos
    const valorNumerico = Number(valor) / 100;
    
    // Formata o valor para exibição
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorNumerico);

    setValorFormatado(valorFormatado);
    setFormData(prev => ({ ...prev, valor: valorNumerico }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (value === "null") {
      // Se o valor for "null" (string), definimos como undefined
      setFormData({
        ...formData,
        [name]: undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.categoriaId) {
      toast.error("É necessário selecionar uma categoria");
      return;
    }

    if (!formData.contaId && !formData.cartaoId) {
      toast.error("É necessário selecionar uma conta ou um cartão");
      return;
    }
    
    try {
      setIsUploading(true);
      const updatedFormData = { ...formData };
      
      // Remove o campo quantidadeParcelas se for 1
      if (updatedFormData.quantidadeParcelas === 1) {
        delete updatedFormData.quantidadeParcelas;
      }
      
      // Se um arquivo foi selecionado, converter para byte array
      if (file) {
        const anexoByteArray = await converterArquivoParaByteArray(file);
        updatedFormData.anexo = anexoByteArray;
      }
      
      if (despesa?.id) {
        updateMutation.mutate(updatedFormData);
      } else {
        createMutation.mutate(updatedFormData);
      }
    } catch (error) {
      toast.error("Erro ao salvar despesa");
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  useEffect(() => {
    if (despesa) {
      setFormData({
        ...despesa,
        categoriaId: despesa.categoria?.id || despesa.categoriaId,
        contaId: despesa.conta?.id || despesa.contaId,
        cartaoId: despesa.cartao?.id || despesa.cartaoId,
        anexoUrl: despesa.anexoUrl || "",
      });
      // Formata o valor corretamente
      setValorFormatado(formatarValorMonetario((despesa.valor * 100).toFixed(0)));
    }
  }, [despesa]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da despesa abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <UppercaseInput
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="valor"
                  name="valor"
                  value={valorFormatado}
                  onChange={handleValorChange}
                  className="pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoriaId">Categoria</Label>
              <Select 
                value={formData.categoriaId ? String(formData.categoriaId) : undefined}
                onValueChange={(value) => handleSelectChange("categoriaId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={String(categoria.id!)}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contaId">Conta</Label>
              <Select 
                value={formData.contaId ? String(formData.contaId) : "none"} 
                onValueChange={(value) => {
                  if (value === "none") {
                    setFormData(prev => ({ ...prev, contaId: undefined }));
                  } else {
                    setFormData(prev => ({ ...prev, contaId: parseInt(value), cartaoId: undefined }));
                  }
                }}
                disabled={formData.cartaoId !== undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={String(conta.id)}>
                      {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cartaoId">Cartão</Label>
              <Select 
                value={formData.cartaoId ? String(formData.cartaoId) : "none"} 
                onValueChange={(value) => {
                  if (value === "none") {
                    setFormData(prev => ({ ...prev, cartaoId: undefined }));
                  } else {
                    setFormData(prev => ({ ...prev, cartaoId: parseInt(value), contaId: undefined }));
                  }
                }}
                disabled={formData.contaId !== undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {cartoes.map((cartao) => (
                    <SelectItem key={cartao.id} value={String(cartao.id)}>
                      {cartao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de quantidade de parcelas - mostrar apenas no cadastro quando cartão selecionado */}
            {formData.cartaoId && !despesa?.id && (
              <div className="space-y-2">
                <Label htmlFor="quantidadeParcelas">Quantidade de Parcelas</Label>
                <Input
                  id="quantidadeParcelas"
                  name="quantidadeParcelas"
                  type="number"
                  min="1"
                  value={formData.quantidadeParcelas}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      quantidadeParcelas: value >= 1 ? value : 1
                    }));
                  }}
                  placeholder="1"
                />
              </div>
            )}

            {/* Campo de quantidade de parcelas - mostrar na edição quando tem cartão */}
            {formData.cartaoId && despesa?.id && (
              <div className="space-y-2">
                <Label htmlFor="quantidadeParcelas">Quantidade de Parcelas</Label>
                <Input
                  id="quantidadeParcelas"
                  name="quantidadeParcelas"
                  type="number"
                  min="1"
                  value={formData.quantidadeParcelas}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      quantidadeParcelas: value >= 1 ? value : 1
                    }));
                  }}
                  placeholder="1"
                  disabled
                />
              </div>
            )}

            {/* Campo de prestação paga - mostrar apenas na edição quando tem cartão */}
            {formData.cartaoId && despesa?.id && (
              <div className="space-y-2">
                <Label htmlFor="pago">Prestação Paga</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pago"
                    name="pago"
                    checked={formData.pago}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        pago: e.target.checked
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Marcar como paga</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="anexo">Anexo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="anexo"
                name="anexo"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="anexo"
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Escolher arquivo</span>
              </Label>
              {file && <span className="text-sm text-gray-600">{file.name}</span>}
              {!file && formData.anexoUrl && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <a 
                    href={formData.anexoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Ver anexo atual
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <UppercaseTextarea
              id="observacao"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Observações sobre esta despesa (opcional)"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 