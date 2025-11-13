

import React, { useState } from 'react';
import { StrategicPlan } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { generateActionSuggestions } from '../../services/geminiService';

interface ActionsStepProps {
    planData: StrategicPlan;
    updatePlanData: (updates: Partial<StrategicPlan>) => void;
    onNext: () => void;
    onBack: () => void;
}

const QuarterInput: React.FC<{
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    actions: string[];
    onChange: (actions: string[]) => void;
}> = ({ quarter, actions, onChange }) => {
    const handleActionChange = (index: number, value: string) => {
        const newActions = [...actions];
        newActions[index] = value;
        onChange(newActions);
    };

    const addAction = () => {
        onChange([...actions, '']);
    };

    const removeAction = (index: number) => {
        if (actions.length > 1 || (actions.length === 1 && actions[0] !== '')) {
             const newActions = actions.filter((_, i) => i !== index);
             if (newActions.length === 0) {
                 onChange(['']); // Keep at least one empty input
             } else {
                 onChange(newActions);
             }
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-teal-700 mb-2">{quarter} (Trimestre)</h3>
            <div className="space-y-2">
                {actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={action}
                            onChange={(e) => handleActionChange(index, e.target.value)}
                            placeholder={`Ação para o ${quarter}. Ex: Lançar campanha de verão`}
                            className="flex-grow block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                         <button type="button" onClick={() => removeAction(index)} className="text-gray-400 hover:text-red-500" disabled={actions.length <= 1 && action.trim() === ''}>&times;</button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addAction} className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-800">+ Adicionar ação</button>
        </div>
    );
};

const ActionsStep: React.FC<ActionsStepProps> = ({ planData, updatePlanData, onNext, onBack }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleQuarterlyActionsChange = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', actions: string[]) => {
        const newQuarterlyActions = planData.quarterlyActions.map(q =>
            q.quarter === quarter ? { ...q, actions } : q
        );
        updatePlanData({ quarterlyActions: newQuarterlyActions });
    };

    const handleGenerateSuggestions = async () => {
        setIsGenerating(true);
        try {
            const generatedSuggestions = await generateActionSuggestions(planData.objectives);
            setSuggestions(generatedSuggestions);
        } catch (error) {
            console.error("Error generating action suggestions:", error);
            alert("Ocorreu um erro ao gerar sugestões de ações. Por favor, tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const applySuggestion = (suggestion: string) => {
        const newQuarterlyActions = JSON.parse(JSON.stringify(planData.quarterlyActions));
        let applied = false;

        // Tenta preencher um campo vazio primeiro
        for (let q of newQuarterlyActions) {
            const emptyIndex = q.actions.findIndex(a => a.trim() === '');
            if (emptyIndex !== -1) {
                q.actions[emptyIndex] = suggestion;
                applied = true;
                break;
            }
        }
        
        // Se não houver campo vazio, adiciona ao Q1
        if (!applied) {
            const q1 = newQuarterlyActions.find(q => q.quarter === 'Q1');
            if (q1) {
                // Se o Q1 tiver apenas um item vazio, substitui em vez de adicionar
                if (q1.actions.length === 1 && q1.actions[0].trim() === '') {
                    q1.actions[0] = suggestion;
                } else {
                    q1.actions.push(suggestion);
                }
            }
        }

        updatePlanData({ quarterlyActions: newQuarterlyActions });
        setSuggestions(prev => prev.filter(s => s !== suggestion));
    };

    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Passo 4: Plano de Ação Trimestral</h2>
            <p className="text-gray-600 mb-6">Divida seus grandes objetivos em ações menores e gerenciáveis para cada trimestre do ano.</p>
            
            <div className="my-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                    Precisa de inspiração?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Use a IA para gerar sugestões de ações práticas com base nos seus objetivos.
                </p>
                <Button onClick={handleGenerateSuggestions} variant="secondary" isLoading={isGenerating}>
                    {isGenerating ? 'Analisando Objetivos...' : 'Gerar Sugestões de Ações'}
                </Button>
                {suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600 mb-2">Sugestões (clique para adicionar):</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => applySuggestion(s)}
                                    className="px-3 py-1 text-sm rounded-full transition-colors bg-teal-100 text-teal-800 hover:bg-teal-200"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {planData.quarterlyActions.map(q => (
                    <QuarterInput
                        key={q.quarter}
                        quarter={q.quarter}
                        actions={q.actions}
                        onChange={(actions) => handleQuarterlyActionsChange(q.quarter, actions)}
                    />
                ))}
            </div>

            <div className="mt-8 flex justify-between">
                <Button onClick={onBack} variant="ghost">Voltar</Button>
                <Button onClick={onNext}>Próximo Passo</Button>
            </div>
        </Card>
    );
};

export default ActionsStep;