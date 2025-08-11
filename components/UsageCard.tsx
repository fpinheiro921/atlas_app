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

    const mealPlansUsed = usageData.mealPlanGenerations?.count || 0;
    const mealPhotosUsed = usageData.mealPhotoLogs?.count || 0;

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4">AI Usage</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Meal Plan Generations</span>
                    <span>{mealPlansUsed} / 5</span>
                </div>
                <div className="flex justify-between">
                    <span>Meal Photo Logs</span>
                    <span>{mealPhotosUsed} / 50</span>
                </div>
            </div>
        </Card>
    );
};
