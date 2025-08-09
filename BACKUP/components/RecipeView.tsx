import React, { useState } from 'react';
import type { Meal, CheckInData, AppStatus } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';
import { generateOrModifyRecipe } from '../services/geminiService';
import { RecipeAdaptModal } from './RecipeAdaptModal';

interface RecipeViewProps {
    savedRecipes: Meal[];
    checkInData: CheckInData;
    onSaveRecipe: (meal: Meal) => void;
    onDeleteRecipe: (recipeName: string) => void;
}

type RecipeViewTab = 'my_recipes' | 'find_new';

const RecipeCard: React.FC<{ meal: Meal; onClick: () => void }> = ({ meal, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{meal.recipeName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">{meal.mealType}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-3">
            <span className="font-semibold text-brand">🔥{meal.calories}kcal</span>
            <span>P:{meal.protein}g</span>
            <span>C:{meal.carbs}g</span>
            <span>F:{meal.fat}g</span>
        </div>
    </button>
);

const RecipeDetailModal: React.FC<{ meal: Meal; onClose: () => void; onAdapt: () => void; onDelete: () => void; }> = ({ meal, onClose, onAdapt, onDelete }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">{meal.recipeName}</h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="overflow-y-auto pr-2 -mr-4 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">{meal.rationale}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Ingredients</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Instructions</h5>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            {meal.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                <Button onClick={onAdapt} className="w-full sm:w-auto">
                    <span className="material-symbols-outlined mr-2">auto_fix</span>Adapt with AI
                </Button>
                <Button onClick={onDelete} variant="secondary" className="w-full sm:w-auto !text-red-500 !bg-red-500/10 hover:!bg-red-500/20">Delete</Button>
            </div>
        </Card>
    </div>
);


export const RecipeView: React.FC<RecipeViewProps> = ({ savedRecipes, checkInData, onSaveRecipe, onDeleteRecipe }) => {
    const [activeTab, setActiveTab] = useState<RecipeViewTab>('my_recipes');
    const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
    const [adaptingRecipe, setAdaptingRecipe] = useState<Meal | null>(null);

    // State for "Find New" tab
    const [findStatus, setFindStatus] = useState<AppStatus>('idle');
    const [findPrompt, setFindPrompt] = useState('');
    const [foundRecipe, setFoundRecipe] = useState<Meal | null>(null);

    const handleFindRecipe = async () => {
        setFindStatus('loading');
        setFoundRecipe(null);
        try {
            const recipe = await generateOrModifyRecipe(checkInData, findPrompt);
            setFoundRecipe(recipe);
            setFindStatus('success');
        } catch (e) {
            console.error("Error finding recipe:", e);
            setFindStatus('error');
        }
    };
    
    const handleSaveFoundRecipe = () => {
        if(foundRecipe) {
            onSaveRecipe(foundRecipe);
            // Optionally switch to my recipes tab after saving
            setActiveTab('my_recipes');
            setFoundRecipe(null);
            setFindStatus('idle');
            setFindPrompt('');
        }
    };

    const isFoundRecipeSaved = foundRecipe ? savedRecipes.some(r => r.recipeName.toLowerCase() === foundRecipe.recipeName.toLowerCase()) : false;

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('my_recipes')}
                        className={`${activeTab === 'my_recipes' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
                    >
                        My Recipes ({savedRecipes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('find_new')}
                        className={`${activeTab === 'find_new' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
                    >
                        Find New Recipes
                    </button>
                </nav>
            </div>

            {activeTab === 'my_recipes' && (
                <Card>
                    {savedRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedRecipes.map(recipe => (
                                <RecipeCard key={recipe.recipeName} meal={recipe} onClick={() => setSelectedRecipe(recipe)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                            Your saved recipes will appear here. Find a new recipe or save one from a generated meal plan to get started.
                        </p>
                    )}
                </Card>
            )}

            {activeTab === 'find_new' && (
                <Card>
                    <div className="space-y-4">
                        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">What are you looking for?</h2>
                        <Input 
                            id="find-prompt"
                            label="Describe the recipe you want"
                            value={findPrompt}
                            onChange={(e) => setFindPrompt(e.target.value)}
                            placeholder="e.g., a high-protein breakfast with eggs"
                            disabled={findStatus === 'loading'}
                        />
                        <Button onClick={handleFindRecipe} isLoading={findStatus === 'loading'}>Find Recipe with AI</Button>
                    </div>

                    {findStatus === 'loading' && (
                         <div className="flex items-center justify-center p-8 space-x-2">
                            <Spinner size="h-6 w-6" className="text-brand" />
                            <p className="text-slate-600 dark:text-slate-400">Chef Atlas is thinking...</p>
                        </div>
                    )}
                    {findStatus === 'error' && <p className="text-red-500 text-sm mt-4">Sorry, the AI couldn't generate a recipe. Please try a different prompt.</p>}
                    {findStatus === 'success' && foundRecipe && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">AI Found a Recipe!</h2>
                            <RecipeCard meal={foundRecipe} onClick={() => setSelectedRecipe(foundRecipe)} />
                             <Button onClick={handleSaveFoundRecipe} disabled={isFoundRecipeSaved}>
                                {isFoundRecipeSaved ? 'Saved to My Recipes' : 'Save to My Recipes'}
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            {selectedRecipe && (
                <RecipeDetailModal 
                    meal={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)}
                    onAdapt={() => {
                        setAdaptingRecipe(selectedRecipe);
                        setSelectedRecipe(null);
                    }}
                    onDelete={() => {
                        if (window.confirm(`Are you sure you want to delete "${selectedRecipe.recipeName}"?`)) {
                            onDeleteRecipe(selectedRecipe.recipeName);
                            setSelectedRecipe(null);
                        }
                    }}
                />
            )}
            
            {adaptingRecipe && (
                <RecipeAdaptModal
                    meal={adaptingRecipe}
                    checkInData={checkInData}
                    onClose={() => setAdaptingRecipe(null)}
                    onSaveRecipe={onSaveRecipe}
                />
            )}
        </div>
    );
};
