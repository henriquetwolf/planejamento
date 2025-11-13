
import React from 'react';
import { Step } from '../types';

interface StepWizardProps {
    currentStep: Step;
}

const STEPS_CONFIG = [
    { id: Step.Vision, name: 'Visão & Missão' },
    { id: Step.SWOT, name: 'Análise SWOT' },
    { id: Step.Goals, name: 'Objetivos' },
    { id: Step.Actions, name: 'Plano de Ação' },
    { id: Step.Review, name: 'Revisão' },
];

const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {STEPS_CONFIG.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== STEPS_CONFIG.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {currentStep > step.id ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-teal-600" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center bg-teal-600 rounded-full">
                                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="sr-only">{step.name}</span>
                                </div>
                            </>
                        ) : currentStep === step.id ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-teal-600 rounded-full" aria-current="step">
                                    <span className="h-2.5 w-2.5 bg-teal-600 rounded-full" aria-hidden="true" />
                                    <span className="absolute -bottom-6 text-xs font-semibold text-teal-600">{step.name}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="group relative flex h-8 w-8 items-center justify-center bg-white border-2 border-gray-300 rounded-full">
                                    <span className="absolute -bottom-6 text-xs font-medium text-gray-500">{step.name}</span>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default StepWizard;
