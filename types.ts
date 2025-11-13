export enum Step {
    Welcome = 0,
    Vision = 1,
    SWOT = 2,
    Goals = 3,
    Actions = 4,
    Review = 5,
    GeneratedPlan = 6
}

export interface SWOT {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface KeyResult {
    title: string;
}

export interface Objective {
    title: string;
    keyResults: KeyResult[];
}

export interface QuarterlyAction {
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    actions: string[];
}

export interface StrategicPlan {
    studioName: string;
    planningYear: string;
    vision: string;
    mission: string;
    swot: SWOT;
    objectives: Objective[];
    quarterlyActions: QuarterlyAction[];
}

export interface SavedPlan {
    id: string;
    created_at: string;
    planData: StrategicPlan;
    report: string;
}