import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LimitesService, LimiteGastosDTO } from "@/services/limites";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface LimiteFormProps {
  limite: LimiteGastosDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function LimiteForm({ limite, isOpen, onClose, onSubmit }: LimiteFormProps) {
  console.log("Iniciando LimiteForm com limite:", limite);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<LimiteGastosDTO>({
    id: limite?.id,
    descricao: limite?.descricao || "",
    valor: limite?.valor || 0,
    data: limite?.data || today
  });
  
  // Atualizar o formulário quando o limite mudar
  useEffect(() => {
    if (limite) {
      console.log("Atualizando formData com limite:", limite);
      setFormData({
        id: limite.id,
        descricao: limite.descricao || "",
        valor: limite.valor || 0,
        data: limite.data || today
      });
    }
  }, [limite, today]);
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: LimiteGastosDTO) => LimitesService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites"] });
      toast.success("Limite de gastos criado com sucesso!");
      onSubmit();
    },
    onError: (error) => {
      console.error("Erro ao criar limite:", error);
      toast.error("Erro ao criar limite de gastos");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: LimiteGastosDTO }) => {
      console.log(`Atualizando limite ${id} com dados:`, data);
      return LimitesService.atualizar(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limites"] });
      toast.success("Limite de gastos atualizado com sucesso!");
      onSubmit();
    },
    onError: (error) => {
      console.error("Erro ao atualizar limite:", error);
      toast.error("Erro ao atualizar limite de gastos");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "valor" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (limite && limite.id) {
        // Usando uma estrutura diferente para garantir que o ID seja passado corretamente
        await updateMutation.mutateAsync({ 
          id: limite.id, 
          data: { 
            ...formData, 
            id: limite.id 
          } 
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Log quando o componente é montado e desmontado
  useEffect(() => {
    console.log("LimiteForm montado, isOpen:", isOpen);
    return () => {
      console.log("LimiteForm desmontado");
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && formData && (
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            console.log("Dialog onOpenChange:", open);
            if (!open) onClose();
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{limite ? "Editar Limite de Gastos" : "Novo Limite de Gastos"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {limite && limite.id && (
                <input type="hidden" name="id" value={limite.id} />
              )}
              
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
                <Label htmlFor="valor">Valor Limite</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={handleChange}
                  required
                />
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
      )}
    </>
  );
} 