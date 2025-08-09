
import React, { useMemo } from 'react';
import type { WorkoutLog, ExercisePerformance, PerformanceAnalysis, SetLog } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { analyzeWorkoutPerformance } from '../services/trainingService';

interface WorkoutReviewModalProps {
    workoutLog: WorkoutLog;
    allLogs: WorkoutLog[];
    onClose: () => void;
}

const PerformanceCard: React.FC<{ analysis: ExercisePerformance }> = ({ analysis }) => {
    const { status, exerciseName, todayBestSet, previousBestSet, e1rm, previousE1rm } = analysis;

    const statusConfig = {
        PR: { icon: 'military_tech', text: 'New PR!', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        PROGRESSION: { icon: 'trending_up', text: 'Progression!', color: 'text-green-500', bg: 'bg-green-500/10' },
        MAINTAINED: { icon: 'check_circle', text: 'Maintained', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        REGRESSION: { icon: 'trending_down', text: 'Regression', color: 'text-red-500', bg: 'bg-red-500/10' },
        FIRST_TIME: { icon: 'new_releases', text: 'First Time!', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    };

    const config = statusConfig[status];

    const formatSet = (set: SetLog | null) => {
        if (!set) return 'N/A';
        return `${set.weight}kg x ${set.reps} reps`;
    };

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{exerciseName}</h4>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Today's Best</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatSet(todayBestSet)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">e1RM: {e1rm.toFixed(1)}kg</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Previous Best</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formatSet(previousBestSet)}</p>
                    {previousE1rm && <p className="text-xs text-slate-500 dark:text-slate-400">e1RM: {previousE1rm.toFixed(1)}kg</p>}
                </div>
            </div>
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                <span className="material-symbols-outlined !text-base">{config.icon}</span>
                {config.text}
            </div>
        </div>
    );
};

export const WorkoutReviewModal: React.FC<WorkoutReviewModalProps> = ({ workoutLog, allLogs, onClose }) => {
    const analysis = useMemo(() => analyzeWorkoutPerformance(workoutLog, allLogs), [workoutLog, allLogs]);

    if (analysis.exerciseAnalyses.length === 0) {
        // This can happen if only bodyweight exercises were logged. The review isn't very meaningful then.
        return (
             <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase text-center">Workout Complete!</h2>
                    <p className="text-center mt-4 text-slate-600 dark:text-slate-400">Great job on your bodyweight session! This performance review is for weighted exercises.</p>
                    <Button onClick={onClose} className="w-full mt-6">Back to Dashboard</Button>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="text-center mb-6">
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                         <span className="material-symbols-outlined text-brand text-3xl">task_alt</span>
                    </div>
                    <h2 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Workout Complete!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your performance breakdown.</p>
                </header>
                
                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                        <p className="text-3xl font-bold text-amber-500">{analysis.summary.newPRs}</p>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">New PRs</p>
                    </div>
                     <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-3xl font-bold text-green-500">{analysis.summary.progressions}</p>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Progressions</p>
                    </div>
                     <div className="p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-3xl font-bold text-blue-500">{analysis.summary.maintenances}</p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Maintained</p>
                    </div>
                </div>

                <div className="overflow-y-auto pr-2 -mr-4 space-y-4 flex-grow">
                    {analysis.exerciseAnalyses.map((exAnalysis) => (
                        <PerformanceCard key={exAnalysis.exerciseName} analysis={exAnalysis} />
                    ))}
                </div>

                <footer className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button onClick={onClose} className="w-full">Back to Dashboard</Button>
                </footer>
            </Card>
        </div>
    );
};