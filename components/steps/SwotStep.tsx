
import React from 'react';
import { StrategicPlan, SWOT } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface SwotStepProps {
    planData: StrategicPlan;
    updatePlanData: (updates: Partial<StrategicPlan>) => void;
    onNext: () => void;
    onBack: () => void;
}

const strengthsSuggestions = ["Instrutores qualificados", "Localização privilegiada", "Equipamentos modernos", "Comunidade fiel de alunos", "Boa reputação", "Aulas diversificadas", "Ambiente acolhedor", "Atendimento personalizado"];
const weaknessesSuggestions = ["Pouca visibilidade online", "Espaço físico limitado", "Orçamento de marketing baixo", "Dependência de poucos instrutores", "Falta de sistema de agendamento", "Preços mais altos que concorrência", "Dificuldade em reter alunos", "Horários de aula limitados"];
const opportunitiesSuggestions = ["Crescente interesse por bem-estar", "Parcerias com empresas locais", "Oferecer aulas online/híbridas", "Eventos e workshops temáticos", "Programas para públicos específicos", "Uso de redes sociais para marketing", "Programas de fidelidade", "Venda de produtos relacionados"];
const threatsSuggestions = ["Novos concorrentes na região", "Crises econômicas", "Mudanças nas tendências de fitness", "Aumento do aluguel/custos", "Regulamentações governamentais", "Sazonalidade (baixa procura)", "Concorrência de academias low-cost", "Aplicativos de fitness online"];


const SwotInputList: React.FC<{
    title: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    colorClass: string;
    suggestions: string[];
}> = ({ title, items, onChange, placeholder, colorClass, suggestions }) => {
    
    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    const addItem = () => {
        onChange([...items, '']);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        if (items.includes(suggestion)) return;

        const firstEmptyIndex = items.findIndex(item => item.trim() === '');
        if (firstEmptyIndex !== -1) {
            const newItems = [...items];
            newItems[firstEmptyIndex] = suggestion;
            onChange(newItems);
        } else {
            onChange([...items, suggestion]);
        }
    };

    return (
        <div>
            <h3 className={`text-lg font-semibold ${colorClass} mb-2`}>{title}</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-grow block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                            disabled={items.length <= 1 && item.trim() === ''}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-800"
            >
                + Adicionar item
            </button>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-600 mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(suggestion => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                items.includes(suggestion)
                                    ? 'bg-teal-500 text-white cursor-default'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            disabled={items.includes(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const SwotStep: React.FC<SwotStepProps> = ({ planData, updatePlanData, onNext, onBack }) => {

    const handleSwotChange = (field: keyof SWOT, items: string[]) => {
        updatePlanData({ swot: { ...planData.swot, [field]: items } });
    };

    return (
        <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">Passo 2: Análise SWOT</h2>
            <p className="text-gray-600 mb-6">Vamos analisar o ambiente interno e externo do seu negócio. Seja honesto(a) para obter os melhores insights.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SwotInputList
                    title="Forças (Strengths)"
                    items={planData.swot.strengths}
                    onChange={(items) => handleSwotChange('strengths', items)}
                    placeholder="Ex: Instrutores experientes"
                    colorClass="text-green-600"
                    suggestions={strengthsSuggestions}
                />
                <SwotInputList
                    title="Fraquezas (Weaknesses)"
                    items={planData.swot.weaknesses}
                    onChange={(items) => handleSwotChange('weaknesses', items)}
                    placeholder="Ex: Pouca presença online"
                    colorClass="text-red-600"
                    suggestions={weaknessesSuggestions}
                />
                <SwotInputList
                    title="Oportunidades (Opportunities)"
                    items={planData.swot.opportunities}
                    onChange={(items) => handleSwotChange('opportunities', items)}
                    placeholder="Ex: Aumento da procura por bem-estar"
                    colorClass="text-blue-600"
                    suggestions={opportunitiesSuggestions}
                />
                <SwotInputList
                    title="Ameaças (Threats)"
                    items={planData.swot.threats}
                    onChange={(items) => handleSwotChange('threats', items)}
                    placeholder="Ex: Nova academia na vizinhança"
                    colorClass="text-yellow-600"
                    suggestions={threatsSuggestions}
                />
            </div>

            <div className="mt-8 flex justify-between">
                <Button onClick={onBack} variant="ghost">Voltar</Button>
                <Button onClick={onNext}>Próximo Passo</Button>
            </div>
        </Card>
    );
};

export default SwotStep;
