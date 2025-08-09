
import React from 'react';
import { Card } from './Card';
import type { GroundingSource } from '../types';

interface PlanSourcesProps {
    sources: GroundingSource[];
}

export const PlanSources: React.FC<PlanSourcesProps> = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <Card className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Plan Inspired by AI Research
            </h3>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index}>
                        <a 
                            href={source.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand dark:text-brand-light hover:underline"
                        >
                            {source.web.title || source.web.uri}
                        </a>
                    </li>
                ))}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Note: The AI uses these sources as inspiration but adapts the plan to your specific profile and the app's evidence-based principles.
            </p>
        </Card>
    );
};
