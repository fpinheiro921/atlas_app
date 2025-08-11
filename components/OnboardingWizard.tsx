

import React, { useState } from 'react';
import type { OnboardingData } from '../types';
import { Sex, DietHistory, OnboardingGoal, ReverseDietPace, LifestyleActivity, ExerciseActivity, TrainingExperience, TrainingFrequency, Equipment } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { BodyFatEstimator } from './BodyFatEstimator';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  error: string | null;
}

const initialFormData: OnboardingData = {
  age: 30,
  sex: Sex.FEMALE,
  height: 165,
  weight: 75,
  bodyFat: 30,
  dietHistory: DietHistory.FREQUENT,
  lifestyleActivity: LifestyleActivity.LIGHT,
  exerciseActivity: ExerciseActivity.MODERATE,
  currentCardioMinutes: 60,
  goal: OnboardingGoal.FAT_LOSS,
  pace: ReverseDietPace.CONSERVATIVE,
  targetBodyFat: 22,
  trainingExperience: TrainingExperience.INTERMEDIATE,
  trainingFrequency: TrainingFrequency.FOUR_DAYS,
  equipment: Equipment.FULL_GYM,
  physiqueGoal: '',
  cheatDaysPerWeek: 1,
  cheatDays: [6], // Default to Saturday
};

