import React from 'react';
import type { DailyMealLog } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface DailyMealLogDisplayProps {
    todayLog: DailyMealLog | undefined;
    onStartMealLogger: () => void;
}

export const DailyMealLogDisplay: React.FC<DailyMealLogDisplayProps> = ({ todayLog, onStartMealLogger }) => {
    return (
        <Card>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase mb-4">Today's Logged Meals</h2>
            {todayLog && todayLog.meals.length > 0 ? (
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 -mr-2">
                    {todayLog.meals.map((meal, index) => (
                        <li key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{meal.mealName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{meal.rationale}"</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-brand">{meal.calories} kcal</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-6">
                    <p className="text-slate-500 dark:text-slate-400">No meals logged for today yet.</p>
                </div>
            )}
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                 <Button onClick={onStartMealLogger} variant="secondary" className="w-full">
                    <span className="material-symbols-outlined mr-2 text-xl">add_circle</span>
                    Log Meal
                </Button>
            </div>
        </Card>
    );
};