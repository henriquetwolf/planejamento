

import React, { useState } from 'react';
import { StrategicPlan, Objective, KeyResult } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { generateGoalSuggestions } from '../../services/geminiService';

interface GoalsStepProps {
    planData: StrategicPlan;
    updatePlanData: (updates: Partial<StrategicPlan>) => void;
    onNext: () => void;
    onBack: () => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({ planData, updatePlanData, onNext, onBack }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...planData.objectives];
        newObjectives[index].title = value;
        updatePlanData({ objectives: newObjectives });
    };

    const handleKeyResultChange = (objIndex: number, krIndex: number, value: string) => {
        const newObjectives = [...planData.objectives];
        newObjectives[objIndex].keyResults[krIndex].title = value;
        updatePlanData({ objectives: newObjectives });
    };

    const addObjective = () => {
        updatePlanData({
            objectives: [...planData.objectives, { title: '', keyResults: [{ title: '' }] }]
        });
    };

    const removeObjective = (index: number) => {
        if (planData.objectives.length > 1) {
            const newObjectives = planData.objectives.filter((_, i) => i !== index);
            updatePlanData({ objectives: newObjectives });
        }
    };

    const addKeyResult = (objIndex: number) => {
        const newObjectives = [...planData.objectives];
        newObjectives[objIndex].keyResults.push({ title: '' });
        updatePlanData({ objectives: newObjectives });
    };

    const removeKeyResult = (objIndex: number, krIndex: number) => {
        const newObjectives = [...planData.objectives];
        if (newObjectives[objIndex].keyResults.length > 1) {
            newObjectives[objIndex].keyResults = newObjectives[objIndex].keyResults.filter((_, i) => i !== krIndex);
            updatePlanData({ objectives: newObjectives });
        }
    };
    
    const handleGenerateSuggestions = async () => {
        setIsGenerating(true);
        try {
            const generatedSuggestions = await generateGoalSuggestions(planData.swot);
            setSuggestions(generatedSuggestions);
        } catch (error) {
            console.error("Error generating suggestions:", error);
            alert("Ocorreu um erro ao gerar sugestões. Por favor, tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const applySuggestion = (suggestion: string) => {
        const firstEmptyIndex = planData.objectives.findIndex(obj => obj.title.trim() === '');
        const newObjectives = [...planData.objectives];

        if (firstEmptyIndex !== -1) {
            newObjectives[firstEmptyIndex].title = suggestion;
        } else {
            newObjectives.push({ title: suggestion, keyResults: [{ title: '' }] });
        }
        updatePlanData({ objectives: newObjectives });
        // Remove suggestion from list after applying it
        setSuggestions(prev => prev.filter(s => s !== suggestion));
    };


    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Passo 3: Objetivos Estratégicos (OKRs)</h2>
            <p className="text-gray-600 mb-6">Defina os principais objetivos para o ano e os resultados mensuráveis que indicarão seu sucesso. Onde você quer chegar (Objetivo) e como saberá que chegou lá (Resultados-Chave)?</p>
            
            <div className="my-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                    Precisa de inspiração?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Use a IA para gerar sugestões de objetivos com base na sua Análise SWOT.
                </p>
                <Button onClick={handleGenerateSuggestions} variant="secondary" isLoading={isGenerating}>
                    {isGenerating ? 'Analisando SWOT...' : 'Gerar Sugestões de Objetivos'}
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

            <div className="space-y-6">
                {planData.objectives.map((obj, objIndex) => (
                    <div key={objIndex} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="text"
                                value={obj.title}
                                onChange={(e) => handleObjectiveChange(objIndex, e.target.value)}
                                placeholder={`Objetivo ${objIndex + 1}. Ex: Aumentar a base de clientes`}
                                className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-semibold focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                            <Button onClick={() => removeObjective(objIndex)} variant="ghost" className="px-3 py-2 text-sm" disabled={planData.objectives.length <= 1}>
                                Remover
                            </Button>
                        </div>
                        <div className="ml-4 space-y-2">
                             <label className="text-sm font-medium text-gray-500">Resultados-Chave</label>
                            {obj.keyResults.map((kr, krIndex) => (
                                <div key={krIndex} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={kr.title}
                                        onChange={(e) => handleKeyResultChange(objIndex, krIndex, e.target.value)}
                                        placeholder={`Resultado-chave. Ex: Conquistar 10 novos alunos por mês`}
                                        className="flex-grow block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                     <button type="button" onClick={() => removeKeyResult(objIndex, krIndex)} className="text-gray-400 hover:text-red-500" disabled={obj.keyResults.length <= 1}>&times;</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addKeyResult(objIndex)} className="text-sm font-medium text-teal-600 hover:text-teal-800 mt-2">+ Adicionar resultado-chave</button>
                        </div>
                    </div>
                ))}
            </div>

            <Button onClick={addObjective} variant="secondary" className="mt-6">
                Adicionar Outro Objetivo
            </Button>

            <div className="mt-8 flex justify-between">
                <Button onClick={onBack} variant="ghost">Voltar</Button>
                <Button onClick={onNext}>Próximo Passo</Button>
            </div>
        </Card>
    );
};

export default GoalsStep;