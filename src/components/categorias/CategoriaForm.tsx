import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoriasService, CategoriaDTO } from "@/services/categorias";
import { uploadArquivo } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UppercaseInput } from "@/components/ui/uppercase-input";
import { Upload, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoriaFormProps {
  categoria: CategoriaDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CategoriaForm({ categoria, isOpen, onClose, onSubmit }: CategoriaFormProps) {
  const [formData, setFormData] = useState<CategoriaDTO>({
    id: categoria?.id || undefined,
    nome: categoria?.nome || "",
    cor: categoria?.cor || "#6366F1",
    imagemCategoria: categoria?.imagemCategoria || "",
    tipoReceita: categoria?.tipoReceita ?? true
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(categoria?.imagemCategoria || "");
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CategoriaDTO) => CategoriasService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria criada com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoriaDTO) => {
      if (!data.id) throw new Error("ID não fornecido para atualização");
      return CategoriasService.atualizar(data.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria atualizada com sucesso!");
      onSubmit();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      tipoReceita: value === "receita"
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
    
    if (formData.tipoReceita === undefined) {
      toast.error("Por favor, selecione o tipo da categoria");
      return;
    }

    try {
      const updatedFormData = { ...formData };
      
      // Upload de arquivo, se selecionado
      if (file) {
        setIsUploading(true);
        const imageUrl = await uploadArquivo(file);
        updatedFormData.imagemCategoria = imageUrl;
        setIsUploading(false);
      }
      
      if (categoria?.id) {
        updateMutation.mutate(updatedFormData);
      } else {
        createMutation.mutate(updatedFormData);
      }
    } catch (error) {
      toast.error("Erro ao salvar categoria");
      setIsUploading(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          <DialogDescription>
            {categoria ? "Edite os dados da categoria selecionada." : "Preencha os dados para criar uma nova categoria."}
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
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipoReceita !== undefined ? (formData.tipoReceita ? "receita" : "despesa") : undefined}
              onValueChange={handleSelectChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cor">Cor</Label>
            <div className="flex gap-2">
              <Input
                id="cor"
                name="cor"
                type="color"
                value={formData.cor}
                onChange={handleChange}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <Input
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imagem">Ícone da Categoria</Label>
            
            {previewUrl && (
              <div className="mb-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-md" 
                  style={{ backgroundColor: formData.cor }}
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
              {categoria ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 