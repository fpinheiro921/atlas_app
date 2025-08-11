import React from 'react';
import { Card } from './Card';
import type { UsageData } from '../types';

interface UsageCardProps {
    usageData: UsageData | null;
}

export const UsageCard: React.FC<UsageCardProps> = ({ usageData }) => {
    if (!usageData) {
        return null;
    }

    const usageItems = [
        { label: 'Weekly Check-Ins', used: usageData.weeklyCheckIns?.count || 0, limit: 5 },
        { label: 'Daily Coaching Tips', used: usageData.dailyCoachingTips?.count || 0, limit: 31 },
        { label: 'Meal Plan Generations', used: usageData.mealPlanGenerations?.count || 0, limit: 5 },
        { label: 'Meal Photo Logs', used: usageData.mealPhotoLogs?.count || 0, limit: 50 },
        { label: 'Recipe Generations', used: usageData.recipeGenerations?.count || 0, limit: 15 },
        { label: 'Shopping List Generations', used: usageData.shoppingListGenerations?.count || 0, limit: 5 },
        { label: 'Monthly Reviews', used: usageData.monthlyReviews?.count || 0, limit: 2 },
        { label: 'Goal Transition Plans', used: usageData.goalTransitionPlans?.count || 0, limit: 2 },
    ];

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4">AI Usage</h3>
            <div className="space-y-2">
                {usageItems.map(item => (
                    <div key={item.label} className="flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.used} / {item.limit}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};
