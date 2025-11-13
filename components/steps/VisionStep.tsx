
import React, { useState } from 'react';
import { StrategicPlan } from '../../types';
import Card from '../common/Card';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { generateVisionMissionText } from '../../services/geminiService';

interface VisionStepProps {
    planData: StrategicPlan;
    updatePlanData: (updates: Partial<StrategicPlan>) => void;
    onNext: () => void;
    onBack: () => void;
}

const visionSuggestions = [
    "Referência na comunidade", "Bem-estar integral", "Saúde e movimento", "Espaço acolhedor", "Resultados transformadores", "Inovação em Pilates", "Atendimento personalizado", "Qualidade de vida"
];

const missionSuggestions = [
    "Transformar vidas", "Movimento consciente", "Aulas de alta qualidade", "Cuidado individualizado", "Promover saúde", "Inspirar hábitos saudáveis", "Resultados duradouros", "Comunidade forte"
];

const VisionStep: React.FC<VisionStepProps> = ({ planData, updatePlanData, onNext, onBack }) => {
    const [selectedVision, setSelectedVision] = useState<string[]>([]);
    const [selectedMission, setSelectedMission] = useState<string[]>([]);
    const [isGeneratingVision, setIsGeneratingVision] = useState(false);
    const [isGeneratingMission, setIsGeneratingMission] = useState(false);

    const handleSuggestionToggle = (
        suggestion: string,
        type: 'vision' | 'mission'
    ) => {
        const selected = type === 'vision' ? selectedVision : selectedMission;
        const setSelected = type === 'vision' ? setSelectedVision : setSelectedMission;

        if (selected.includes(suggestion)) {
            setSelected(selected.filter(s => s !== suggestion));
        } else {
            setSelected([...selected, suggestion]);
        }
    };

    const handleGenerate = async (type: 'vision' | 'mission') => {
        const keywords = type === 'vision' ? selectedVision : selectedMission;
        const setGenerating = type === 'vision' ? setIsGeneratingVision : setIsGeneratingMission;

        if (keywords.length === 0) return;

        setGenerating(true);
        try {
            const generatedText = await generateVisionMissionText(type, keywords, planData.studioName || 'Meu Estúdio');
            updatePlanData({ [type]: generatedText });
        } catch (error) {
            console.error(`Error generating ${type}:`, error);
            alert(`Ocorreu um erro ao gerar a ${type}. Por favor, tente novamente.`);
        } finally {
            setGenerating(false);
        }
    };

    const SuggestionBox: React.FC<{
        title: string;
        suggestions: string[];
        selected: string[];
        onToggle: (suggestion: string) => void;
    }> = ({ title, suggestions, selected, onToggle }) => (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map(suggestion => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => onToggle(suggestion)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selected.includes(suggestion)
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Passo 1: Visão e Missão</h2>
            <p className="text-gray-600 mb-6">Defina a base do seu negócio. Você pode escrever diretamente, ou selecionar algumas ideias abaixo e usar a IA para criar um texto para você.</p>
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                     <Input
                        label="Nome do Estúdio"
                        id="studioName"
                        value={planData.studioName || ''}
                        onChange={(e) => updatePlanData({ studioName: e.target.value })}
                        placeholder="Ex: Pilates & Bem-Estar Ananda"
                        required
                    />
                    <Input
                        label="Ano do Planejamento"
                        id="planningYear"
                        value={planData.planningYear || ''}
                        onChange={(e) => updatePlanData({ planningYear: e.target.value })}
                        placeholder={`Ex: ${new Date().getFullYear()}`}
                        required
                    />
                </div>
                
                <div>
                    <Textarea
                        label="Visão de Futuro"
                        id="vision"
                        value={planData.vision}
                        onChange={(e) => updatePlanData({ vision: e.target.value })}
                        placeholder="Descreva onde você vê seu estúdio em 5 anos. Ex: Ser o estúdio de referência em saúde e bem-estar na nossa comunidade."
                        required
                    />
                    <SuggestionBox
                        title="Ou selecione algumas ideias para a IA criar sua Visão:"
                        suggestions={visionSuggestions}
                        selected={selectedVision}
                        onToggle={(s) => handleSuggestionToggle(s, 'vision')}
                    />
                    <div className="text-right mt-2">
                         <Button
                            onClick={() => handleGenerate('vision')}
                            variant="secondary"
                            className="py-1.5 px-3 text-sm"
                            isLoading={isGeneratingVision}
                            disabled={selectedVision.length === 0 || isGeneratingVision}
                        >
                            {isGeneratingVision ? 'Gerando...' : 'Gerar com IA'}
                        </Button>
                    </div>
                </div>

                <div>
                    <Textarea
                        label="Missão"
                        id="mission"
                        value={planData.mission}
                        onChange={(e) => updatePlanData({ mission: e.target.value })}
                        placeholder="Qual o propósito do seu estúdio? Ex: Transformar a vida das pessoas através do movimento consciente, oferecendo aulas de Pilates personalizadas e de alta qualidade."
                        required
                    />
                    <SuggestionBox
                        title="Ou selecione algumas ideias para a IA criar sua Missão:"
                        suggestions={missionSuggestions}
                        selected={selectedMission}
                        onToggle={(s) => handleSuggestionToggle(s, 'mission')}
                    />
                     <div className="text-right mt-2">
                        <Button
                            onClick={() => handleGenerate('mission')}
                            variant="secondary"
                            className="py-1.5 px-3 text-sm"
                            isLoading={isGeneratingMission}
                            disabled={selectedMission.length === 0 || isGeneratingMission}
                        >
                            {isGeneratingMission ? 'Gerando...' : 'Gerar com IA'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <Button onClick={onBack} variant="ghost">Voltar</Button>
                <Button onClick={onNext} disabled={!planData.studioName || !planData.planningYear || !planData.vision || !planData.mission}>Próximo Passo</Button>
            </div>
        </Card>
    );
};

export default VisionStep;