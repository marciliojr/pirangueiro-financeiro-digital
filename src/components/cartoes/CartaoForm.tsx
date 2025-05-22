import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CartoesService, CartaoDTO } from "@/services/cartoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UppercaseInput } from "@/components/ui/uppercase-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatarValorMonetario } from "@/services/api";

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
    limiteUsado: cartao?.limiteUsado || 0,
    diaFechamento: cartao?.diaFechamento || 1,
    diaVencimento: cartao?.diaVencimento || 1
  });

  // Consulta do limite disponível apenas quando estiver editando
  const { data: limiteDisponivel } = useQuery({
    queryKey: ["limite-disponivel", cartao?.id],
    queryFn: () => CartoesService.consultarLimiteDisponivel(cartao!.id!),
    enabled: !!cartao?.id && isOpen,
  });

  const [limiteFormatado, setLimiteFormatado] = useState(
    formData.limite !== null && formData.limite !== undefined 
      ? formatarValorMonetario(formData.limite.toString()) 
      : '0,00'
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    if (cartao) {
      setFormData({
        id: cartao.id,
        nome: cartao.nome,
        limite: cartao.limite || 0,
        limiteUsado: cartao.limiteUsado || 0,
        diaFechamento: cartao.diaFechamento || 1,
        diaVencimento: cartao.diaVencimento || 1
      });
      setLimiteFormatado(
        cartao.limite !== null && cartao.limite !== undefined 
          ? formatarValorMonetario(cartao.limite.toString()) 
          : '0,00'
      );
    }
  }, [cartao]);

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
      // Não fazemos nada aqui, pois o valor é tratado no handleLimiteChange
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

  const handleLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    
    // Converte para número considerando os centavos
    const valorNumerico = Number(valor) / 100;
    
    // Formata o valor para exibição
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorNumerico);

    setLimiteFormatado(valorFormatado);
    setFormData(prev => ({ ...prev, limite: valorNumerico }));
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
            <UppercaseInput
              id="nome"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limite">Limite</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="limite"
                name="limite"
                value={limiteFormatado}
                onChange={handleLimiteChange}
                className="pl-10"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {cartao && (
            <div className="space-y-2">
              <Label>Limite Utilizado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  value={limiteDisponivel !== undefined ? formatarValorMonetario((cartao.limite - limiteDisponivel).toString()) : "Carregando..."}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="diaFechamento">Dia do Fechamento</Label>
            <Input
              id="diaFechamento"
              name="diaFechamento"
              type="number"
              min="1"
              max="31"
              value={formData.diaFechamento || 1}
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
              value={formData.diaVencimento || 1}
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