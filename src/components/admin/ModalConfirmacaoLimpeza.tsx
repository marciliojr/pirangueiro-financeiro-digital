import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ModalConfirmacaoLimpezaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmacao: string) => void;
}

export const ModalConfirmacaoLimpeza = ({ open, onOpenChange, onConfirm }: ModalConfirmacaoLimpezaProps) => {
  const [textoConfirmacao, setTextoConfirmacao] = useState("");
  const [erro, setErro] = useState("");

  const TEXTO_CONFIRMACAO_ESPERADO = "CONFIRMAR_LIMPEZA";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toUpperCase();
    setTextoConfirmacao(valor);
    
    // Limpar erro quando o usuário começar a digitar
    if (erro) {
      setErro("");
    }
  };

  const handleConfirm = () => {
    if (textoConfirmacao.trim() !== TEXTO_CONFIRMACAO_ESPERADO) {
      setErro(`Você deve digitar exatamente "${TEXTO_CONFIRMACAO_ESPERADO}" para confirmar`);
      return;
    }

    onConfirm(textoConfirmacao);
    setTextoConfirmacao("");
    setErro("");
  };

  const handleCancel = () => {
    setTextoConfirmacao("");
    setErro("");
    onOpenChange(false);
  };

  const isConfirmacaoValida = textoConfirmacao.trim() === TEXTO_CONFIRMACAO_ESPERADO;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 dark:text-red-400">
            ⚠️ Atenção - Operação Irreversível
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-sm">
              <strong>Todos os dados serão permanentemente apagados:</strong>
            </p>
            <ul className="text-sm space-y-1 pl-4">
              <li>• Todas as receitas</li>
              <li>• Todas as despesas</li>
              <li>• Todas as contas bancárias</li>
              <li>• Todos os cartões de crédito</li>
              <li>• Todas as categorias</li>
              <li>• Histórico e relatórios</li>
            </ul>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-3">
              Esta ação é <strong>irreversível</strong> e não pode ser desfeita!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Para confirmar esta operação, digite:</strong>
            </p>
            <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400 mt-1">
              {TEXTO_CONFIRMACAO_ESPERADO}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmacao" className="text-sm font-medium">
              Confirmação:
            </Label>
            <Input
              id="confirmacao"
              type="text"
              value={textoConfirmacao}
              onChange={handleInputChange}
              placeholder="Digite CONFIRMAR_LIMPEZA"
              className={`font-mono ${erro ? 'border-red-500 focus-visible:ring-red-500' : ''} ${
                isConfirmacaoValida ? 'border-green-500 focus-visible:ring-green-500' : ''
              }`}
              autoComplete="off"
            />
            {erro && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {erro}
              </p>
            )}
            {isConfirmacaoValida && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Confirmação válida
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!isConfirmacaoValida}
            className={`${
              isConfirmacaoValida 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
            }`}
          >
            Confirmar Limpeza
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 