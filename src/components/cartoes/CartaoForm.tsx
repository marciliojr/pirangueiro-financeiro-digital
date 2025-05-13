import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CartoesService, CartaoDTO } from "@/services/cartoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

const meses = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function CartaoForm({ cartao, isOpen, onClose, onSubmit }: CartaoFormProps) {
  const [formData, setFormData] = useState<CartaoDTO>({
    id: cartao?.id || undefined,
    nome: cartao?.nome || "",
    limite: cartao?.limite || 0,
    diaFechamento: cartao?.diaFechamento || 1,
    diaVencimento: cartao?.diaVencimento || 1
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
    } else if (name === "nome") {
      setFormData({
        ...formData,
        [name]: value
      });
    } else if (name === "diaFechamento" || name === "diaVencimento") {
      const dia = Math.min(Math.max(parseInt(value) || 1, 1), 31);
      setFormData({
        ...formData,
        [name]: dia
      });
    }
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
          <DialogDescription>
            Preencha os dados do cartão de crédito
          </DialogDescription>
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
            <Label htmlFor="diaFechamento">Dia do Fechamento</Label>
            <Input
              id="diaFechamento"
              name="diaFechamento"
              type="number"
              min="1"
              max="31"
              value={formData.diaFechamento}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="diaVencimento">Dia do Vencimento</Label>
            <Input
              id="diaVencimento"
              name="diaVencimento"
              type="number"
              min="1"
              max="31"
              value={formData.diaVencimento}
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
              {cartao ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 