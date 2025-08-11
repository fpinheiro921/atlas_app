import React, { useState } from 'react';
import type { OnboardingData, CheckInData, CheckInRecord, PlanWeek, TrainingPlan, WorkoutLog, WorkoutDay, DailyMealLog, MealPlan, AppView, DailyCoachingTip, DailyMacros, UsageData } from '../types';
import { DietPhase } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { HistoryItem } from './HistoryItem';
import { Spinner } from './Spinner';
import { PlanGenerationLoader } from './PlanGenerationLoader';
import { PlanCalendar } from './PlanCalendar';
import { WorkoutPlan } from './WorkoutPlan';
import { MealPlanDisplay } from './MealPlanDisplay';
import { DailyMealLogDisplay } from './DailyMealLogDisplay';
import { DailyCoachingTip as DailyCoachingTipComponent } from './DailyCoachingTip';
import { UsageCard } from './UsageCard';

interface DashboardProps {
  onboardingData: OnboardingData | null;
  checkInData: CheckInData | null;
  history: CheckInRecord[];
  onStartCheckIn: () => void;
  onStartDietBreak: () => void;
  planOverview: PlanWeek[] | null;
  trainingPlan: TrainingPlan | null;
  onSwitchGoal: () => void;
  mealPlan: MealPlan | null;
  workoutLogs: WorkoutLog[];
  loggedMeals: DailyMealLog[];
  dailyTip: DailyCoachingTip | null;
  isTipLoading: boolean;
  onGetNewTip: () => void;
  onStartWorkout: (workoutDay: WorkoutDay) => void;
  onViewExercise: (exerciseName: string) => void;
  isPlanLoading: boolean;
  isPlanUpdating: boolean;
  onStartOnboarding: () => void;
  onStartMealLogger: () => void;
  onNavigate: (view: AppView) => void;
  onGenerateShoppingList: () => void;
  isRecipeSaved: (recipeName: string) => boolean;
  trialDaysRemaining: number | null;
  isAdmin: boolean;
  usageData: UsageData | null;
}

