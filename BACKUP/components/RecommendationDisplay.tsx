

import React from 'react';
import type { AIRecommendation } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { articles } from '../content/articles';
import { supplements } from '../content/supplements';

interface RecommendationDisplayProps {
  recommendation: AIRecommendation;
  onApply: () => void;
  onDiscard: () => void;
  onViewArticle: (articleId: string) => void;
  onViewSupplement: (supplementId: string) => void;
}

const AdjustmentChip: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  if (value === 0) return null;
  const sign = value > 0 ? '+' : '';
  const color = value > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {`${sign}${value}g ${label}`}
    </div>
  );
};

const ActionIcon: React.FC<{action: AIRecommendation['action']}> = ({ action }) => {
    const iconMap = {
        INCREASE: { icon: 'trending_up', color: 'text-green-500'},
        DECREASE: { icon: 'trending_down', color: 'text-red-500'},
        HOLD: { icon: 'pause', color: 'text-yellow-500'},
        SUGGEST_BREAK: { icon: 'coffee', color: 'text-sky-500' },
    };
    const { icon, color } = iconMap[action];

    return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700`}>
            <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
        </div>
    );
}

export const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, onApply, onDiscard, onViewArticle, onViewSupplement }) => {
  const { rationale, action, calorieAdjustment, proteinAdjustment, carbAdjustment, fatAdjustment, cardioAdjustmentMinutes, recommendedArticleId, recommendedSupplementId, updatedTrainingPlan } = recommendation;
  const recommendedArticle = articles.find(a => a.id === recommendedArticleId);
  const recommendedSupplement = supplements.find(s => s.id === recommendedSupplementId);
  const isBreakSuggestion = action === 'SUGGEST_BREAK';
  
  return (
    <Card className="animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
            <ActionIcon action={action} />
            <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Coach's Recommendation: {isBreakSuggestion ? 'TAKE A BREAK' : action}</h2>
                <p className="text-slate-600 dark:text-slate-400">Based on your weekly check-in.</p>
            </div>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{rationale}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Adjustments for Next Week:</h3>
                {isBreakSuggestion ? (
                    <p className="text-slate-600 dark:text-slate-400">Your plan will be adjusted to your estimated maintenance calories for one week to support metabolic recovery.</p>
                ) : action === 'HOLD' && calorieAdjustment === 0 && cardioAdjustmentMinutes === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400">No changes to your plan this week. Stay consistent.</p>
                ) : (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${calorieAdjustment >= 0 ? 'text-green-600' : 'text-red-600'} dark:${calorieAdjustment >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {calorieAdjustment >= 0 ? '+' : ''}{calorieAdjustment} kcal
                            </div>
                            <AdjustmentChip value={proteinAdjustment} label="Protein" />
                            <AdjustmentChip value={carbAdjustment} label="Carbs" />
                            <AdjustmentChip value={fatAdjustment} label="Fat" />
                        </div>
                         {cardioAdjustmentMinutes !== 0 && (
                             <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${cardioAdjustmentMinutes > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                {cardioAdjustmentMinutes > 0 ? '+' : ''}{cardioAdjustmentMinutes} min Cardio
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                {updatedTrainingPlan && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Training Plan Updated</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Your workouts for next week have been adjusted for progressive overload based on your performance.</p>
                    </div>
                )}
                {recommendedArticle && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Recommended Reading</h3>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">To help you understand the 'why' behind this week's adjustment:</p>
                         <button onClick={() => onViewArticle(recommendedArticle.id)} className="text-brand dark:text-brand-light font-semibold hover:underline text-left">
                            {recommendedArticle.title}
                         </button>
                    </div>
                )}
                 {recommendedSupplement && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Supplement Suggestion</h3>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Based on your feedback, this supplement may be beneficial:</p>
                         <button onClick={() => onViewSupplement(recommendedSupplement.id)} className="text-brand dark:text-brand-light font-semibold hover:underline text-left">
                            {recommendedSupplement.title}
                         </button>
                    </div>
                )}
            </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
            <Button onClick={onApply} className="w-full sm:w-auto">
                 {isBreakSuggestion ? 'Accept & Start Diet Break' : 'Apply & Start Next Week'}
            </Button>
            <Button onClick={onDiscard} variant="secondary" className="w-full sm:w-auto">
                Discard Changes
            </Button>
        </div>
      </div>
    </Card>
  );
};