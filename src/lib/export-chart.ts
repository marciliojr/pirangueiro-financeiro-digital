import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  elementId: string;
  filename: string;
  format: 'pdf' | 'jpg';
}

export const exportChart = async ({ elementId, filename, format }: ExportOptions) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento com id '${elementId}' não encontrado`);
    }

    // Criar canvas do elemento
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Maior qualidade
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    if (format === 'jpg') {
      // Exportar como JPG
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } else {
      // Exportar como PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    }
  } catch (error) {
    console.error('Erro ao exportar gráfico:', error);
    throw error;
  }
}; 