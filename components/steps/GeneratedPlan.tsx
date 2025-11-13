import React, { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { StrategicPlan, SavedPlan } from '../../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SimpleMarkdownRenderer from '../common/SimpleMarkdownRenderer';

interface GeneratedPlanProps {
    report: string;
    planData: StrategicPlan;
    onStartOver: () => void;
    onSave: () => void;
    isSaved: boolean;
    isSaving: boolean;
}

const GeneratedPlan: React.FC<GeneratedPlanProps> = ({ report, planData, onStartOver, onSave, isSaved, isSaving }) => {
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const pdfRenderRef = useRef<HTMLDivElement>(null);
    const [planForPdf, setPlanForPdf] = useState<StrategicPlan | null>(null);


    const copyToClipboard = () => {
        navigator.clipboard.writeText(report).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    useEffect(() => {
        const generatePdf = async () => {
            if (!planForPdf || !pdfRenderRef.current) return;
            
            const content = pdfRenderRef.current;
            try {
                const canvas = await html2canvas(content, {
                    scale: 2,
                    useCORS: true,
                });

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const marginV = 20; // margem vertical
                const marginH = 15; // margem horizontal

                const contentWidth = pdfWidth - marginH * 2;
                const contentHeightPerPage = pdfHeight - marginV * 2;

                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                const totalImgHeight = (canvasHeight * contentWidth) / canvasWidth;
                const totalPages = Math.ceil(totalImgHeight / contentHeightPerPage);
                
                let canvasSliceY = 0;

                const addHeader = () => {
                    pdf.setFontSize(9);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor('#666666');
                    pdf.text(planData.studioName, marginH, marginV - 8);
                    pdf.text(`Plano Estratégico ${planData.planningYear}`, pdfWidth - marginH, marginV - 8, { align: 'right' });
                    pdf.setDrawColor('#cccccc');
                    pdf.line(marginH, marginV - 5, pdfWidth - marginH, marginV - 5);
                };

                const addFooter = (currentPage: number) => {
                    pdf.setFontSize(8);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor('#666666');
                    const footerText = `Página ${currentPage} de ${totalPages}`;
                    const brandText = `Gerado por Pilates Plan Pro`;
                    pdf.text(brandText, marginH, pdfHeight - marginV + 10);
                    pdf.text(footerText, pdfWidth - marginH, pdfHeight - marginV + 10, { align: 'right' });
                };
                
                for (let i = 1; i <= totalPages; i++) {
                    if (i > 1) pdf.addPage();

                    const sliceCanvas = document.createElement('canvas');
                    const sliceCtx = sliceCanvas.getContext('2d');
                    if (!sliceCtx) continue;

                    const sliceHeightOnCanvas = (contentHeightPerPage * canvasWidth) / contentWidth;
                    sliceCanvas.width = canvasWidth;
                    sliceCanvas.height = Math.min(sliceHeightOnCanvas, canvasHeight - canvasSliceY);

                    sliceCtx.drawImage(
                        canvas,
                        0, canvasSliceY, canvasWidth, sliceCanvas.height,
                        0, 0, canvasWidth, sliceCanvas.height
                    );
                    
                    const addedImgHeight = (sliceCanvas.height * contentWidth) / canvasWidth;

                    addHeader();
                    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', marginH, marginV, contentWidth, addedImgHeight);
                    addFooter(i);

                    canvasSliceY += sliceHeightOnCanvas;
                }
                
                const yearSuffix = planData.planningYear ? `_${planData.planningYear.replace(/[/\\?%*:|"<>]/g, '-')}` : '';
                pdf.save(`Plano_Estrategico_${planData.studioName.replace(/ /g, '_')}${yearSuffix}.pdf`);

            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
            } finally {
                setIsDownloading(false);
                setPlanForPdf(null);
            }
        };

        generatePdf();
    }, [planForPdf, report, planData]);

    const handleDownloadPdf = () => {
        if (isDownloading) return;
        setIsDownloading(true);
        setPlanForPdf(planData);
    };

    return (
        <Card className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-teal-800">Seu Plano Estratégico Anual está Pronto!</h2>
                <p className="text-lg text-gray-600 mt-2">Aqui está o relatório completo gerado pela nossa IA. Use-o como um guia para o sucesso do seu estúdio este ano.</p>
            </div>
            
            <div className="p-6 bg-white border border-gray-200 rounded-lg max-h-[60vh] overflow-y-auto" ref={reportContentRef}>
                <SimpleMarkdownRenderer content={report} />
            </div>

            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                <Button onClick={onSave} variant="primary" isLoading={isSaving}>
                    {isSaved ? 'Atualizar Plano Salvo' : 'Salvar Plano'}
                </Button>
                <Button onClick={handleDownloadPdf} variant="secondary" isLoading={isDownloading}>
                    {isDownloading ? 'Gerando PDF...' : 'Baixar como PDF'}
                </Button>
                <Button onClick={copyToClipboard} variant="ghost">
                    {copied ? 'Copiado!' : 'Copiar Texto'}
                </Button>
                <Button onClick={onStartOver} variant="ghost">
                    Começar de Novo
                </Button>
            </div>
            
            {/* Hidden container for PDF rendering with custom styles */}
            {planForPdf && (
                 <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                     <div id="pdf-content-wrapper" ref={pdfRenderRef}>
                         <SimpleMarkdownRenderer content={report} />
                     </div>
                 </div>
            )}
        </Card>
    );
};

export default GeneratedPlan;