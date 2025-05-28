import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReceitasService, ReceitaDTO } from "@/services/receitas";
import { CategoriasService, CategoriaDTO } from "@/services/categorias";
import { ContasService, ContaDTO } from "@/services/contas";
import { uploadArquivo, formatarData, formatarMoeda, formatarValorMonetario } from "@/services/api";
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

interface ReceitaFormProps {
  receita: ReceitaDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReceitaForm({ receita, isOpen, onClose, onSubmit }: ReceitaFormProps) {
  const [formData, setFormData] = useState<ReceitaDTO>({
    id: receita?.id || undefined,
    descricao: receita?.descricao || "",
    valor: receita?.valor || 0,
    data: receita?.data || format(new Date(), "yyyy-MM-dd"),
    categoriaId: receita?.categoriaId || receita?.categoria?.id,
    contaId: receita?.contaId || receita?.conta?.id,
    anexoUrl: receita?.anexoUrl || receita?.anexo || "",
    observacao: receita?.observacao || ""
  });
  const [valorFormatado, setValorFormatado] = useState(formData.valor ? formatarValorMonetario(formData.valor.toString()) : '0,00');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Buscar categorias e contas para os selects
  const { data: categorias = [] } = useQuery<CategoriaDTO[]>({
    queryKey: ["categorias-receitas"],
    queryFn: () => CategoriasService.listarReceitas(),
  });

  const { data: contas = [] } = useQuery<ContaDTO[]>({
    queryKey: ["contas"],
    queryFn: () => ContasService.listar(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ReceitaDTO) => {
      const receitaData = {
        ...data,
        conta: data.contaId ? contas.find(c => c.id === data.contaId) : undefined,
        categoria: data.categoriaId ? categorias.find(c => c.id === data.categoriaId) : undefined
      };
      return ReceitasService.criar(receitaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      toast.success("Receita criada com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ReceitaDTO) => {
      const receitaData = {
        ...data,
        conta: data.contaId ? contas.find(c => c.id === data.contaId) : undefined,
        categoria: data.categoriaId ? categorias.find(c => c.id === data.categoriaId) : undefined
      };
      return ReceitasService.atualizar(data.id!, receitaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      toast.success("Receita atualizada com sucesso!");
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
    if (!value || value === "null" || value === "") {
      setFormData(prev => ({
        ...prev,
        [name]: undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
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
    
    if (!formData.categoriaId) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }

    if (!formData.contaId) {
      toast.error("Por favor, selecione uma conta");
      return;
    }

    try {
      setIsUploading(true);
      let anexoUrl = formData.anexoUrl;

      if (file) {
        anexoUrl = await uploadArquivo(file);
      }

      const receitaData = {
        ...formData,
        anexoUrl,
        valor: Number(valorFormatado.replace(/\D/g, "")) / 100,
      };

      if (receita?.id) {
        await updateMutation.mutateAsync(receitaData);
      } else {
        await createMutation.mutateAsync(receitaData);
      }
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      toast.error("Erro ao salvar receita");
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  // useEffect para atualizar os dados quando a receita muda
  useEffect(() => {
    if (receita) {
      setFormData({
        id: receita.id,
        descricao: receita.descricao,
        valor: receita.valor,
        data: receita.data,
        categoriaId: receita.categoria?.id || receita.categoriaId,
        contaId: receita.conta?.id || receita.contaId,
        anexoUrl: receita.anexoUrl || receita.anexo || "",
        observacao: receita.observacao || ""
      });
      // Formata o valor corretamente multiplicando por 100 para converter para centavos
      setValorFormatado(formatarValorMonetario((receita.valor * 100).toFixed(0)));
    }
  }, [receita]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{receita ? "Editar Receita" : "Nova Receita"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da receita abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              value={formData.contaId ? String(formData.contaId) : undefined}
              onValueChange={(value) => handleSelectChange("contaId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((conta) => (
                  <SelectItem key={conta.id} value={String(conta.id!)}>
                    {conta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              placeholder="Observações sobre esta receita (opcional)"
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