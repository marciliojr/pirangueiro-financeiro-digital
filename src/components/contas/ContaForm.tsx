import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContasService, ContaDTO, TipoConta } from "@/services/contas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UppercaseInput } from "@/components/ui/uppercase-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, X as XIcon } from "lucide-react";

interface ContaFormProps {
  conta: ContaDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ContaForm({ conta, isOpen, onClose, onSubmit }: ContaFormProps) {
  const [formData, setFormData] = useState<ContaDTO>({
    id: conta?.id || undefined,
    nome: conta?.nome || "",
    tipo: conta?.tipo || TipoConta.CORRENTE,
    imagemLogo: conta?.imagemLogo
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const queryClient = useQueryClient();

  useEffect(() => {
    // Quando a conta mudar, atualizar o preview se houver imagemLogo
    if (conta?.imagemLogo && conta.imagemLogo.length > 0) {
      try {
        // Converter o array de bytes em Blob
        const bytes = new Uint8Array(conta.imagemLogo);
        const blob = new Blob([bytes], { type: 'image/png' });
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        
        // Atualizar o formData com a imagem atual
        setFormData(prev => ({
          ...prev,
          imagemLogo: conta.imagemLogo
        }));
      } catch (error) {
        console.error('Erro ao criar preview da imagem:', error);
        toast.error('Erro ao carregar a imagem da conta');
      }
    } else {
      setPreviewUrl("");
      // Limpar imagemLogo do formData
      setFormData(prev => ({
        ...prev,
        imagemLogo: undefined
      }));
    }

    return () => {
      // Limpar URL do objeto quando o componente for desmontado ou a conta mudar
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [conta]);

  const createMutation = useMutation({
    mutationFn: (data: { conta: ContaDTO; file: File | null }) => {
      return ContasService.criar(data.conta, data.file || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta criada com sucesso!");
      onSubmit();
      limparFormulario();
    },
    onError: (error: Error) => {
      console.error("Erro ao criar conta:", error);
      toast.error(error.message || "Erro ao criar conta");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { conta: ContaDTO; file: File | null }) => {
      if (!data.conta.id) throw new Error("ID não fornecido para atualização");
      return ContasService.atualizar(data.conta.id, data.conta, data.file || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta atualizada com sucesso!");
      onSubmit();
      limparFormulario();
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar conta:", error);
      toast.error(error.message || "Erro ao atualizar conta");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipo: value as TipoConta
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      try {
        // Validar o arquivo usando o serviço
        ContasService.validarImagem(selectedFile);

        // Converter o arquivo para array de bytes
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Atualizar o formData com o novo array de bytes
        setFormData(prev => ({
          ...prev,
          imagemLogo: Array.from(bytes)
        }));

        setFile(selectedFile);
        
        // Criar URL temporária para preview
        const blob = new Blob([bytes], { type: selectedFile.type });
        const objectUrl = URL.createObjectURL(blob);
        
        // Limpar URL anterior se existir
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        
        setPreviewUrl(objectUrl);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Erro ao processar a imagem');
        }
        // Limpar o input de arquivo
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setFile(null);
    setFormData(prev => ({
      ...prev,
      imagemLogo: undefined
    }));
  };

  const limparFormulario = () => {
    setFormData({
      nome: "",
      tipo: TipoConta.CORRENTE,
      imagemLogo: undefined
    });
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      toast.error("O nome da conta é obrigatório");
      return;
    }

    if (!formData.tipo) {
      toast.error("O tipo da conta é obrigatório");
      return;
    }
    
    try {
      setIsUploading(true);
      
      if (conta?.id) {
        await updateMutation.mutateAsync({ conta: formData, file });
      } else {
        await createMutation.mutateAsync({ conta: formData, file });
      }
    } catch (error) {
      // Erros já são tratados nas mutations
      console.error("Erro ao salvar conta:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{conta ? "Editar Conta" : "Nova Conta"}</DialogTitle>
          <DialogDescription>
            {conta ? "Edite os dados da conta selecionada." : "Preencha os dados para criar uma nova conta."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <UppercaseInput
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Conta</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={handleTipoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoConta.CORRENTE}>CONTA CORRENTE</SelectItem>
                <SelectItem value={TipoConta.DIGITAL}>DIGITAL</SelectItem>
                <SelectItem value={TipoConta.INVESTIMENTO}>INVESTIMENTO</SelectItem>
                <SelectItem value={TipoConta.POUPANCA}>POUPANÇA</SelectItem>
                <SelectItem value={TipoConta.SALARIO}>SALÁRIO</SelectItem>
                <SelectItem value={TipoConta.CARTEIRA}>CARTEIRA</SelectItem>
                <SelectItem value={TipoConta.OUTRO}>OUTRO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imagem">Logo da Conta</Label>
            
            {previewUrl && (
              <div className="relative inline-block mb-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-md" 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("imagem")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Arquivo
              </Button>
              <Input
                id="imagem"
                name="imagem"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {file && <span className="text-sm text-gray-600">{file.name}</span>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {conta ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
