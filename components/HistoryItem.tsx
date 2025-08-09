import React from 'react';
import type { CheckInRecord, AIRecommendation } from '../types';

const ActionIcon: React.FC<{ action: AIRecommendation['action'] }> = ({ action }) => {
    const iconMap = {
        INCREASE: { icon: 'trending_up', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
        DECREASE: { icon: 'trending_down', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
        HOLD: { icon: 'pause', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' },
        SUGGEST_BREAK: { icon: 'coffee', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-400' },
    };
    const { icon, color } = iconMap[action];

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
    );
}

const WeightChangeDisplay: React.FC<{ checkInData: CheckInRecord['checkInData'] }> = ({ checkInData }) => {
    const { currentWeight, previousWeight } = checkInData;
    const change = currentWeight - previousWeight;
    const sign = change > 0 ? '+' : '';
    const color = change > 0.1 ? 'text-red-500' : change < -0.1 ? 'text-green-500' : 'text-slate-500 dark:text-slate-400';

    return (
        <div className="text-right">
            <p className={`font-bold text-lg ${color}`}>{sign}{change.toFixed(2)} kg</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{previousWeight.toFixed(2)}kg → {currentWeight.toFixed(2)}kg</p>
        </div>
    );
}

export const HistoryItem: React.FC<{ record: CheckInRecord }> = ({ record }) => {
  const { date, checkInData, recommendation } = record;
  
  const actionText = recommendation.action === 'SUGGEST_BREAK' ? 'Diet Break' : recommendation.action;

  return (
    <li className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <ActionIcon action={recommendation.action} />
        <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
                {actionText}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </div>
      <WeightChangeDisplay checkInData={checkInData} />
    </li>
  );
};