import React, { useState, useMemo } from 'react';
import type { OnboardingData, CheckInData, CheckInRecord, AppStatus, GoalTransitionPlan } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Select } from './Select';
import { Spinner } from './Spinner';
import { generateGoalTransitionPlan } from '../services/geminiService';
import { DietPhase, ReverseDietPace } from '../types';

interface GoalSwitcherModalProps {
    onboardingData: OnboardingData;
    checkInData: CheckInData;
    history: CheckInRecord[];
    onClose: () => void;
    onApplyNewPlan: (newPlan: CheckInData) => void;
}

const getAvailableGoals = (currentPhase: DietPhase): DietPhase[] => {
    switch (currentPhase) {
        case DietPhase.FAT_LOSS:
            return [DietPhase.MAINTENANCE, DietPhase.REVERSE_DIETING];
        case DietPhase.REVERSE_DIETING:
            return [DietPhase.MAINTENANCE, DietPhase.LEAN_GAINING, DietPhase.FAT_LOSS];
        case DietPhase.MAINTENANCE:
            return [DietPhase.FAT_LOSS, DietPhase.LEAN_GAINING, DietPhase.REVERSE_DIETING];
        case DietPhase.LEAN_GAINING:
            return [DietPhase.MAINTENANCE, DietPhase.FAT_LOSS];
        default:
            return Object.values(DietPhase).filter(p => p !== currentPhase);
    }
};

export const GoalSwitcherModal: React.FC<GoalSwitcherModalProps> = ({ onboardingData, checkInData, history, onClose, onApplyNewPlan }) => {
    const [selectedGoal, setSelectedGoal] = useState<DietPhase | ''>('');
    const [status, setStatus] = useState<AppStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<GoalTransitionPlan | null>(null);

    const availableGoals = useMemo(() => getAvailableGoals(checkInData.dietPhase), [checkInData.dietPhase]);

    const handleGenerate = async () => {
        if (!selectedGoal) return;
        setStatus('loading');
        setError(null);
        try {
            const plan = await generateGoalTransitionPlan(onboardingData, checkInData, history, selectedGoal);
            setGeneratedPlan(plan);
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : "The AI failed to create a transition plan. Please try again.");
            setStatus('error');
        }
    };

    const handleConfirm = () => {
        if (!generatedPlan) return;
        const newCheckInData: CheckInData = {
            ...checkInData,
            dietPhase: generatedPlan.updatedDietPhase,
            dietPace: generatedPlan.updatedDietPhase === DietPhase.REVERSE_DIETING ? checkInData.dietPace || ReverseDietPace.CONSERVATIVE : undefined,
            targetCalories: generatedPlan.newTargetCalories,
            targetProtein: generatedPlan.newTargetProtein,
            targetCarbs: generatedPlan.newTargetCarbs,
            targetFat: generatedPlan.newTargetFat,
            targetFiber: generatedPlan.newTargetFiber,
            targetCardioMinutes: generatedPlan.newTargetCardioMinutes,
            previousWeight: checkInData.currentWeight,
            isDietBreak: false,
            // Reset subjective scores
            energy: 5, hunger: 5, mood: 5, sleep: 5, strength: 5, stress: 5, motivation: 5, adherence: 10,
        };
        onApplyNewPlan(newCheckInData);
    };

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Spinner size="h-10 w-10" className="text-brand"/>
                    <p className="text-slate-600 dark:text-slate-400">AI is building your transition plan...</p>
                </div>
            );
        }
        if (status === 'success' && generatedPlan) {
            return (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">AI Transition Plan:</h3>
                     <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{generatedPlan.rationale}</p>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Calories</p>
                            <p className="text-xl font-bold text-brand">{generatedPlan.newTargetCalories}</p>
                        </div>
                        <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Protein</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{generatedPlan.newTargetProtein}g</p>
                        </div>
                         <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Carbs</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{generatedPlan.newTargetCarbs}g</p>
                        </div>
                         <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fat</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{generatedPlan.newTargetFat}g</p>
                        </div>
                         <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg col-span-2 md:col-span-1">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cardio</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{generatedPlan.newTargetCardioMinutes} min/wk</p>
                        </div>
                     </div>
                     <div className="flex flex-col sm:flex-row-reverse gap-3 mt-4">
                        <Button onClick={handleConfirm} className="w-full">Confirm & Switch Goal</Button>
                        <Button onClick={() => { setStatus('idle'); setGeneratedPlan(null); }} variant="secondary" className="w-full">Back</Button>
                     </div>
                </div>
            )
        }
        return (
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your current goal is <span className="font-bold text-slate-800 dark:text-slate-200">{checkInData.dietPhase}</span>.
                    Switching goals will generate a new set of macros and cardio targets to ensure a smooth transition.
                </p>
                <Select id="goal-switch" label="Select your new goal" value={selectedGoal} onChange={e => setSelectedGoal(e.target.value as DietPhase)}>
                    <option value="" disabled>Choose a new goal...</option>
                    {availableGoals.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                </Select>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button onClick={handleGenerate} disabled={!selectedGoal} className="w-full">Generate Transition Plan</Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} aria-modal="true" role="dialog">
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Change Your Goal</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {renderContent()}
            </Card>
        </div>
    );
};