const TrialBanner: React.FC<{days: number; onDismiss: () => void}> = ({days, onDismiss}) => (
    <div className="relative bg-yellow-100 dark:bg-yellow-800/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg mb-6 shadow-md" role="alert">
        <p><span className="font-bold">{days} {days === 1 ? 'day' : 'days'} left</span> in your free trial. Enjoy full access!</p>
        <button onClick={onDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-700/50" aria-label="Dismiss trial banner">
            <span className="material-symbols-outlined !text-base">close</span>
        </button>
    </div>
);

const DailyMacroTracker: React.FC<{ checkInData: CheckInData; onboardingData: OnboardingData; }> = ({ checkInData, onboardingData }) => {
    const { cheatDaysPerWeek } = onboardingData;
    const { offPlanMacros, targetCalories, targetProtein, targetCarbs, targetFat, targetFiber } = checkInData;

    const onPlanMacros: DailyMacros = {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        fiber: targetFiber,
    };

    const daysOfWeek = [
        { name: 'Mon', dayIndex: 1 },
        { name: 'Tue', dayIndex: 2 },
        { name: 'Wed', dayIndex: 3 },
        { name: 'Thu', dayIndex: 4 },
        { name: 'Fri', dayIndex: 5 },
        { name: 'Sat', dayIndex: 6 },
        { name: 'Sun', dayIndex: 0 },
    ];

    const getDayConfig = (dayIndex: number): { macros: DailyMacros, type: 'On-Plan' | 'Off-Plan' } => {
        if (!offPlanMacros || cheatDaysPerWeek === 0 || !onboardingData.cheatDays) {
            return { macros: onPlanMacros, type: 'On-Plan' };
        }

        const isOffPlan = onboardingData.cheatDays.includes(dayIndex);

        return isOffPlan ? { macros: offPlanMacros, type: 'Off-Plan' } : { macros: onPlanMacros, type: 'On-Plan' };
    };

    return (
        <div className="space-y-3">
            {daysOfWeek.map(({ name, dayIndex }) => {
                const { macros, type } = getDayConfig(dayIndex);
                const isOffPlan = type === 'Off-Plan';
                return (
                    <div key={name} className={`p-3 rounded-lg flex items-center justify-between gap-4 ${isOffPlan ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100/50 dark:bg-slate-800/50'}`}>
                        <div className="w-16 text-center">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{name}</p>
                            <p className={`text-xs font-semibold ${isOffPlan ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>{type}</p>
                        </div>
                        <div className="flex-grow grid grid-cols-4 text-center text-sm">
                            <div>
                                <p className="font-bold text-brand">{Math.round(macros.calories)}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">kcal</p>
                            </div>
                             <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(macros.protein)}g</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Protein</p>
                            </div>
                             <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(macros.carbs)}g</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Carbs</p>
                            </div>
                             <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(macros.fat)}g</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Fat</p>
                            </div>
                        </div>
                    </div>
                );
            })}
             <div className="text-center pt-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Cardio: {checkInData.targetCardioMinutes} min/week</p>
             </div>
        </div>
    );
};


const ProgressMacroBar: React.FC<{
    label: string;
    logged: number;
    target: number;
    color: string;
    unit: string;
}> = ({ label, logged, target, color, unit }) => {
    const percentage = target > 0 ? Math.min((logged / target) * 100, 100) : 0;
    const isOver = logged > target;
    const displayColor = isOver ? 'bg-red-500' : color;

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {Math.round(logged)} / {Math.round(target)} {unit}
                </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                    className={`${displayColor} h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
    onboardingData, 
    checkInData, 
    history, 
    onStartCheckIn, 
    onStartDietBreak, 
    planOverview, 
    trainingPlan,
    onSwitchGoal,
    mealPlan,
    workoutLogs,
    loggedMeals,
    dailyTip,
    isTipLoading,
    onGetNewTip,
    onStartWorkout, 
    onViewExercise,
    isPlanLoading, 
    isPlanUpdating,
    onStartOnboarding,
    onStartMealLogger,
    onNavigate,
    onGenerateShoppingList,
    isRecipeSaved,
    trialDaysRemaining,
    isAdmin,
    usageData,
}) => {
  const [isTrialBannerVisible, setIsTrialBannerVisible] = useState(true);

  if (!onboardingData) {
    return (
      <Card>
        <div className="text-center p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Welcome to Atlas</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You haven't set up your profile yet. Let's get started!
          </p>
          <Button onClick={onStartOnboarding}>Start Onboarding</Button>
        </div>
      </Card>
    );
  }

  if (isPlanLoading || !checkInData) {
    return (
        <Card>
            <PlanGenerationLoader />
        </Card>
    );
  }
  
  const { dietPhase, dietPace, isDietBreak, targetCalories } = checkInData;
  
  const today = new Date().toISOString().split('T')[0];
  const todayLog = loggedMeals.find(log => log.date === today);
  const loggedTotals = todayLog
      ? todayLog.meals.reduce((acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
      : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (isDietBreak) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Card className="text-center border-2 border-green-500/50">
            <h2 className="font-display text-2xl font-bold text-green-600 dark:text-green-400 uppercase">Diet Break Active!</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">You're at maintenance calories to support metabolic recovery. Stay consistent, and check in at the end of the week.</p>
            <DailyMacroTracker checkInData={checkInData} onboardingData={onboardingData} />
             <div className="mt-8">
                <Button onClick={onStartCheckIn} className="w-full sm:w-auto" size="lg">
                    End Break & Start Check-In
                </Button>
            </div>
        </Card>
         <Card>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase mb-4">Check-In History</h2>
            {history.length > 0 ? (
                <ul className="space-y-4">
                    {history.map((record, index) => (
                        <HistoryItem key={index} record={record} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">Your check-in history will appear here once you complete your first week.</p>
                </div>
            )}
        </Card>
      </div>
    );
  }


  return (
    <>
    {!isAdmin && trialDaysRemaining !== null && trialDaysRemaining <= 7 && isTrialBannerVisible && (
        <TrialBanner days={trialDaysRemaining} onDismiss={() => setIsTrialBannerVisible(false)} />
    )}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
             <Card>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">7-Day Nutrition Plan</h2>
                     <div className="flex items-center gap-2">
                        {trialDaysRemaining !== null && (
                            <div className="text-sm font-semibold bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                                {trialDaysRemaining} days left in trial
                            </div>
                        )}
                        {dietPhase === DietPhase.REVERSE_DIETING && dietPace && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">
                                {dietPace} Pace
                            </span>
                        )}
                        <Button variant="secondary" size="sm" onClick={onSwitchGoal}><span className="material-symbols-outlined !text-base mr-2">swap_horiz</span>Change Goal</Button>
                     </div>
                 </div>
                <DailyMacroTracker checkInData={checkInData} onboardingData={onboardingData} />

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                     <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Logged Today - Totals</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                         <ProgressMacroBar label="Calories" logged={loggedTotals.calories} target={targetCalories} color="bg-brand" unit="kcal" />
                         <ProgressMacroBar label="Protein" logged={loggedTotals.protein} target={checkInData.targetProtein} color="bg-sky-500" unit="g" />
                         <ProgressMacroBar label="Carbs" logged={loggedTotals.carbs} target={checkInData.targetCarbs} color="bg-orange-500" unit="g" />
                         <ProgressMacroBar label="Fat" logged={loggedTotals.fat} target={checkInData.targetFat} color="bg-amber-500" unit="g" />
                     </div>
                </div>
            </Card>

            {trainingPlan && (
                <Card>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase mb-4">Your Training Plan</h2>
                    <WorkoutPlan plan={trainingPlan} workoutLogs={workoutLogs} onStartWorkout={onStartWorkout} onViewExercise={onViewExercise} />
                </Card>
            )}

            {mealPlan ? (
                <MealPlanDisplay 
                    plan={mealPlan} 
                    onGenerateShoppingList={onGenerateShoppingList}
                    isRecipeSaved={isRecipeSaved}
                />
            ) : (
                <Card className="text-center p-6">
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase">Your Meal Plan</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">You don't have a meal plan for your current macros. Go to the Meal Planner to generate one.</p>
                    <Button onClick={() => onNavigate('mealPlan')}>Go to Meal Planner</Button>
                </Card>
            )}
        </div>
        
        {/* Side Column */}
        <div className="xl:col-span-1 space-y-6">
             <UsageCard usageData={usageData} />
             <DailyCoachingTipComponent tip={dailyTip} isLoading={isTipLoading} onGetNewTip={onGetNewTip} />
             <DailyMealLogDisplay todayLog={todayLog} onStartMealLogger={onStartMealLogger} />
            
            {planOverview && planOverview.length > 0 && (
              <Card>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase mb-4">Your Roadmap</h2>
                  {isPlanUpdating ? (
                      <div className="flex items-center justify-center p-8 space-x-2">
                          <Spinner size="h-6 w-6" className="text-brand" />
                          <p className="text-slate-600 dark:text-slate-400">Recalibrating your roadmap...</p>
                      </div>
                  ) : (
                    <PlanCalendar plan={planOverview} currentWeek={history.length} />
                  )}
              </Card>
            )}
        </div>

        {/* Full width bottom section */}
        <div className="xl:col-span-3 flex flex-col sm:flex-row sm:justify-center gap-4 py-4">
            {dietPhase === DietPhase.FAT_LOSS && !isDietBreak && (
                <Button onClick={onStartDietBreak} variant="secondary" className="w-full sm:w-auto">
                    Take a 1-Week Diet Break
                </Button>
            )}
            <Button onClick={onStartCheckIn} className="w-full sm:w-auto" size="lg">
                Start Weekly Check-In
            </Button>
        </div>

        <Card className="xl:col-span-3">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase mb-4">Check-In History</h2>
            {history.length > 0 ? (
                <ul className="space-y-4">
                    {history.map((record, index) => (
                        <HistoryItem key={index} record={record} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">Your check-in history will appear here once you complete your first week.</p>
                </div>
            )}
        </Card>
    </div>
    </>
  );
};
