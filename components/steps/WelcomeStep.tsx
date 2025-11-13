import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface WelcomeStepProps {
    onNext: () => void;
    onShowSavedPlans: () => void;
    hasSavedPlans: boolean;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onShowSavedPlans, hasSavedPlans }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <Card className="text-center">
                <h2 className="text-3xl font-bold text-teal-800 mb-4">Bem-vindo(a) ao seu Planejador Estratégico!</h2>
                <p className="text-lg text-gray-600 mb-6">
                    Vamos construir juntos um plano anual de sucesso para o seu estúdio de Pilates. Este guia passo a passo, potencializado por inteligência artificial, irá ajudá-lo(a) a definir sua visão, analisar seus pontos fortes e fracos, estabelecer objetivos claros e criar um plano de ação concreto.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                    Pronto(a) para começar a transformar seu estúdio?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={onNext} className="w-full sm:w-auto">
                        Criar Novo Plano
                    </Button>
                    <Button 
                        onClick={onShowSavedPlans} 
                        variant="secondary" 
                        className="w-full sm:w-auto"
                        disabled={!hasSavedPlans}
                        title={!hasSavedPlans ? "Você ainda não tem planos salvos" : "Ver seus planos guardados"}
                    >
                        Ver Planos Salvos
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default WelcomeStep;