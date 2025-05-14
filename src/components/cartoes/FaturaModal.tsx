import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CartoesService, DespesaDTO, CartaoDTO } from "@/services/cartoes";
import { formatarMoeda } from "@/services/api";
import { toast } from "sonner";
import { Download, Calendar, CreditCard } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FaturaModalProps {
  cartao: CartaoDTO;
  isOpen: boolean;
  onClose: () => void;
}

// Obter mês e ano atual para o filtro inicial
const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1;
const anoAtual = dataAtual.getFullYear();

const meses = [
  { valor: 1, nome: "Janeiro" },
  { valor: 2, nome: "Fevereiro" },
  { valor: 3, nome: "Março" },
  { valor: 4, nome: "Abril" },
  { valor: 5, nome: "Maio" },
  { valor: 6, nome: "Junho" },
  { valor: 7, nome: "Julho" },
  { valor: 8, nome: "Agosto" },
  { valor: 9, nome: "Setembro" },
  { valor: 10, nome: "Outubro" },
  { valor: 11, nome: "Novembro" },
  { valor: 12, nome: "Dezembro" }
];

// Gerar lista de anos (ano atual e 2 anos anteriores)
const anos = Array.from({ length: 3 }, (_, i) => anoAtual - i).sort((a, b) => b - a);

export function FaturaModal({ cartao, isOpen, onClose }: FaturaModalProps) {
  const [mesSelecionado, setMesSelecionado] = useState<number>(mesAtual);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(anoAtual);
  const faturaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: despesas = [], isLoading, error } = useQuery({
    queryKey: ["fatura", cartao.id, mesSelecionado, anoSelecionado],
    queryFn: async () => {
      try {
        return await CartoesService.buscarFatura(cartao.id, mesSelecionado, anoSelecionado);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Erro ao carregar a fatura. Tente novamente mais tarde.");
        }
        throw error;
      }
    },
    enabled: isOpen && !!cartao.id,
  });

  const totalFatura = despesas.reduce((total, despesa) => total + despesa.valor, 0);
  const mesNome = meses.find(m => m.valor === mesSelecionado)?.nome;

  const handleExportPDF = async () => {
    if (!faturaRef.current) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(faturaRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`fatura_${cartao.nome.toLowerCase().replace(/\s+/g, '_')}_${mesNome?.toLowerCase()}_${anoSelecionado}.pdf`);
      
      toast.success('Fatura exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar a fatura. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Fatura do Cartão {cartao.nome}</DialogTitle>
            <DialogDescription>
              Visualize as despesas da fatura de {mesNome} de {anoSelecionado}
            </DialogDescription>
          </div>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading || despesas.length === 0 || isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </DialogHeader>

        <div className="flex gap-4 mb-6">
          <div className="space-y-2">
            <Label>Mês</Label>
            <Select
              value={String(mesSelecionado)}
              onValueChange={(value) => setMesSelecionado(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.valor} value={String(mes.valor)}>
                    {mes.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ano</Label>
            <Select
              value={String(anoSelecionado)}
              onValueChange={(value) => setAnoSelecionado(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={String(ano)}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conteúdo que será exportado para PDF */}
        <div ref={faturaRef} className="bg-white p-8">
          {/* Cabeçalho da Fatura */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">{cartao.nome}</h2>
                  <p className="text-muted-foreground">
                    Fatura de {mesNome} de {anoSelecionado}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Vencimento: dia {cartao.diaVencimento}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Fechamento: dia {cartao.diaFechamento}</span>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold">Descrição</TableHead>
                  <TableHead className="font-bold">Data</TableHead>
                  <TableHead className="font-bold">Categoria</TableHead>
                  <TableHead className="font-bold text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-red-500">
                      Erro ao carregar os dados. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : despesas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      Nenhuma despesa encontrada para este período
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {despesas.map((despesa) => (
                      <TableRow key={despesa.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{despesa.descricao}</TableCell>
                        <TableCell>{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{despesa.categoria?.nome || "Sem categoria"}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(despesa.valor)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 border-t-2">
                      <TableCell colSpan={3} className="font-bold text-right text-lg">
                        Total da Fatura
                      </TableCell>
                      <TableCell className="font-bold text-right text-lg">
                        {formatarMoeda(totalFatura)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé da Fatura */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p className="text-center">
              Fatura gerada em {new Date().toLocaleDateString('pt-BR')} às{' '}
              {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 