import React from 'react';
import type { DailyCoachingTip as DailyCoachingTipType } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface DailyCoachingTipProps {
    tip: DailyCoachingTipType | null;
    isLoading: boolean;
    onGetNewTip: () => void;
}

export const DailyCoachingTip: React.FC<DailyCoachingTipProps> = ({ tip, isLoading, onGetNewTip }) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-3">
                 <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">Daily Tip</h2>
                 <Button onClick={onGetNewTip} variant="secondary" size="sm" disabled={isLoading} className="!p-2">
                     <span className="material-symbols-outlined">refresh</span>
                 </Button>
            </div>
           
            {isLoading && !tip ? (
                <div className="flex items-center justify-center p-8 space-x-2">
                    <Spinner size="h-6 w-6" className="text-brand" />
                    <p className="text-slate-600 dark:text-slate-400">Getting your daily tip...</p>
                </div>
            ) : tip ? (
                 <div className="space-y-2 animate-fade-in">
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">"{tip.tip}"</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tip.rationale}</p>
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400">No tip available. Try refreshing.</p>
            )}
        </Card>
    );
};
