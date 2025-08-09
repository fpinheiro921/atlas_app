import React, { useState, useEffect } from 'react';
import type { MealPlan, Meal } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { UnitSystem } from '../types';
import { convertIngredients } from '../services/geminiService';
import { Spinner } from './Spinner';


interface MealCardProps {
    meal: Meal;
    onSave?: () => void;
    isSaved?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onSave, isSaved }) => {
    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow">
                    <h4 className="text-lg font-bold text-brand dark:text-brand-light">{meal.mealType}: <span className="text-slate-900 dark:text-white">{meal.recipeName}</span></h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{meal.rationale}</p>
                </div>
                 {onSave && (
                    <Button size="sm" variant="secondary" onClick={onSave} disabled={isSaved} className="!px-2 !py-1 flex-shrink-0">
                        <span className="material-symbols-outlined !text-base mr-1">{isSaved ? 'check' : 'bookmark_add'}</span>
                        {isSaved ? 'Saved' : 'Save'}
                    </Button>
                )}
            </div>
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
};

interface MealPlanDisplayProps {
    plan: MealPlan;
    onGenerateShoppingList?: () => void;
    onSaveRecipe?: (meal: Meal) => void;
    isRecipeSaved?: (recipeName: string) => boolean;
}

export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan, onGenerateShoppingList, onSaveRecipe, isRecipeSaved }) => {
    const [activeDay, setActiveDay] = useState<number>(1); // Day 1 to 7
    const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.ORIGINAL);
    const [displayPlan, setDisplayPlan] = useState<MealPlan>(plan);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        setDisplayPlan(plan);
        setUnitSystem(UnitSystem.ORIGINAL);
        setIsConverting(false);
    }, [plan]);

    const convertDayMeals = async (day: number, newUnit: UnitSystem) => {
        setUnitSystem(newUnit);

        if (newUnit === UnitSystem.ORIGINAL) {
            setDisplayPlan(plan);
            setIsConverting(false);
            return;
        }

        const originalDayPlan = plan.weeklyPlan.find(d => d.day === day);
        if (!originalDayPlan) return;

        setIsConverting(true);
        
        try {
            const convertedMeals = await Promise.all(originalDayPlan.meals.map(meal => 
                convertIngredients(meal, newUnit)
            ));

            setDisplayPlan(prevPlan => {
                const newPlan = structuredClone(prevPlan);
                const dayIndex = newPlan.weeklyPlan.findIndex(d => d.day === day);
                if (dayIndex !== -1) {
                    newPlan.weeklyPlan[dayIndex] = { ...newPlan.weeklyPlan[dayIndex], meals: convertedMeals };
                }
                return newPlan;
            });

        } catch (error) {
            console.error(`Failed to convert meals for day ${day}`, error);
            // On error, revert to the original plan for that day to avoid showing broken data
            setDisplayPlan(prevPlan => {
                const newPlan = structuredClone(prevPlan);
                const dayIndex = newPlan.weeklyPlan.findIndex(d => d.day === day);
                if (dayIndex !== -1) {
                    newPlan.weeklyPlan[dayIndex] = plan.weeklyPlan[dayIndex];
                }
                return newPlan;
            });
        } finally {
            setIsConverting(false);
        }
    };
    
    const handleDayChange = (day: number) => {
        setActiveDay(day);
        if (unitSystem !== UnitSystem.ORIGINAL) {
            convertDayMeals(day, unitSystem);
        }
    };

    const selectedDayPlan = displayPlan.weeklyPlan.find(d => d.day === activeDay);
    const unitOptions = Object.values(UnitSystem);


    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">Your Weekly Meal Plan</h2>
                {onGenerateShoppingList && (
                     <Button onClick={onGenerateShoppingList} variant="secondary" size="sm">
                        <span className="material-symbols-outlined mr-2 !text-base">shopping_cart</span>
                        Shopping List
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Calories</p>
                        <p className="text-2xl font-bold text-brand">{plan.weeklyAverages.calories}</p>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Protein</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.weeklyAverages.protein}g</p>
                    </div>
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Carbs</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.weeklyAverages.carbs}g</p>
                    </div>
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Fat</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.weeklyAverages.fat}g</p>
                    </div>
                </div>

                <div className="pt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ingredient Units</label>
                    <div className="flex flex-wrap gap-2">
                        {unitOptions.map(unit => (
                            <Button
                                key={unit}
                                size="sm"
                                variant={unitSystem === unit ? 'primary' : 'secondary'}
                                onClick={() => convertDayMeals(activeDay, unit)}
                                disabled={isConverting}
                            >
                                {unit}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                        {plan.weeklyPlan.sort((a,b) => a.day - b.day).map(dayPlan => (
                            <button
                                key={dayPlan.day}
                                onClick={() => handleDayChange(dayPlan.day)}
                                disabled={isConverting}
                                className={`${
                                    activeDay === dayPlan.day
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {dayPlan.dayOfWeek}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {selectedDayPlan && (
                    <div className="mt-4 animate-fade-in space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg text-center">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Calories</p>
                                <p className="text-xl font-bold text-brand">{selectedDayPlan.dailyTotals.calories}</p>
                            </div>
                            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg text-center">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Protein</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{selectedDayPlan.dailyTotals.protein}g</p>
                            </div>
                            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg text-center">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Carbs</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{selectedDayPlan.dailyTotals.carbs}g</p>
                            </div>
                            <div className="p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg text-center">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fat</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{selectedDayPlan.dailyTotals.fat}g</p>
                            </div>
                        </div>

                        {isConverting ? (
                            <div className="flex items-center justify-center py-16">
                                <Spinner className="text-brand" />
                                <p className="ml-2 text-sm text-slate-500">Converting units...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDayPlan.meals.map((meal, index) => (
                                   <MealCard 
                                        key={`${meal.recipeName}-${index}`} 
                                        meal={meal} 
                                        onSave={onSaveRecipe ? () => onSaveRecipe(meal) : undefined} 
                                        isSaved={isRecipeSaved ? isRecipeSaved(meal.recipeName) : false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}


                <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Chef's Notes for the Week</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{plan.chefNotes}</p>
                </div>
            </div>
        </Card>
    );
};