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

interface ModalConfirmacaoLimpezaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ModalConfirmacaoLimpeza = ({ open, onOpenChange, onConfirm }: ModalConfirmacaoLimpezaProps) => {
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
        <AlertDialogFooter>
          <AlertDialogCancel>Não</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Sim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 