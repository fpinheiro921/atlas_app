import React, { useRef, useEffect } from 'react';
import type { PlanWeek } from '../types';

const PhaseIcon: React.FC<{ phase: PlanWeek['phase'] }> = ({ phase }) => {
    const isFatLoss = phase === 'Fat Loss';
    const bgColor = isFatLoss ? 'bg-red-100 dark:bg-red-900/50' : 'bg-green-100 dark:bg-green-900/50';
    const iconColor = isFatLoss ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} mb-2`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 ${iconColor}`}>
                {isFatLoss ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.287 8.287 0 0 0 3-2.588 8.252 8.252 0 0 1 3.362-1.8Z" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21.75 18V9.75a2.25 2.25 0 0 0-2.25-2.25H15M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                )}
            </svg>
        </div>
    );
};

interface WeekCardProps {
  week: PlanWeek;
  isCurrent: boolean;
}

const WeekCard: React.FC<WeekCardProps> = ({ week, isCurrent }) => {
    const isFatLoss = week.phase === 'Fat Loss';
    const phaseColor = isFatLoss ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const cardStyles = isCurrent 
        ? 'bg-brand/10 dark:bg-brand/20 border-2 border-brand' 
        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50';

    return (
        <div className={`flex-shrink-0 w-36 rounded-lg p-3 text-center flex flex-col items-center transition-all duration-300 ${cardStyles}`}>
            <PhaseIcon phase={week.phase} />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Week {week.weekNumber}</p>
            <p className={`text-xs font-medium ${phaseColor}`}>{week.phase}</p>
            <div className="mt-auto pt-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{week.projectedWeightKg.toFixed(1)} kg</p>
                <p className="text-xs text-slate-500">Projected</p>
            </div>
        </div>
    );
};

interface PlanScheduleProps {
  plan: PlanWeek[];
  currentWeek: number;
}

export const PlanSchedule: React.FC<PlanScheduleProps> = ({ plan, currentWeek }) => {
    const weekRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // currentWeek is the number of check-ins completed, which is the index of the current/next week.
        if (weekRefs.current[currentWeek] && plan.length > 0) {
            const timer = setTimeout(() => {
                 weekRefs.current[currentWeek]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentWeek, plan]);

    return (
        <div className="flex overflow-x-auto space-x-3 pb-4 -mx-6 px-6">
            {plan.map((week, index) => (
                <div key={week.weekNumber} ref={el => { weekRefs.current[index] = el; }}>
                    <WeekCard week={week} isCurrent={index === currentWeek} />
                </div>
            ))}
        </div>
    );
};