import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (manterDespesas?: boolean) => void;
  title: string;
  description: string;
  isLoading?: boolean;
  showManterDespesasOption?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  showManterDespesasOption = false
}: ConfirmDialogProps) {
  const [manterDespesas, setManterDespesas] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {showManterDespesasOption && (
  <div className="flex items-start space-x-2 py-4"> {/* Alterado para items-start para alinhar no topo */}
    <Checkbox
      id="manterDespesas"
      checked={manterDespesas}
      onCheckedChange={(checked) => setManterDespesas(checked as boolean)}
    />
    <Label htmlFor="manterDespesas" className="leading-snug">
      <div className="space-y-2">
        {/* Primeira linha */}
        <span className="block">Deseja manter as despesas vinculadas a este cartão?</span>
        
        {/* Lista de consequências */}
        <div className="space-y-1">
          <span className="block text-sm text-muted-foreground">Ao confirmar:</span>
          <div className="flex flex-col space-y-1 ml-4"> {/* Margem para alinhar os bullets */}
            <div className="flex items-start gap-2">
              <span>•</span>
              <span>O cartão será excluído permanentemente</span>
            </div>
            <div className="flex items-start gap-2">
              <span>•</span>
              <span>Uma despesa com o valor total de todas as compras do cartão será registrada</span>
            </div>
          </div>
        </div>
      </div>
    </Label>
  </div>
)}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button 
            onClick={() => onConfirm(manterDespesas)} 
            variant="destructive" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aguarde...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 