import React, { useState } from 'react';
import type { CheckInData, MealPlan, Meal, AppStatus, CheckInRecord, DailyMealLog, OnboardingData } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';
import { generateWeeklyMealPlan } from '../services/geminiService';
import { MealPlanDisplay } from './MealPlanDisplay';

interface MealPlanViewProps {
    checkInData: CheckInData;
    onboardingData: OnboardingData;
    history: CheckInRecord[];
    loggedMeals: DailyMealLog[];
    activePlan: MealPlan | null;
    onSavePlan: (plan: MealPlan) => void;
    onSaveRecipe: (meal: Meal) => void;
    isRecipeSaved: (recipeName: string) => boolean;
}

export const MealPlanView: React.FC<MealPlanViewProps> = ({ checkInData, onboardingData, history, loggedMeals, activePlan, onSavePlan, onSaveRecipe, isRecipeSaved }) => {
    const [status, setStatus] = useState<AppStatus>('idle');
    const [preferences, setPreferences] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setStatus('loading');
        setError(null);
        setGeneratedPlan(null);
        try {
            const result = await generateWeeklyMealPlan(checkInData, onboardingData, history, loggedMeals, preferences);
            setGeneratedPlan(result);
            setStatus('success');
        } catch (err) {
            console.error("Meal plan generation failed:", err);
            setError(err instanceof Error ? err.message : "The AI failed to generate a meal plan. This can happen during high demand. Please try again.");
            setStatus('error');
        }
    };
    
    const handleResetGenerator = () => {
        setStatus('idle');
        setGeneratedPlan(null);
        setError(null);
    };
    
    const handleSave = () => {
        if(generatedPlan) {
            onSavePlan(generatedPlan);
        }
    };

    const renderGenerator = () => {
        if (status === 'success' && generatedPlan) {
            return (
                 <div className="animate-fade-in space-y-6">
                    <MealPlanDisplay
                        plan={generatedPlan}
                        onSaveRecipe={onSaveRecipe}
                        isRecipeSaved={isRecipeSaved}
                    />
                    <div className="flex flex-col sm:flex-row-reverse gap-3">
                        <Button onClick={handleSave} className="w-full sm:w-auto">Save Plan to Dashboard</Button>
                        <Button onClick={handleResetGenerator} variant="secondary" className="w-full sm:w-auto">Generate New Plan</Button>
                    </div>
                </div>
            );
        }

        return (
             <fieldset disabled={status === 'loading'} className="space-y-6 animate-fade-in group">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">
                    {activePlan && !generatedPlan ? 'Generate a New Weekly Plan' : 'Generate Your Weekly Meal Plan'}
                </h2>
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        <p className="font-bold mb-1">Generation Failed</p>
                        <p>{error}</p>
                    </div>
                )}
                 {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                        <Spinner size="h-10 w-10" className="text-brand"/>
                        <p className="text-slate-600 dark:text-slate-400">Chef Atlas is preparing your weekly plan...</p>
                    </div>
                 )}

                <div className={`space-y-6 ${status === 'loading' ? 'hidden' : ''}`}>
                    <Input
                        id="preferences"
                        label="Any dietary preferences or restrictions for the week?"
                        type="text"
                        value={preferences}
                        onChange={e => setPreferences(e.target.value)}
                        placeholder="e.g., vegetarian, no fish, quick 30-min meals"
                    />

                    <Button onClick={handleGenerate} isLoading={status === 'loading'} className="w-full" size="lg">
                        Generate Weekly Plan with AI
                    </Button>
                </div>
            </fieldset>
        );
    };

    return (
        <div className="space-y-8">
            {activePlan && !generatedPlan && (
                 <MealPlanDisplay 
                    plan={activePlan} 
                    isRecipeSaved={isRecipeSaved}
                    onSaveRecipe={onSaveRecipe}
                />
            )}
            <Card>
                {renderGenerator()}
            </Card>
        </div>
    );
};
