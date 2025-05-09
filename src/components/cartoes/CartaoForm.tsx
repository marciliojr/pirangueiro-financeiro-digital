import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CartoesService, CartaoDTO } from "@/services/cartoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CartaoFormProps {
  cartao: CartaoDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CartaoForm({ cartao, isOpen, onClose, onSubmit }: CartaoFormProps) {
  const [formData, setFormData] = useState<CartaoDTO>({
    id: cartao?.id || undefined,
    nome: cartao?.nome || "",
    bandeira: cartao?.bandeira || "VISA",
    limite: cartao?.limite || 0,
    vencimentoFatura: cartao?.vencimentoFatura || ""
  });
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CartaoDTO) => CartoesService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      toast.success("Cartão criado com sucesso!");
      onSubmit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CartaoDTO) => {
      if (!data.id) throw new Error("ID não fornecido para atualização");
      return CartoesService.atualizar(data.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      toast.success("Cartão atualizado com sucesso!");
      onSubmit();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "limite") {
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

  const handleBandeiraChange = (value: string) => {
    setFormData({
      ...formData,
      bandeira: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (cartao?.id) {
        updateMutation.mutate(formData);
      } else {
        createMutation.mutate(formData);
      }
    } catch (error) {
      toast.error("Erro ao salvar cartão");
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{cartao ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
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
            <Label htmlFor="bandeira">Bandeira</Label>
            <Select 
              value={formData.bandeira} 
              onValueChange={handleBandeiraChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                <SelectItem value="ELO">Elo</SelectItem>
                <SelectItem value="AMERICAN_EXPRESS">American Express</SelectItem>
                <SelectItem value="HIPERCARD">Hipercard</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limite">Limite</Label>
            <Input
              id="limite"
              name="limite"
              type="number"
              step="0.01"
              value={formData.limite}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vencimentoFatura">Dia de Vencimento</Label>
            <Input
              id="vencimentoFatura"
              name="vencimentoFatura"
              type="number"
              min="1"
              max="31"
              value={formData.vencimentoFatura}
              onChange={handleChange}
              required
              placeholder="Dia do mês (1-31)"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cartao ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 