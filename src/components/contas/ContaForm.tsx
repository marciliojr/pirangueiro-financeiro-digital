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
import { Loader2 } from "lucide-react";

interface ContaFormProps {
  conta: ContaDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ContaForm({ conta, isOpen, onClose, onSubmit }: ContaFormProps) {
  const [formData, setFormData] = useState<ContaDTO>({
    nome: conta?.nome || "",
    tipo: conta?.tipo || TipoConta.CORRENTE,
  });
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (conta: ContaDTO) => ContasService.criar(conta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta criada com sucesso!");
      limparFormulario();
      onSubmit();
    },
    onError: (error: Error) => {
      console.error("Erro ao criar conta:", error);
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ conta }: { conta: ContaDTO }) => {
      if (!conta.id) {
        throw new Error("ID da conta é obrigatório para atualização");
      }
      return ContasService.atualizar(conta.id, conta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      toast.success("Conta atualizada com sucesso!");
      onSubmit();
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar conta:", error);
      toast.error(error.message || "Erro ao atualizar conta");
    },
  });

  useEffect(() => {
    if (conta) {
      setFormData({
        id: conta.id,
        nome: conta.nome,
        tipo: conta.tipo,
      });
    } else {
      limparFormulario();
    }
  }, [conta]);

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

  const limparFormulario = () => {
    setFormData({
      nome: "",
      tipo: TipoConta.CORRENTE,
    });
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
      if (conta?.id) {
        await updateMutation.mutateAsync({ conta: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Erros já são tratados nas mutations
      console.error("Erro ao salvar conta:", error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
