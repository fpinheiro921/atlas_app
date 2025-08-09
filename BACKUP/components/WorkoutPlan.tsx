import React, { useState } from 'react';
import type { TrainingPlan, WorkoutDay, WorkoutLog } from '../types';
import { Button } from './Button';

const ExerciseRow: React.FC<{ exercise: WorkoutDay['exercises'][0], onViewExercise: (exerciseName: string) => void }> = ({ exercise, onViewExercise }) => (
    <button
        onClick={() => onViewExercise(exercise.name)}
        className="grid grid-cols-4 gap-2 text-sm py-2 px-4 w-full text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
        aria-label={`View guide for ${exercise.name}`}
    >
        <span className="font-medium col-span-2 sm:col-span-1">{exercise.name}</span>
        <span className="text-center">{exercise.sets}x{exercise.reps}</span>
        <span className="text-center">{exercise.rir} RIR</span>
        <span className="text-center">{exercise.rest}</span>
    </button>
);

interface DayAccordionProps {
    day: WorkoutDay;
    isOpen: boolean;
    onToggle: () => void;
    lastCompleted: string | null;
    onStartWorkout: (day: WorkoutDay) => void;
    onViewExercise: (exerciseName: string) => void;
}

const DayAccordion: React.FC<DayAccordionProps> = ({ day, isOpen, onToggle, lastCompleted, onStartWorkout, onViewExercise }) => {
    const isRestDay = day.focus === 'Rest';
    
    return (
        <div className="border-b border-slate-200 dark:border-slate-700/50">
            <div className={`p-4 ${!isRestDay ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}>
                <button 
                    type="button" 
                    className={`flex items-center justify-between w-full text-left text-slate-800 dark:text-slate-200 ${isRestDay ? 'cursor-default' : ''}`}
                    onClick={isRestDay ? undefined : onToggle}
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-brand w-16">{day.dayOfWeek}</span>
                        <div className="flex-grow">
                             <span className="text-base font-semibold">{day.focus}</span>
                             {lastCompleted && <p className="text-xs text-slate-500 dark:text-slate-400">Last done: {lastCompleted}</p>}
                        </div>
                    </div>
                     {!isRestDay && (
                        <span className={`material-symbols-outlined transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    )}
                </button>
            </div>
            {isOpen && !isRestDay && (
                <div className="bg-white/50 dark:bg-slate-900/50 animate-fade-in">
                    <div className="grid grid-cols-4 gap-2 text-xs font-bold py-2 px-4 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                        <span className="col-span-2 sm:col-span-1">Exercise</span>
                        <span className="text-center">Sets/Reps</span>
                        <span className="text-center">Intensity</span>
                        <span className="text-center">Rest</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {day.exercises.map((exercise, index) => (
                            <ExerciseRow key={index} exercise={exercise} onViewExercise={onViewExercise} />
                        ))}
                    </div>
                    <div className="p-4">
                        <Button onClick={() => onStartWorkout(day)} size="sm" className="w-full">Start Workout</Button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const WorkoutPlan: React.FC<{ plan: TrainingPlan; workoutLogs: WorkoutLog[], onStartWorkout: (day: WorkoutDay) => void, onViewExercise: (exerciseName: string) => void }> = ({ plan, workoutLogs, onStartWorkout, onViewExercise }) => {
    const today = new Date().toLocaleString('en-us', {  weekday: 'long' });
    const todayIndex = plan.schedule.findIndex(d => d.dayOfWeek === today && d.focus !== 'Rest');
    const [openDay, setOpenDay] = useState<number | null>(todayIndex !== -1 ? todayIndex : plan.schedule.findIndex(d => d.focus !== 'Rest'));
    
    const handleToggle = (dayIndex: number) => {
        setOpenDay(openDay === dayIndex ? null : dayIndex);
    };

    return (
        <div className="space-y-2">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Split</p>
                <p className="font-bold text-brand dark:text-brand-light">{plan.weeklySplit}</p>
            </div>
            <div className="border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden">
                {plan.schedule.sort((a,b) => a.day - b.day).map((day, index) => {
                    const lastCompletedLog = workoutLogs.find(log => log.workoutDay === day.day);
                    const lastCompleted = lastCompletedLog ? new Date(lastCompletedLog.completedAt).toLocaleDateString() : null;

                    return (
                        <DayAccordion 
                            key={index}
                            day={day}
                            isOpen={openDay === index}
                            onToggle={() => handleToggle(index)}
                            lastCompleted={lastCompleted}
                            onStartWorkout={onStartWorkout}
                            onViewExercise={onViewExercise}
                        />
                    );
                })}
            </div>
        </div>
    );
};
