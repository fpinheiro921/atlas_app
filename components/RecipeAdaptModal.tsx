import React, { useState } from 'react';
import type { Meal, CheckInData, AppStatus } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { generateOrModifyRecipe } from '../services/geminiService';

// Re-usable component to display a recipe's details
const RecipeDisplay: React.FC<{ meal: Meal }> = ({ meal }) => (
    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-lg mt-4 animate-fade-in">
        <h4 className="text-lg font-bold text-brand dark:text-brand-light">{meal.mealType}: <span className="text-slate-900 dark:text-white">{meal.recipeName}</span></h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{meal.rationale}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-4">
            <span>🔥 {meal.calories} kcal</span>
            <span>💪 {meal.protein}g P</span>
            <span>🍞 {meal.carbs}g C</span>
            <span>🥑 {meal.fat}g F</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h5 className="font-semibold mb-2 text-sm text-slate-700 dark:text-slate-300">Ingredients</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
            </div>
            <div>
                <h5 className="font-semibold mb-2 text-sm text-slate-700 dark:text-slate-300">Instructions</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {meal.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
            </div>
        </div>
    </div>
);


interface RecipeAdaptModalProps {
    meal: Meal;
    checkInData: CheckInData;
    onClose: () => void;
    onSaveRecipe: (meal: Meal) => void;
}

export const RecipeAdaptModal: React.FC<RecipeAdaptModalProps> = ({ meal, checkInData, onClose, onSaveRecipe }) => {
    const [adaptPrompt, setAdaptPrompt] = useState('');
    const [status, setStatus] = useState<AppStatus>('idle');
    const [adaptedRecipe, setAdaptedRecipe] = useState<Meal | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdapt = async () => {
        if (!adaptPrompt.trim()) return;
        setStatus('loading');
        setError(null);
        try {
            const result = await generateOrModifyRecipe(checkInData, adaptPrompt, meal);
            // Ensure the new recipe has a unique name if the AI didn't change it
            const newName = result.recipeName.toLowerCase() === meal.recipeName.toLowerCase() 
                ? `${result.recipeName} (Adapted)` 
                : result.recipeName;
            setAdaptedRecipe({ ...result, recipeName: newName });
            setStatus('success');
        } catch (e) {
            console.error("Recipe adaptation failed:", e);
            setError(e instanceof Error ? e.message : "The AI failed to adapt the recipe. Please try again.");
            setStatus('error');
        }
    };

    const handleSave = () => {
        if (adaptedRecipe) {
            onSaveRecipe(adaptedRecipe);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">Adapt "{meal.recipeName}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 -mr-4 space-y-4">
                    {status === 'idle' && (
                        <div className="space-y-4">
                            <label htmlFor="adapt-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">How would you like to change this recipe?</label>
                            <textarea
                                id="adapt-prompt"
                                rows={3}
                                className="block w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm text-slate-900 dark:text-white"
                                placeholder="e.g., 'Make this vegetarian', 'Add more protein', 'Substitute chicken for fish'"
                                value={adaptPrompt}
                                onChange={(e) => setAdaptPrompt(e.target.value)}
                            />
                            <Button onClick={handleAdapt} isLoading={false} className="w-full">Generate Adaptation</Button>
                        </div>
                    )}
                    
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Spinner size="h-10 w-10 text-brand"/>
                            <p className="text-slate-600 dark:text-slate-400">Chef Atlas is adapting your recipe...</p>
                        </div>
                    )}

                    {status === 'error' && (
                         <div className="text-center p-4">
                            <h3 className="text-lg font-bold text-red-500">Adaptation Failed</h3>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">{error}</p>
                            <Button onClick={() => setStatus('idle')} variant="secondary" className="mt-4">Try Again</Button>
                        </div>
                    )}

                    {status === 'success' && adaptedRecipe && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Adapted Version:</h3>
                            <RecipeDisplay meal={adaptedRecipe} />
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row-reverse gap-3">
                                <Button onClick={handleSave} className="w-full sm:w-auto">Save Adapted Recipe</Button>
                                <Button onClick={() => setStatus('idle')} variant="secondary" className="w-full sm:w-auto">Adapt Again</Button>
                            </div>
                        </div>
                    )}

                </div>
            </Card>
        </div>
    );
};