import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LimitesService, LimiteGastosDTO } from "@/services/limites";
import { CategoriasService } from "@/services/categorias";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LimiteFormProps {
  limite: LimiteGastosDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function LimiteForm({ limite, isOpen, onClose, onSubmit }: LimiteFormProps) {
  const [formData, setFormData] = useState<LimiteGastosDTO>({
    id: limite?.id || undefined,
    descricao: limite?.descricao || "",
    valorLimite: limite?.valorLimite || 0,
    categoriaId: limite?.categoriaId || 0
  });
  
  const queryClient = useQueryClient();

  // Buscar categorias para o select
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => CategoriasService.listar(),
  });

  const createMutation = useMutation({
    mutationFn: (data: LimiteGastosDTO) => LimitesService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites"] });
      toast.success("Limite de gastos criado com sucesso!");
      onSubmit();
    },
    onError: () => {
      toast.error("Erro ao criar limite de gastos");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: LimiteGastosDTO) => {
      if (!data.id) throw new Error("ID não fornecido para atualização");
      return LimitesService.atualizar(data.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites"] });
      toast.success("Limite de gastos atualizado com sucesso!");
      onSubmit();
    },
    onError: () => {
      toast.error("Erro ao atualizar limite de gastos");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "valorLimite" ? parseFloat(value) : value
    });
  };

  const handleCategoriaChange = (value: string) => {
    setFormData({
      ...formData,
      categoriaId: parseInt(value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categoriaId === 0) {
      toast.error("Selecione uma categoria");
      return;
    }
    
    if (limite?.id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{limite ? "Editar Limite de Gastos" : "Novo Limite de Gastos"}</DialogTitle>
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
            <Label htmlFor="valorLimite">Valor Limite</Label>
            <Input
              id="valorLimite"
              name="valorLimite"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorLimite}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoriaId">Categoria</Label>
            <Select 
              value={formData.categoriaId.toString()} 
              onValueChange={handleCategoriaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem 
                    key={categoria.id} 
                    value={categoria.id?.toString() || ""}
                  >
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {limite ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 