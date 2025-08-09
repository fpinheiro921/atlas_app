import React, { useState, useEffect, useMemo } from 'react';
import type { WorkoutDay, WorkoutLog, ExerciseLog, SetLog, Exercise, OnboardingData } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { findLastPerformance, calculateProgressionTarget } from '../services/trainingService';
import { getExerciseSwapSuggestion } from '../services/geminiService';
import { Spinner } from './Spinner';

interface WorkoutLoggerProps {
    workoutDay: WorkoutDay;
    workoutLogs: WorkoutLog[];
    onboardingData: OnboardingData;
    onSave: (log: WorkoutLog) => void;
    onClose: () => void;
}

const RestTimer: React.FC<{ duration: number; onFinish: () => void }> = ({ duration, onFinish }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onFinish();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onFinish]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-center p-2 bg-brand text-white rounded-md">
            <p className="font-mono text-lg">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</p>
        </div>
    );
};

// A new type for memoized targets
type ExerciseTargets = {
    [exerciseName: string]: {
        targetWeight: number;
        targetReps: number;
        lastPerformanceString: string;
    }
};


export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ workoutDay, workoutLogs, onboardingData, onSave, onClose }) => {
    const [exercises, setExercises] = useState<Exercise[]>(workoutDay.exercises);
    const [currentLog, setCurrentLog] = useState<ExerciseLog[]>([]);
    const [isResting, setIsResting] = useState(false);
    const [restDuration, setRestDuration] = useState(0);
    const [swappingExerciseIndex, setSwappingExerciseIndex] = useState<number | null>(null);
    
    // This useEffect will re-initialize the log when the exercises array changes (due to a swap)
    useEffect(() => {
        const newTargets = exercises.reduce((acc, exercise) => {
            const lastLog = findLastPerformance(exercise.name, workoutLogs);
            acc[exercise.name] = calculateProgressionTarget(exercise, lastLog);
            return acc;
        }, {} as ExerciseTargets);

        setCurrentLog(
            exercises.map(ex => {
                const target = newTargets[ex.name];
                return {
                    exerciseName: ex.name,
                    isBodyweight: ex.isBodyweight,
                    sets: Array.from({ length: ex.sets }, (_, i) => ({ 
                        set: i + 1, 
                        weight: target?.targetWeight || 0, 
                        reps: target?.targetReps || 0
                    }))
                };
            })
        );
    }, [exercises, workoutLogs]);

    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        const newLog = [...currentLog];
        newLog[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
        setCurrentLog(newLog);
    };

    const handleFinishSet = (exercise: Exercise) => {
        const restString = exercise.rest || "60s";
        const duration = parseInt(restString, 10);
        if (!isNaN(duration)) {
            setRestDuration(duration);
            setIsResting(true);
        }
    };

    const handleFinishWorkout = () => {
        const newLog: WorkoutLog = {
            logId: new Date().toISOString(),
            workoutDay: workoutDay.day,
            completedAt: new Date().toISOString(),
            exercises: currentLog,
        };
        onSave(newLog);
    };

    const handleSwapExercise = async (exerciseToSwap: Exercise, index: number) => {
        setSwappingExerciseIndex(index);
        try {
            const newExercise = await getExerciseSwapSuggestion(exerciseToSwap, workoutDay, onboardingData);
            setExercises(prevExercises => {
                const newExercises = [...prevExercises];
                newExercises[index] = newExercise;
                return newExercises;
            });
        } catch (error) {
            console.error("Failed to swap exercise:", error);
            alert("Sorry, the AI could not find a suitable swap at this time. Please try again.");
        } finally {
            setSwappingExerciseIndex(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-card shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{workoutDay.dayOfWeek}: {workoutDay.focus}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>
                <div className="overflow-y-auto p-4 space-y-6">
                    {exercises.map((exercise, exIndex) => {
                        const isBodyweight = exercise.isBodyweight;
                        const lastLog = findLastPerformance(exercise.name, workoutLogs);
                        const targetInfo = calculateProgressionTarget(exercise, lastLog);

                        return (
                            <div key={`${exercise.name}-${exIndex}`} className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-lg">
                                <div className="mb-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{exercise.name}</h3>
                                        <button
                                            onClick={() => handleSwapExercise(exercise, exIndex)}
                                            disabled={swappingExerciseIndex !== null}
                                            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Swap for a similar exercise"
                                        >
                                            {swappingExerciseIndex === exIndex 
                                                ? <Spinner size="h-5 w-5" className="text-brand" /> 
                                                : <span className="material-symbols-outlined">swap_horiz</span>
                                            }
                                        </button>
                                    </div>
                                     <div className="flex justify-between items-baseline text-xs">
                                        <p className="text-slate-500 dark:text-slate-400">Last: <span className="font-semibold">{targetInfo.lastPerformanceString}</span></p>
                                        <p className="text-accent dark:text-accent-light">Target: <span className="font-semibold">
                                            {targetInfo.targetReps} reps {isBodyweight && targetInfo.targetWeight > 0 ? `(+${targetInfo.targetWeight}kg)` : !isBodyweight ? `@ ${targetInfo.targetWeight}kg` : ''}
                                        </span></p>
                                    </div>
                                </div>
                                <div className={`grid grid-cols-4 gap-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400 pb-1`}>
                                    <span>Set</span>
                                    <span>{isBodyweight ? 'Added Wt (kg)' : 'Weight (kg)'}</span>
                                    <span>Reps</span>
                                    <span>Done</span>
                                </div>
                                <div className="space-y-2">
                                    {currentLog[exIndex]?.sets.map((set, setIndex) => (
                                        <div key={setIndex} className={`grid grid-cols-4 gap-2 items-center`}>
                                            <div className="text-center font-medium text-slate-700 dark:text-slate-300">{set.set}</div>
                                            <Input id={`weight-${exIndex}-${setIndex}`} type="number" step={isBodyweight ? "1" : "0.5"} placeholder={isBodyweight ? '0' : ''} value={set.weight === 0 ? '' : String(set.weight)} onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)} className="text-center" />
                                            <Input id={`reps-${exIndex}-${setIndex}`} type="number" value={set.reps === 0 ? '' : String(set.reps)} onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)} className="text-center" />
                                            <button onClick={() => handleFinishSet(exercise)} className="h-9 w-9 mx-auto flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                                <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-300">check</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <footer className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                    {isResting && <RestTimer duration={restDuration} onFinish={() => setIsResting(false)} />}
                    <Button onClick={handleFinishWorkout} className="w-full mt-4">Finish Workout</Button>
                </footer>
            </div>
        </div>
    );
};
