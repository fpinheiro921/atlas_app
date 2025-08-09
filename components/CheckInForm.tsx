

import React from 'react';
import type { CheckInData, OnboardingData } from '../types';
import { DietPhase, Sex, MenstrualCyclePhase } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Slider } from './Slider';

interface CheckInFormProps {
  data: CheckInData;
  onboardingData: OnboardingData | null;
  onFormChange: (data: CheckInData) => void;
  onSubmit: (data: CheckInData) => void;
  isLoading: boolean;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ data, onboardingData, onFormChange, onSubmit, isLoading }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    onFormChange({ ...data, [id]: value });
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onFormChange({ ...data, [id]: parseInt(value, 10) });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onFormChange({ ...data, physiquePhoto: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
      onFormChange({ ...data, physiquePhoto: undefined });
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericFormData = {
        ...data,
        previousWeight: parseFloat(String(data.previousWeight)),
        currentWeight: parseFloat(String(data.currentWeight)),
        currentBodyFat: data.currentBodyFat ? parseFloat(String(data.currentBodyFat)) : undefined,
        waist: data.waist && String(data.waist).trim() !== '' ? parseFloat(String(data.waist)) : undefined,
        hips: data.hips && String(data.hips).trim() !== '' ? parseFloat(String(data.hips)) : undefined,
        chest: data.chest && String(data.chest).trim() !== '' ? parseFloat(String(data.chest)) : undefined,
        thighs: data.thighs && String(data.thighs).trim() !== '' ? parseFloat(String(data.thighs)) : undefined,
        arms: data.arms && String(data.arms).trim() !== '' ? parseFloat(String(data.arms)) : undefined,
        actualCardioMinutes: data.actualCardioMinutes && String(data.actualCardioMinutes).trim() !== '' ? parseInt(String(data.actualCardioMinutes), 10) : undefined,
        averageDailySteps: data.averageDailySteps && String(data.averageDailySteps).trim() !== '' ? parseInt(String(data.averageDailySteps), 10) : undefined,
        targetCalories: parseInt(String(data.targetCalories)),
        targetProtein: parseInt(String(data.targetProtein)),
        targetCarbs: parseInt(String(data.targetCarbs)),
        targetFat: parseInt(String(data.targetFat)),
        targetFiber: parseInt(String(data.targetFiber)),
        targetCardioMinutes: parseInt(String(data.targetCardioMinutes)),
    };
    onSubmit(numericFormData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Weekly Check-In</h2>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Progress Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input id="previousWeight" label="Previous Week's Weight (kg)" type="number" step="0.1" value={data.previousWeight} onChange={handleChange} required disabled />
              <Input id="currentWeight" label="This Week's Avg Weight (kg)" type="number" step="0.1" value={data.currentWeight} onChange={handleChange} required />
              <Input id="currentBodyFat" label="Current Body Fat (%)" type="number" step="0.1" value={data.currentBodyFat || ''} onChange={handleChange} placeholder="Optional" />
              <Input id="waist" label="Waist (cm)" type="number" step="0.1" value={data.waist || ''} onChange={handleChange} placeholder="Optional, at navel" />
              <Input id="hips" label="Hips (cm)" type="number" step="0.1" value={data.hips || ''} onChange={handleChange} placeholder="Optional, at widest point" />
              <Input id="chest" label="Chest (cm)" type="number" step="0.1" value={data.chest || ''} onChange={handleChange} placeholder="Optional, at widest point" />
              <Input id="thighs" label="Thigh (cm, avg)" type="number" step="0.1" value={data.thighs || ''} onChange={handleChange} placeholder="Optional, mid-point" />
              <Input id="arms" label="Arm (cm, avg)" type="number" step="0.1" value={data.arms || ''} onChange={handleChange} placeholder="Optional, flexed" />
              <Input id="actualCardioMinutes" label="Actual Cardio Performed (min)" type="number" step="1" value={data.actualCardioMinutes || ''} onChange={handleChange} placeholder={`Target: ${data.targetCardioMinutes} min`} />
              <Input id="averageDailySteps" label="Avg Daily Steps (last 7 days)" type="number" step="100" value={data.averageDailySteps || ''} onChange={handleChange} placeholder="Optional, e.g. 8500" />
               {onboardingData?.sex === Sex.FEMALE && (
                    <Select id="menstrualCyclePhase" label="Current Menstrual Phase" value={data.menstrualCyclePhase} onChange={handleChange}>
                        <option value={MenstrualCyclePhase.NOT_APPLICABLE}>Select phase (optional)</option>
                        <option value={MenstrualCyclePhase.MENSTRUATING}>Currently Menstruating</option>
                        <option value={MenstrualCyclePhase.FOLLICULAR}>Follicular (Week 1-2)</option>
                        <option value={MenstrualCyclePhase.LUTEAL}>Luteal (Week 3-4)</option>
                    </Select>
                )}
            </div>
             <div className="pt-4 space-y-2">
                <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">Physique Photo (Optional)</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
                    Provide a photo for more accurate AI analysis. This photo is NOT saved.
                </p>
                {data.physiquePhoto ? (
                    <div className="relative w-40 sm:w-48">
                        <img src={data.physiquePhoto} alt="Physique photo preview" className="rounded-lg shadow-md" />
                        <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                            aria-label="Remove photo"
                        >
                            <span className="material-symbols-outlined !text-lg">close</span>
                        </button>
                    </div>
                ) : (
                    <div>
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <span className="material-symbols-outlined mr-2">add_a_photo</span>
                            Add Photo
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Current Macro Targets</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input id="targetCalories" label="Calories (kcal)" type="number" value={data.targetCalories} onChange={handleChange} required />
                <Input id="targetProtein" label="Protein (g)" type="number" value={data.targetProtein} onChange={handleChange} required />
                <Input id="targetCarbs" label="Carbs (g)" type="number" value={data.targetCarbs} onChange={handleChange} required />
                <Input id="targetFat" label="Fat (g)" type="number" value={data.targetFat} onChange={handleChange} required />
                <Input id="targetFiber" label="Fiber (g)" type="number" value={data.targetFiber} onChange={handleChange} required />
            </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Subjective Feedback (Rate 1-10)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Slider id="energy" label="Energy Level" value={data.energy} onChange={handleSliderChange} />
                <Slider id="hunger" label="Hunger Level" value={data.hunger} onChange={handleSliderChange} />
                <Slider id="mood" label="Mood" value={data.mood} onChange={handleSliderChange} />
                <Slider id="sleep" label="Sleep Quality" value={data.sleep} onChange={handleSliderChange} />
                <Slider id="strength" label="Strength/Performance" value={data.strength} onChange={handleSliderChange} />
                <Slider id="stress" label="Stress Level" value={data.stress} onChange={handleSliderChange} />
                <Slider id="motivation" label="Motivation" value={data.motivation} onChange={handleSliderChange} />
                <Slider id="adherence" label="Adherence to Plan" value={data.adherence} onChange={handleSliderChange} />
            </div>
        </div>

         <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notes for your Coach</h3>
            <textarea
                id="notes"
                rows={3}
                className="block w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm text-slate-900 dark:text-white"
                placeholder="Any challenges, social events, or other context? (e.g., 'Had a wedding on Saturday', 'Felt a tweak in my shoulder')"
                value={data.notes || ''}
                onChange={handleChange}
            />
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Get AI Recommendation
          </Button>
        </div>
      </form>
    </Card>
  );
};