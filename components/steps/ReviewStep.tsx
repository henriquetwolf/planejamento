
import React from 'react';
import { StrategicPlan, Objective, QuarterlyAction } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface ReviewStepProps {
    planData: StrategicPlan;
    onGenerate: () => void;
    onBack: () => void;
    isLoading: boolean;
}

const ReviewSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ planData, onGenerate, onBack, isLoading }) => {
    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Passo 5: Revise seu Plano</h2>
            <p className="text-gray-600 mb-6">Confira todas as informações antes de gerarmos seu plano estratégico completo com a ajuda da IA.</p>

            <div className="space-y-6 text-gray-700">
                <ReviewSection title="Informações do Estúdio">
                    <p><strong>Nome:</strong> {planData.studioName}</p>
                    <p><strong>Ano do Plano:</strong> {planData.planningYear}</p>
                    <p><strong>Visão:</strong> {planData.vision}</p>
                    <p><strong>Missão:</strong> {planData.mission}</p>
                </ReviewSection>

                <ReviewSection title="Análise SWOT">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>Forças:</strong> <ul className="list-disc list-inside ml-4">{planData.swot.strengths.map((s, i) => s && <li key={i}>{s}</li>)}</ul></div>
                        <div><strong>Fraquezas:</strong> <ul className="list-disc list-inside ml-4">{planData.swot.weaknesses.map((w, i) => w && <li key={i}>{w}</li>)}</ul></div>
                        <div><strong>Oportunidades:</strong> <ul className="list-disc list-inside ml-4">{planData.swot.opportunities.map((o, i) => o && <li key={i}>{o}</li>)}</ul></div>
                        <div><strong>Ameaças:</strong> <ul className="list-disc list-inside ml-4">{planData.swot.threats.map((t, i) => t && <li key={i}>{t}</li>)}</ul></div>
                    </div>
                </ReviewSection>

                <ReviewSection title="Objetivos (OKRs)">
                    {planData.objectives.map((obj, i) => obj.title && (
                        <div key={i} className="mb-3">
                            <p><strong>Objetivo:</strong> {obj.title}</p>
                            <ul className="list-disc list-inside ml-4">
                                {obj.keyResults.map((kr, j) => kr.title && <li key={j}>{kr.title}</li>)}
                            </ul>
                        </div>
                    ))}
                </ReviewSection>

                <ReviewSection title="Plano de Ação Trimestral">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {planData.quarterlyActions.map((q, i) => (
                            <div key={i}>
                                <strong>{q.quarter}:</strong>
                                <ul className="list-disc list-inside ml-4">
                                    {q.actions.map((a, j) => a && <li key={j}>{a}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ReviewSection>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
                 <p className="text-center text-gray-600 mb-4">Tudo certo? Clique abaixo para que nossa IA crie um relatório profissional e detalhado para você.</p>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button onClick={onBack} variant="ghost" disabled={isLoading}>Voltar e Editar</Button>
                    <Button onClick={onGenerate} isLoading={isLoading} className="w-full sm:w-auto">
                        {isLoading ? 'Gerando Relatório...' : 'Gerar Plano Estratégico Completo'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ReviewStep;