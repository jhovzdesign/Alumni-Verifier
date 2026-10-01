import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadCertificatePDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Certificate element not found.');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20; // 10mm margins on left/right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;
    if (imgHeight < pageHeight - 20) {
      // Center vertically if it fits
      yPosition = (pageHeight - imgHeight) / 2;
    }

    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}
