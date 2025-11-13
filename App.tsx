import React, { useState, useEffect } from 'react';
import { StrategicPlan, Step, SavedPlan } from './types';
import StepWizard from './components/StepWizard';
import WelcomeStep from './components/steps/WelcomeStep';
import VisionStep from './components/steps/VisionStep';
import SwotStep from './components/steps/SwotStep';
import GoalsStep from './components/steps/GoalsStep';
import ActionsStep from './components/steps/ActionsStep';
import ReviewStep from './components/steps/ReviewStep';
import GeneratedPlan from './components/steps/GeneratedPlan';
import { generateFullReport } from './services/geminiService';
import { getSavedPlans, savePlan, updatePlan, deletePlan } from './services/geminiService';
import SavedPlansList from './components/steps/SavedPlansList';

const initialPlanData: StrategicPlan = {
    studioName: '',
    planningYear: new Date().getFullYear().toString(),
    vision: '',
    mission: '',
    swot: {
        strengths: [''],
        weaknesses: [''],
        opportunities: [''],
        threats: [''],
    },
    objectives: [{ title: '', keyResults: [{ title: '' }] }],
    quarterlyActions: [
        { quarter: 'Q1', actions: [''] },
        { quarter: 'Q2', actions: [''] },
        { quarter: 'Q3', actions: [''] },
        { quarter: 'Q4', actions: [''] },
    ],
};

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
    const [planData, setPlanData] = useState<StrategicPlan>(initialPlanData);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
    const [showSavedPlans, setShowSavedPlans] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const plans = await getSavedPlans();
                setSavedPlans(plans);
            } catch (error) {
                console.error("Failed to load plans:", error);
                const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
                alert(`Não foi possível carregar os planos salvos.\n\nDetalhes: ${errorMessage}\n\nIsso pode ser devido à falta de uma tabela 'plans' ou a políticas de segurança (RLS) no Supabase. Por favor, verifique a configuração do seu banco de dados.`);
                setSavedPlans([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const goToNextStep = () => {
        if (currentStep < Step.GeneratedPlan) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > Step.Welcome) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const startOver = () => {
        setPlanData(initialPlanData);
        setGeneratedReport('');
        setCurrentPlanId(null);
        setCurrentStep(Step.Welcome);
        setShowSavedPlans(false);
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const report = await generateFullReport(planData);
            setGeneratedReport(report);
            goToNextStep();
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!generatedReport) return;

        setIsSaving(true);
        try {
            if (currentPlanId) {
                // Update existing plan
                const planToUpdate: SavedPlan = {
                    id: currentPlanId,
                    created_at: savedPlans.find(p => p.id === currentPlanId)?.created_at || new Date().toISOString(),
                    planData,
                    report: generatedReport,
                };
                const updated = await updatePlan(planToUpdate);
                setSavedPlans(savedPlans.map(p => (p.id === currentPlanId ? updated : p)));
            } else {
                // Save new plan
                const planToSave = {
                    planData,
                    report: generatedReport,
                };
                const newPlan = await savePlan(planToSave);
                setSavedPlans([newPlan, ...savedPlans]);
                setCurrentPlanId(newPlan.id);
            }
        } catch (error) {
            console.error("Error saving plan:", error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Ocorreu um erro ao salvar o plano. Por favor, tente novamente.\n\nDetalhes: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };


    const handleLoadPlan = (plan: SavedPlan) => {
        setPlanData(plan.planData);
        setGeneratedReport(plan.report);
        setCurrentPlanId(plan.id);
        setShowSavedPlans(false);
        setCurrentStep(Step.Vision);
    };

    const handleDeletePlan = async (id: string) => {
        const originalPlans = [...savedPlans];
        // Optimistic UI update
        const updatedPlans = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updatedPlans);
        try {
            await deletePlan(id);
        } catch (error) {
            console.error("Error deleting plan:", error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Ocorreu um erro ao excluir o plano. Por favor, tente novamente.\n\nDetalhes: ${errorMessage}`);
            // Revert if deletion fails
            setSavedPlans(originalPlans);
        }
    };
    
    const updatePlanData = (updates: Partial<StrategicPlan>) => {
        setPlanData(prev => ({ ...prev, ...updates }));
    };

    const renderStep = () => {
        switch (currentStep) {
            case Step.Welcome:
                return showSavedPlans ? (
                    <SavedPlansList
                        savedPlans={savedPlans}
                        onLoad={handleLoadPlan}
                        onDelete={handleDeletePlan}
                        onBack={() => setShowSavedPlans(false)}
                    />
                ) : (
                    <WelcomeStep
                        onNext={goToNextStep}
                        onShowSavedPlans={() => setShowSavedPlans(true)}
                        hasSavedPlans={savedPlans.length > 0}
                    />
                );
            case Step.Vision:
                return <VisionStep planData={planData} updatePlanData={updatePlanData} onNext={goToNextStep} onBack={goToPreviousStep} />;
            case Step.SWOT:
                return <SwotStep planData={planData} updatePlanData={updatePlanData} onNext={goToNextStep} onBack={goToPreviousStep} />;
            case Step.Goals:
                return <GoalsStep planData={planData} updatePlanData={updatePlanData} onNext={goToNextStep} onBack={goToPreviousStep} />;
            case Step.Actions:
                return <ActionsStep planData={planData} updatePlanData={updatePlanData} onNext={goToNextStep} onBack={goToPreviousStep} />;
            case Step.Review:
                return <ReviewStep planData={planData} onGenerate={handleGenerateReport} onBack={goToPreviousStep} isLoading={isLoading} />;
            case Step.GeneratedPlan:
                return <GeneratedPlan 
                            report={generatedReport} 
                            planData={planData}
                            onStartOver={startOver}
                            onSave={handleSavePlan}
                            isSaved={!!currentPlanId}
                            isSaving={isSaving}
                        />;
            default:
                return <WelcomeStep 
                            onNext={goToNextStep} 
                            onShowSavedPlans={() => setShowSavedPlans(true)}
                            hasSavedPlans={savedPlans.length > 0} 
                        />;
        }
    };
    
    return (
        <div className="min-h-screen bg-teal-50/50 font-sans text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-5xl mb-6 text-center">
                 <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 tracking-tight">
                    Planejador Estratégico
                </h1>
                <p className="text-lg text-teal-600 mt-2">Para Estúdios de Pilates</p>
            </header>

            {currentStep > Step.Welcome && currentStep < Step.GeneratedPlan && (
                <div className="w-full max-w-4xl mb-8">
                    <StepWizard currentStep={currentStep} />
                </div>
            )}

            <main className="w-full max-w-4xl flex-grow">
                {renderStep()}
            </main>

            <footer className="w-full max-w-5xl mt-12 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Pilates Plan Pro. Potencializado por IA.</p>
            </footer>
        </div>
    );
};

export default App;