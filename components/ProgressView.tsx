import React, { useState } from 'react';
import type { CheckInRecord, TrainingPlan, WorkoutLog, ProgressPhoto } from '../types';
import { Card } from './Card';
import { PrimaryTrendChart } from './PrimaryTrendChart';
import { SubjectiveTrendsChart } from './SubjectiveTrendsChart';
import { BodyMeasurementChart, E1RMChart, WeeklyVolumeChart, PersonalRecordsDisplay } from './ProgressCharts';
import { ProgressGallery } from './ProgressGallery';


interface ProgressViewProps {
    history: CheckInRecord[];
    workoutLogs: WorkoutLog[];
    trainingPlan: TrainingPlan | null;
    photos: ProgressPhoto[];
    onAddPhoto: (imageDataUrl: string) => void;
    onDeletePhoto: (id: string) => void;
}

const KeyMetricCard: React.FC<{ title: string; value: string; change?: string; changeColor?: string }> = ({ title, value, change, changeColor = 'text-green-500' }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        {change && <p className={`mt-1 text-sm ${changeColor}`}>{change}</p>}
    </div>
);

type ProgressTab = 'Overview' | 'Measurements' | 'Performance' | 'Photos';

export const ProgressView: React.FC<ProgressViewProps> = ({ history, workoutLogs, trainingPlan, photos, onAddPhoto, onDeletePhoto }) => {
    const [activeTab, setActiveTab] = useState<ProgressTab>('Overview');

    const calculateMetrics = () => {
        if (history.length === 0) {
            return {
                totalWeightChange: 0,
                avgWeeklyWeightChange: 0,
                totalWaistChange: 0,
                totalWeeks: 0
            };
        }
        
        const firstRecord = history[history.length - 1].checkInData;
        const latestRecord = history[0].checkInData;
        
        const totalWeightChange = latestRecord.currentWeight - firstRecord.currentWeight;
        
        const totalWeeks = history.length;
        const avgWeeklyWeightChange = totalWeeks > 0 ? totalWeightChange / totalWeeks : 0;
        
        const firstWaist = firstRecord.waist;
        const latestWaist = latestRecord.waist;
        const totalWaistChange = (firstWaist && latestWaist) ? latestWaist - firstWaist : 0;

        return {
            totalWeightChange,
            avgWeeklyWeightChange,
            totalWaistChange,
            totalWeeks
        };
    };

    const metrics = calculateMetrics();
    
    const weightChangeColor = metrics.totalWeightChange <= 0 ? 'text-green-500' : 'text-red-500';
    const waistChangeColor = metrics.totalWaistChange <= 0 ? 'text-green-500' : 'text-red-500';

    const renderTabs = () => (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {(['Overview', 'Measurements', 'Performance', 'Photos'] as ProgressTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            activeTab === tab
                                ? 'border-brand text-brand'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'Overview':
                 return (
                    <div className="space-y-6 animate-fade-in">
                        <PrimaryTrendChart history={history} />
                        <SubjectiveTrendsChart history={history} />
                    </div>
                 );
            case 'Measurements':
                 return (
                    <div className="space-y-6 animate-fade-in">
                        <BodyMeasurementChart history={history} />
                    </div>
                 );
            case 'Performance':
                 return (
                    <div className="space-y-6 animate-fade-in">
                        <E1RMChart workoutLogs={workoutLogs} trainingPlan={trainingPlan} />
                        <WeeklyVolumeChart history={history} workoutLogs={workoutLogs} />
                        <PersonalRecordsDisplay workoutLogs={workoutLogs} />
                    </div>
                 );
            case 'Photos':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <ProgressGallery 
                            photos={photos} 
                            onAddPhoto={onAddPhoto} 
                            onDeletePhoto={onDeletePhoto}
                        />
                    </div>
                );
        }
    }

    return (
         <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
                <KeyMetricCard 
                    title="Total Weight Change" 
                    value={`${metrics.totalWeightChange.toFixed(1)} kg`} 
                    change={`${metrics.avgWeeklyWeightChange.toFixed(2)} kg/wk avg`}
                    changeColor={weightChangeColor}
                />
                <KeyMetricCard
                        title="Total Waist Change"
                        value={`${metrics.totalWaistChange.toFixed(1)} cm`}
                        changeColor={waistChangeColor}
                />
                    <KeyMetricCard
                        title="Time Elapsed"
                        value={`${metrics.totalWeeks} Weeks`}
                />
                    <KeyMetricCard
                        title="Next Check-In"
                        value="In 3 days"
                        change="Sunday, Aug 25th"
                        changeColor="text-slate-500"
                />
            </div>
            <Card>
                {renderTabs()}
                <div className="mt-6">
                    {renderContent()}
                </div>
            </Card>
        </div>
    );
};
