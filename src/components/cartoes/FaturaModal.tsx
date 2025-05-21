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
const anoAtual = new Date().getFullYear();

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

const anos = Array.from(
  { length: 11 }, 
  (_, i) => anoAtual - 5 + i
).sort((a, b) => b - a);

// Gerar lista de anos (ano atual e 2 anos anteriores)
//const anos = Array.from({ length: 3 }, (_, i) => anoAtual - i).sort((a, b) => b - a);

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

      // Configurações do PDF A4
      const a4Width = 210; // largura A4 em mm
      const a4Height = 297; // altura A4 em mm
      const margin = 20; // margem de 20mm em todos os lados
      const contentWidth = a4Width - (2 * margin);
      const contentHeight = a4Height - (2 * margin);

      // Configurar html2canvas
      const canvas = await html2canvas(faturaRef.current, {
        scale: 2, // Aumenta a qualidade
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollY: -window.scrollY,
        height: faturaRef.current.offsetHeight,
        windowHeight: faturaRef.current.offsetHeight
      });
      
      // Calcular dimensões mantendo proporção
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Se a altura da imagem for maior que a altura útil do A4, criar múltiplas páginas
      if (imgHeight > contentHeight) {
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let currentPage = 1;

        while (remainingHeight > 0) {
          // Altura da parte da imagem a ser renderizada nesta página
          const pageContentHeight = Math.min(remainingHeight, contentHeight);
          
          // Calcular a proporção da altura do canvas para esta página
          const sourceHeight = (pageContentHeight * canvas.height) / imgHeight;
          
          // Criar um canvas temporário para a parte da página atual
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight
            );
          }

          // Adicionar a parte da imagem ao PDF
          pdf.addImage(
            tempCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            contentWidth,
            pageContentHeight
          );

          remainingHeight -= contentHeight;
          sourceY += sourceHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
            currentPage++;
          }
        }
      } else {
        // Se couber em uma página, centralizar verticalmente
        const yPos = margin + (contentHeight - imgHeight) / 2;
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          yPos,
          contentWidth,
          imgHeight
        );
      }
      
      pdf.save(`fatura_${cartao.nome.toLowerCase().replace(/\s+/g, '_')}_${mesNome?.toLowerCase()}_${anoSelecionado}.pdf`);
      toast.success('Fatura exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar a fatura. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0">
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

        <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
          <div className="space-y-2 flex-1">
            <Label>Mês</Label>
            <Select
              value={String(mesSelecionado)}
              onValueChange={(value) => setMesSelecionado(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

          <div className="space-y-2 flex-1">
            <Label>Ano</Label>
            <Select
              value={String(anoSelecionado)}
              onValueChange={(value) => setAnoSelecionado(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Conteúdo que será exportado para PDF */}
          <div ref={faturaRef} className="bg-white p-8">
            {/* Cabeçalho da Fatura */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold whitespace-normal break-words">{cartao.nome}</h2>
                    <p className="text-muted-foreground whitespace-normal">
                      Fatura de {mesNome} de {anoSelecionado}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right whitespace-normal">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Vencimento: dia {cartao.diaVencimento}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Fechamento: dia {cartao.diaFechamento}</span>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold whitespace-normal">Descrição</TableHead>
                      <TableHead className="font-bold whitespace-normal">Data</TableHead>
                      <TableHead className="font-bold whitespace-normal">Categoria</TableHead>
                      <TableHead className="font-bold text-right whitespace-normal">Valor</TableHead>
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
                          <TableRow key={despesa.id}>
                            <TableCell className="font-medium text-blue-900 dark:text-blue-800">{despesa.descricao}</TableCell>
                            <TableCell className="text-blue-900 dark:text-blue-800">{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="text-blue-900 dark:text-blue-800">{despesa.categoria?.nome || "Sem categoria"}</TableCell>
                            <TableCell className="text-right text-blue-900 dark:text-blue-800">{formatarMoeda(despesa.valor)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2">
                          <TableCell colSpan={3} className="font-bold text-right text-lg text-blue-900 dark:text-blue-800">
                            Total da Fatura
                          </TableCell>
                          <TableCell className="font-bold text-right text-lg text-blue-900 dark:text-blue-800">
                            {formatarMoeda(totalFatura)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Rodapé da Fatura */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p className="text-center whitespace-normal">
                Fatura gerada em {new Date().toLocaleDateString('pt-BR')} às{' '}
                {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 