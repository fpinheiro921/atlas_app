
import type { Exercise, ExerciseLog, WorkoutLog, ExercisePerformance, PerformanceAnalysis, SetLog } from '../types';

// A simple function to parse rep ranges like "8-12" or "10"
const parseRepRange = (repsStr: string): { minReps: number, maxReps: number } => {
    if (repsStr.toLowerCase() === 'to failure' || repsStr.toLowerCase().includes('s')) {
        return { minReps: 1, maxReps: 100 }; // Represents a wide range for failure/timed sets
    }
    if (repsStr.includes('-')) {
        const [min, max] = repsStr.split('-').map(Number);
        return { minReps: min, maxReps: max };
    }
    const reps = Number(repsStr);
    return { minReps: reps, maxReps: reps };
};

const getSmallestWeightIncrement = (lastWeight: number): number => {
    if (lastWeight > 20) return 2.5; // Assume barbell
    if (lastWeight > 0) return 2.0; // Assume dumbbell pair (1kg each)
    return 1; // Default for bodyweight added or small increments
};

export const findLastPerformance = (exerciseName: string, workoutLogs: WorkoutLog[]): ExerciseLog | null => {
    // workoutLogs are sorted newest first from the app state.
    for (const log of workoutLogs) {
        const exerciseLog = log.exercises.find(ex => ex.exerciseName === exerciseName);
        if (exerciseLog) {
            return exerciseLog;
        }
    }
    return null;
};

export const calculateProgressionTarget = (
    exercise: Exercise,
    lastExerciseLog: ExerciseLog | null
): { targetWeight: number; targetReps: number; lastPerformanceString: string } => {
    const { reps: repsStr, isBodyweight } = exercise;

    // Default target if no history
    if (!lastExerciseLog || lastExerciseLog.sets.length === 0) {
        const { minReps } = parseRepRange(repsStr);
        return { 
            targetWeight: 0, 
            targetReps: minReps > 0 ? minReps : 8, // Default to 8 reps if failure
            lastPerformanceString: 'No previous data' 
        };
    }
    
    // Find the best set from the last workout. Using first set is a good heuristic for main work sets.
    const bestSet = lastExerciseLog.sets[0]; 
    if (!bestSet) {
        const { minReps } = parseRepRange(repsStr);
        return { 
            targetWeight: 0, 
            targetReps: minReps, 
            lastPerformanceString: 'No previous data' 
        };
    }

    const lastWeight = bestSet.weight;
    const lastReps = bestSet.reps;

    const lastPerformanceString = isBodyweight 
        ? `${lastReps} reps ${lastWeight > 0 ? `(+${lastWeight}kg)` : ''}`
        : `${lastReps} reps @ ${lastWeight}kg`;
        
    if (repsStr.toLowerCase() === 'to failure' || repsStr.toLowerCase().includes('s')) {
        return { 
            targetWeight: lastWeight, 
            targetReps: lastReps + 1, 
            lastPerformanceString 
        };
    }

    const { minReps, maxReps } = parseRepRange(repsStr);
    
    // Progression logic
    if (lastReps >= maxReps) {
        // Ready to increase weight
        const increment = getSmallestWeightIncrement(lastWeight);
        return {
            targetWeight: lastWeight + increment,
            targetReps: minReps,
            lastPerformanceString,
        };
    } else {
        // Add reps
        return {
            targetWeight: lastWeight,
            targetReps: lastReps + 1,
            lastPerformanceString,
        };
    }
};

// Centralized E1RM calculation (Epley formula for consistency with charts)
export const calculateE1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps > 12 || weight <= 0) return 0; // Formula is less accurate for high reps
    return weight / (1.0278 - 0.0278 * reps);
};

export const analyzeWorkoutPerformance = (
    completedLog: WorkoutLog, 
    allLogs: WorkoutLog[]
): PerformanceAnalysis => {
    const exerciseAnalyses: ExercisePerformance[] = [];
    let summary = { newPRs: 0, progressions: 0, maintenances: 0 };
    
    // Filter out the log we just completed for historical comparison
    const historicalLogs = allLogs.filter(log => log.logId !== completedLog.logId);

    for (const completedExercise of completedLog.exercises) {
        if (completedExercise.isBodyweight || completedExercise.sets.length === 0) continue;

        // 1. Find today's best set based on e1RM
        const todaySetsWithE1RM = completedExercise.sets
            .map(set => ({ ...set, e1rm: calculateE1RM(set.weight, set.reps) }))
            .filter(set => set.e1rm > 0);
        
        if (todaySetsWithE1RM.length === 0) continue;

        const todayBestSet = todaySetsWithE1RM.sort((a, b) => b.e1rm - a.e1rm)[0];

        // 2. Find the best historical set for this exercise
        let historicalBestE1RM = 0;
        let previousBestSet: SetLog | null = null;

        for (const log of historicalLogs) {
            const historicalEx = log.exercises.find(ex => ex.exerciseName === completedExercise.exerciseName);
            if (historicalEx) {
                for (const set of historicalEx.sets) {
                    const e1rm = calculateE1RM(set.weight, set.reps);
                    if (e1rm > historicalBestE1RM) {
                        historicalBestE1RM = e1rm;
                        previousBestSet = set;
                    }
                }
            }
        }
        
        // 3. Determine status
        let status: ExercisePerformance['status'];
        if (historicalBestE1RM === 0) {
            status = 'FIRST_TIME';
        } else if (todayBestSet.e1rm > historicalBestE1RM) {
            status = 'PR';
            summary.newPRs++;
        } else if (
            (todayBestSet.weight > (previousBestSet?.weight || 0) && todayBestSet.reps >= (previousBestSet?.reps || 0)) ||
            (todayBestSet.weight >= (previousBestSet?.weight || 0) && todayBestSet.reps > (previousBestSet?.reps || 0))
        ) {
            status = 'PROGRESSION';
            summary.progressions++;
        } else if (todayBestSet.e1rm >= historicalBestE1RM * 0.98) { // Allow a tiny margin for consistency
            status = 'MAINTAINED';
            summary.maintenances++;
        } else {
            status = 'REGRESSION';
        }

        exerciseAnalyses.push({
            exerciseName: completedExercise.exerciseName,
            status,
            todayBestSet,
            previousBestSet,
            e1rm: todayBestSet.e1rm,
            previousE1rm: historicalBestE1RM > 0 ? historicalBestE1RM : null,
        });
    }

    return { summary, exerciseAnalyses };
};