const ProgressBar: React.FC<{ step: number, totalSteps: number }> = ({ step, totalSteps }) => {
    const percentage = ((step + 1) / totalSteps) * 100;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-8">
            <div className="bg-brand h-2.5 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, error }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEstimatingBfp, setIsEstimatingBfp] = useState(false);
  
  const totalSteps = 6;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const numericFields = ['age', 'height', 'weight', 'bodyFat', 'lifestyleActivity', 'exerciseActivity', 'targetBodyFat', 'currentCardioMinutes', 'cheatDaysPerWeek'];
    const parsedValue = numericFields.includes(id) ? parseFloat(value) : value;
    
    // If cheatDaysPerWeek changes, reset the selected cheatDays
    if (id === 'cheatDaysPerWeek') {
        const newCheatDaysPerWeek = parseFloat(value);
        setFormData(prev => ({ 
            ...prev, 
            cheatDaysPerWeek: newCheatDaysPerWeek, 
            cheatDays: (prev.cheatDays || []).slice(0, newCheatDaysPerWeek) 
        }));
    } else {
        setFormData({ ...formData, [id]: parsedValue });
    }

    if(id === 'goal') setFormError(null);
  };

  const handleCheatDayChange = (dayIndex: number) => {
    setFormData(prev => {
        const currentCheatDays = prev.cheatDays || [];
        const isSelected = currentCheatDays.includes(dayIndex);
        let newCheatDays: number[];

        if (isSelected) {
            newCheatDays = currentCheatDays.filter(d => d !== dayIndex);
        } else {
            if (currentCheatDays.length < prev.cheatDaysPerWeek) {
                newCheatDays = [...currentCheatDays, dayIndex].sort();
            } else {
                newCheatDays = currentCheatDays;
            }
        }
        return { ...prev, cheatDays: newCheatDays };
    });
  };
  
  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.goal === OnboardingGoal.FAT_LOSS && formData.targetBodyFat && formData.targetBodyFat >= formData.bodyFat) {
        setFormError('Target body fat must be lower than current body fat.');
        return;
    }
     if (formData.cheatDaysPerWeek > 0 && formData.cheatDays?.length !== formData.cheatDaysPerWeek) {
        setFormError(`Please select ${formData.cheatDaysPerWeek} off-plan day(s).`);
        return;
    }
    setFormError(null);
    onComplete(formData);
  };

  return (
    <Card className="animate-fade-in">
        <ProgressBar step={step} totalSteps={totalSteps} />
        {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400/50 dark:border-red-600/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                <p className="font-bold mb-1">Plan Generation Failed</p>
                <p>{error}</p>
            </div>
        )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 1: Personal Details</h2>
            <p className="text-slate-600 dark:text-slate-400">This helps us establish a baseline for your metabolic rate.</p>
            <Input id="age" label="Age" type="number" value={formData.age} onChange={handleChange} required />
            <Select id="sex" label="Sex" value={formData.sex} onChange={handleChange}>
              <option value={Sex.FEMALE}>Female</option>
              <option value={Sex.MALE}>Male</option>
            </Select>
            <Input id="height" label="Height (cm)" type="number" value={formData.height} onChange={handleChange} required />
          </div>
        )}

        {step === 1 && !isEstimatingBfp && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 2: Body Composition</h2>
            <p className="text-slate-600 dark:text-slate-400">Your weight and body fat percentage are key to accurate macro targets.</p>
            <Input id="weight" label="Weight (kg)" type="number" step="0.1" value={formData.weight} onChange={handleChange} required />
            <Input id="bodyFat" label="Body Fat (%)" type="number" step="0.1" value={formData.bodyFat} onChange={handleChange} required />
            <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 my-4">OR</p>
                <Button variant="outline" onClick={() => setIsEstimatingBfp(true)}>Estimate with AI + Tape Measure</Button>
            </div>
          </div>
        )}

        {step === 1 && isEstimatingBfp && (
            <BodyFatEstimator 
                onComplete={(bfp) => {
                    setFormData({ ...formData, bodyFat: bfp });
                    setIsEstimatingBfp(false);
                }}
                onBack={() => setIsEstimatingBfp(false)}
            />
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 3: Activity Level</h2>
            <p className="text-slate-600 dark:text-slate-400">Describe your daily lifestyle and exercise habits.</p>
            <Select id="lifestyleActivity" label="Lifestyle Activity (Job & Daily Life)" value={formData.lifestyleActivity} onChange={handleChange}>
              <option value={LifestyleActivity.SEDENTARY}>Sedentary (desk job)</option>
              <option value={LifestyleActivity.LIGHT}>Light (some standing/walking)</option>
              <option value={LifestyleActivity.MODERATE}>Moderate (on your feet most of the day)</option>
              <option value={LifestyleActivity.HIGH}>High (very active day, rarely sit)</option>
              <option value={LifestyleActivity.EXTREME}>Extreme (heavy labor job)</option>
            </Select>
            <Select id="exerciseActivity" label="Exercise Activity" value={formData.exerciseActivity} onChange={handleChange}>
              <option value={ExerciseActivity.SEDENTARY}>None (you don't exercise)</option>
              <option value={ExerciseActivity.LIGHT}>Light (walking/aerobics a few days/week)</option>
              <option value={ExerciseActivity.MODERATE}>Moderate (multiple days of exercise/some resistance training)</option>
              <option value={ExerciseActivity.INTENSE}>Intense (TRAIN HARD at least 5 days/week)</option>
              <option value={ExerciseActivity.EXTREME}>Extreme (intense training 2+ hours/day, every day)</option>
            </Select>
             <Input id="currentCardioMinutes" label="Current Weekly Cardio (minutes)" type="number" step="10" value={formData.currentCardioMinutes} onChange={handleChange} required />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 4: Diet History</h2>
            <p className="text-slate-600 dark:text-slate-400">Your past dieting habits significantly impact your current metabolism. Please be honest.</p>
            <Select id="dietHistory" label="How much of the last year have you spent dieting?" value={formData.dietHistory} onChange={handleChange}>
              <option value={DietHistory.NONE}>Not at all</option>
              <option value={DietHistory.INFREQUENT}>A few months (&lt; 1/3 of the year)</option>
              <option value={DietHistory.FREQUENT}>About half the time (1/3 - 2/3 of the year)</option>
              <option value={DietHistory.CHRONIC}>Most of the time (&gt; 2/3 of the year)</option>
            </Select>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 5: Training Profile</h2>
            <p className="text-slate-600 dark:text-slate-400">Tell us about your resistance training to generate your workout plan.</p>
            <Select id="trainingExperience" label="Training Experience" value={formData.trainingExperience} onChange={handleChange}>
                {Object.values(TrainingExperience).map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
            <Select id="trainingFrequency" label="How many days per week can you train?" value={formData.trainingFrequency} onChange={handleChange}>
                {Object.values(TrainingFrequency).map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
            <Select id="equipment" label="What equipment do you have access to?" value={formData.equipment} onChange={handleChange}>
                {Object.values(Equipment).map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
          </div>
        )}

        {step === 5 && (
            <div className="space-y-6 animate-fade-in">
                 <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Step 6: Your Goal</h2>
                <p className="text-slate-600 dark:text-slate-400">What is your primary focus right now? The AI will select the best starting phase for you based on this goal and your profile.</p>
                <Select id="goal" label="Primary Goal" value={formData.goal} onChange={handleChange}>
                    <option value={OnboardingGoal.FAT_LOSS}>Lose Fat and Get Leaner</option>
                    <option value={OnboardingGoal.REVERSE_DIETING}>Increase Metabolism / Break a Plateau</option>
                    <option value={OnboardingGoal.LEAN_GAINING}>Build Muscle without Excess Fat</option>
                    <option value={OnboardingGoal.MAINTENANCE}>Maintain My Current Physique</option>
                </Select>

                {formData.goal === OnboardingGoal.FAT_LOSS && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Input id="targetBodyFat" label="Target Body Fat %" type="number" step="0.1" value={formData.targetBodyFat || ''} onChange={handleChange} placeholder="e.g., 20" required />
                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                        <Select id="cheatDaysPerWeek" label="How many 'off-plan' days per week?" value={formData.cheatDaysPerWeek} onChange={handleChange}>
                            <option value={0}>0 days (Maximum consistency)</option>
                            <option value={1}>1 day (Recommended for flexibility)</option>
                            <option value={2}>2 days (Flexible weekends)</option>
                        </Select>
                        {formData.cheatDaysPerWeek > 0 && (
                            <div className="space-y-2 pt-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select your off-plan day(s)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                                        const isSelected = formData.cheatDays?.includes(index);
                                        const isDisabled = !isSelected && (formData.cheatDays?.length ?? 0) >= formData.cheatDaysPerWeek;
                                        return (
                                            <button
                                                type="button"
                                                key={day}
                                                onClick={() => handleCheatDayChange(index)}
                                                disabled={isDisabled}
                                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                                    isSelected ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                } ${ isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-300 dark:hover:bg-slate-600' }`}
                                            >
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3">
                            Atlas will adjust your daily targets on other days to keep you on track with your weekly goal, assuming you eat at maintenance on your off-plan days.
                        </p>
                    </div>
                )}
                
                {formData.goal === OnboardingGoal.REVERSE_DIETING && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Your Reverse Diet Pace</label>
                         <Select id="pace" label="Pace" value={formData.pace} onChange={handleChange}>
                           <option value={ReverseDietPace.CONSERVATIVE}>Conservative: Minimize fat gain, slow calorie increase.</option>
                           <option value={ReverseDietPace.MODERATE}>Moderate: Balance fat gain with faster calorie increase.</option>
                           <option value={ReverseDietPace.AGGRESSIVE}>Aggressive: Faster calorie increase, higher fat gain risk.</option>
                         </Select>
                    </div>
                )}
                
                 <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Input id="physiqueGoal" label="Physique Goal (Optional)" type="text" value={formData.physiqueGoal || ''} onChange={handleChange} placeholder="e.g., Jason Statham, a leaner me" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Entering a name will allow the AI to research their training and nutrition to create an inspired plan for you.</p>
                </div>
            </div>
        )}

        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
                {step > 0 && (
                    <Button type="button" variant="secondary" onClick={handleBack}>
                        Back
                    </Button>
                )}
            </div>

            <div>
                {step < totalSteps - 1 ? (
                    <Button type="button" onClick={handleNext}>
                        Continue
                    </Button>
                ) : (
                    <Button type="submit">
                        Complete Onboarding & Generate Plan
                    </Button>
                )}
            </div>
        </div>
      </form>
    </Card>
  );
};
