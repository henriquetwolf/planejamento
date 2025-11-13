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
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
    const [showSavedPlans, setShowSavedPlans] = useState(false);

    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem('pilates_strategic_plans');
            if (storedPlans) {
                setSavedPlans(JSON.parse(storedPlans));
            }
        } catch (error) {
            console.error("Failed to load plans from localStorage:", error);
            setSavedPlans([]);
        }
    }, []);

    const updateLocalStorage = (plans: SavedPlan[]) => {
        try {
            localStorage.setItem('pilates_strategic_plans', JSON.stringify(plans));
        } catch (error) {
            console.error("Failed to save plans to localStorage:", error);
        }
    };
    
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

    const handleSavePlan = () => {
        if (!generatedReport) return;
        
        const newPlan: SavedPlan = {
            id: currentPlanId || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            planData,
            report: generatedReport,
        };

        const existingPlanIndex = savedPlans.findIndex(p => p.id === newPlan.id);
        let updatedPlans;

        if (existingPlanIndex > -1) {
            updatedPlans = [...savedPlans];
            updatedPlans[existingPlanIndex] = newPlan;
        } else {
            updatedPlans = [newPlan, ...savedPlans];
        }

        setSavedPlans(updatedPlans);
        updateLocalStorage(updatedPlans);
        setCurrentPlanId(newPlan.id);
    };

    const handleLoadPlan = (plan: SavedPlan) => {
        setPlanData(plan.planData);
        setGeneratedReport(plan.report);
        setCurrentPlanId(plan.id);
        setShowSavedPlans(false);
        setCurrentStep(Step.Vision);
    };

    const handleDeletePlan = (id: string) => {
        const updatedPlans = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updatedPlans);
        updateLocalStorage(updatedPlans);
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