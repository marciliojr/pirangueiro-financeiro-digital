
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContasService, ContaDTO } from "@/services/contas";
import { uploadArquivo } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";

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
    tipo: conta?.tipo || "CORRENTE",
    saldoAtual: conta?.saldoAtual || 0,
    imagemUrl: conta?.imagemUrl || ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(conta?.imagemUrl || "");
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: ContaDTO) => ContasService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta criada com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContaDTO) => {
      if (!data.id) throw new Error("ID não fornecido para atualização");
      return ContasService.atualizar(data.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta atualizada com sucesso!");
      onSubmit();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "saldoAtual") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTipoChange = (value: string) => {
    setFormData({
      ...formData,
      tipo: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Criar URL temporária para preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let updatedFormData = { ...formData };
      
      // Upload de arquivo, se selecionado
      if (file) {
        setIsUploading(true);
        const imageUrl = await uploadArquivo(file);
        updatedFormData.imagemUrl = imageUrl;
        setIsUploading(false);
      }
      
      if (conta?.id) {
        updateMutation.mutate(updatedFormData);
      } else {
        createMutation.mutate(updatedFormData);
      }
    } catch (error) {
      toast.error("Erro ao salvar conta");
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{conta ? "Editar Conta" : "Nova Conta"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
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
                <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                <SelectItem value="POUPANCA">Poupança</SelectItem>
                <SelectItem value="INVESTIMENTO">Investimento</SelectItem>
                <SelectItem value="CARTEIRA">Carteira</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="saldoAtual">Saldo Atual</Label>
            <Input
              id="saldoAtual"
              name="saldoAtual"
              type="number"
              step="0.01"
              value={formData.saldoAtual}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imagem">Logo da Conta</Label>
            
            {previewUrl && (
              <div className="mb-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-md" 
                />
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
              {file && <span className="text-sm">{file.name}</span>}
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
