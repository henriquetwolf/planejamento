import React, { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { SavedPlan } from '../../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SimpleMarkdownRenderer from '../common/SimpleMarkdownRenderer';

interface SavedPlansListProps {
    savedPlans: SavedPlan[];
    onLoad: (plan: SavedPlan) => void;
    onDelete: (id: string) => void;
    onBack: () => void;
}

const SavedPlansList: React.FC<SavedPlansListProps> = ({ savedPlans, onLoad, onDelete, onBack }) => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [planForPdf, setPlanForPdf] = useState<SavedPlan | null>(null);
    const pdfRenderRef = useRef<HTMLDivElement>(null);

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
                    pdf.text(planForPdf.planData.studioName, marginH, marginV - 8);
                    pdf.text(`Plano Estratégico ${planForPdf.planData.planningYear}`, pdfWidth - marginH, marginV - 8, { align: 'right' });
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
                
                const { planData } = planForPdf;
                const yearSuffix = planData.planningYear ? `_${planData.planningYear.replace(/[/\\?%*:|"<>]/g, '-')}` : '';
                pdf.save(`Plano_Estrategico_${planData.studioName.replace(/ /g, '_')}${yearSuffix}.pdf`);

            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
            } finally {
                setDownloadingId(null);
                setPlanForPdf(null);
            }
        };

        generatePdf();
    }, [planForPdf]);

    const handleDownloadClick = (plan: SavedPlan) => {
        if (downloadingId) return;
        setDownloadingId(plan.id);
        setPlanForPdf(plan);
    };

    return (
        <>
            <Card className="animate-fade-in">
                <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">Meus Planos Salvos</h2>
                {savedPlans.length > 0 ? (
                    <ul className="space-y-3 mb-8">
                        {savedPlans.map(plan => (
                            <li key={plan.id} className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <p className="font-semibold text-teal-700">
                                        {plan.planData.studioName || "Plano Sem Título"}
                                        {plan.planData.planningYear && ` (${plan.planData.planningYear})`}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Salvo em: {new Date(plan.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <Button onClick={() => onLoad(plan)} variant="secondary" className="py-2 px-4 text-sm">Carregar & Editar</Button>
                                    <Button
                                        onClick={() => handleDownloadClick(plan)}
                                        variant="ghost"
                                        className="py-2 px-4 text-sm"
                                        isLoading={downloadingId === plan.id}
                                    >
                                        Baixar PDF
                                    </Button>
                                    <Button onClick={() => onDelete(plan.id)} variant="ghost" className="py-2 px-4 text-sm !text-red-600 hover:!bg-red-50">Excluir</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-600 mb-8">Você ainda não tem nenhum plano salvo.</p>
                )}
                 <div className="text-center">
                    <Button onClick={onBack} variant="ghost">Voltar ao Início</Button>
                </div>
            </Card>

            {/* Hidden container for rendering PDF content */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }} >
                <div ref={pdfRenderRef} id="pdf-content-wrapper">
                    {planForPdf && (
                         <SimpleMarkdownRenderer content={planForPdf.report} />
                    )}
                </div>
            </div>
        </>
    );
};

export default SavedPlansList;