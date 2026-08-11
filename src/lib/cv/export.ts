import { toast } from "sonner";

const loadHtml2Pdf = () => {
  return new Promise<any>((resolve, reject) => {
    if ((window as any).html2pdf) {
      resolve((window as any).html2pdf);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.integrity = "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export async function exportarElementoParaPDF(elementId: string, nomeArquivo: string) {
  const toastId = toast.loading("A preparar o descarregamento do PDF...");
  try {
    const html2pdf = await loadHtml2Pdf();
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error("Elemento de pré-visualização não encontrado.");
    }

    const opt = {
      margin: 0,
      filename: nomeArquivo.endsWith(".pdf") ? nomeArquivo : `${nomeArquivo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2.5,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();
    toast.success("PDF descarregado com sucesso!", { id: toastId });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.dismiss(toastId);
    window.print();
  }
}
