import React, { useRef, useEffect } from 'react';
import type { PlanWeek } from '../types';

interface WeekCardProps {
  week: PlanWeek;
  isCurrent: boolean;
  startDate: Date;
}

const WeekCard: React.FC<WeekCardProps> = ({ week, isCurrent, startDate }) => {
    const day = startDate.getDate();
    const isFatLoss = week.phase === 'Fat Loss';
    const phaseColor = isFatLoss ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const cardStyles = isCurrent 
        ? 'bg-brand/10 dark:bg-brand/20 border-2 border-brand' 
        : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-300 dark:hover:border-slate-600';

    return (
        <div className={`rounded-lg p-2 text-center flex flex-col items-center transition-all duration-300 aspect-square justify-between ${cardStyles}`}>
            <div className="w-full flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold">W{week.weekNumber}</span>
                <span>{day}</span>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center py-1">
                 <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${phaseColor}`}>
                    {week.phase.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
                 </p>
            </div>
            <div className="pt-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{week.projectedWeightKg.toFixed(1)}kg</p>
            </div>
        </div>
    );
};

interface PlanCalendarProps {
  plan: PlanWeek[];
  currentWeek: number;
}

export const PlanCalendar: React.FC<PlanCalendarProps> = ({ plan, currentWeek }) => {
    const currentWeekRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (currentWeekRef.current) {
            const timer = setTimeout(() => {
                currentWeekRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentWeek]);

    const today = new Date();
    const weeksByMonth = plan.reduce((acc, week) => {
        const weekStartDate = new Date(today.getTime());
        // Calculate the date for the start of the plan's week
        // currentWeek is the number of weeks completed, so the current week is history.length. week.weekNumber is 1-based.
        const weekOffset = week.weekNumber - 1 - currentWeek;
        weekStartDate.setDate(today.getDate() + weekOffset * 7);
        
        const monthYear = weekStartDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push({ ...week, startDate: weekStartDate });
        return acc;
    }, {} as Record<string, (PlanWeek & {startDate: Date})[]>);

    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
            {Object.entries(weeksByMonth).map(([monthYear, weeks]) => (
                <div key={monthYear}>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{monthYear}</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {weeks.map((week) => {
                            const isCurrent = week.weekNumber === currentWeek + 1;
                            return (
                                <div key={week.weekNumber} ref={isCurrent ? currentWeekRef : null}>
                                    <WeekCard week={week} isCurrent={isCurrent} startDate={week.startDate}/>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
