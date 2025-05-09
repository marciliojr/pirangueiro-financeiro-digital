import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DespesasService, DespesaDTO } from "@/services/despesas";
import { uploadArquivo, formatarData, formatarMoeda } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function DespesaForm({ despesa, isOpen, onClose, onSubmit }: DespesaFormProps) {
  const [formData, setFormData] = useState<DespesaDTO>({
    id: despesa?.id || undefined,
    descricao: despesa?.descricao || "",
    valor: despesa?.valor || 0,
    data: despesa?.data || format(new Date(), "yyyy-MM-dd"),
    categoriaId: despesa?.categoriaId || 1,
    contaId: despesa?.contaId || 1,
    anexoUrl: despesa?.anexoUrl || ""
  });
  const [valorFormatado, setValorFormatado] = useState(formData.valor ? formData.valor.toFixed(2).replace('.', ',') : '0,00');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Buscar categorias e contas para os selects
  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: async () => {
      const response = await fetch("/api/categorias");
      return response.json();
    },
  });

  const { data: contas = [] } = useQuery<Conta[]>({
    queryKey: ["contas"],
    queryFn: async () => {
      const response = await fetch("/api/contas");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DespesaDTO) => DespesasService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa criada com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DespesaDTO) => {
      if (!data.id) throw new Error("ID não fornecido para atualização");
      return DespesasService.atualizar(data.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa atualizada com sucesso!");
      onSubmit();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const value = e.target.value;
    
    // Remove tudo exceto números e vírgula
    let valorLimpo = value.replace(/[^\d,]/g, '');
    
    // Garante que há no máximo uma vírgula
    const partes = valorLimpo.split(',');
    if (partes.length > 2) {
      valorLimpo = partes[0] + ',' + partes[1];
    }
    
    // Formata o valor
    setValorFormatado(valorLimpo);
    
    // Atualiza o formData com o valor numérico
    const valorNumerico = parseFloat(valorLimpo.replace(',', '.')) || 0;
    setFormData({
      ...formData,
      valor: valorNumerico
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: parseInt(value)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedFormData = { ...formData };
      
      // Upload de arquivo, se selecionado
      if (file) {
        setIsUploading(true);
        const anexoUrl = await uploadArquivo(file);
        updatedFormData.anexoUrl = anexoUrl;
        setIsUploading(false);
      }
      
      if (despesa?.id) {
        updateMutation.mutate(updatedFormData);
      } else {
        createMutation.mutate(updatedFormData);
      }
    } catch (error) {
      toast.error("Erro ao salvar despesa");
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
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
              value={String(formData.categoriaId)} 
              onValueChange={(value) => handleSelectChange("categoriaId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={String(categoria.id)}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contaId">Conta</Label>
            <Select 
              value={String(formData.contaId)} 
              onValueChange={(value) => handleSelectChange("contaId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((conta) => (
                  <SelectItem key={conta.id} value={String(conta.id)}>
                    {conta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="anexo">Anexo</Label>
            
            {formData.anexoUrl && (
              <div className="mb-2 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <a 
                  href={formData.anexoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Ver anexo atual
                </a>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("anexo")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Arquivo
              </Button>
              <Input
                id="anexo"
                name="anexo"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              {file && <span className="text-sm">{file.name}</span>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {despesa ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 