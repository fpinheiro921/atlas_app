import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface TrialExpiredProps {
    onLogout: () => void;
}

export const TrialExpired: React.FC<TrialExpiredProps> = ({ onLogout }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                    <span className="material-symbols-outlined text-brand text-3xl">workspace_premium</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
                    Your Free Trial Has Ended
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Thank you for trying Atlas! To continue your transformation and access all features, please subscribe.
                </p>
                <div className="mt-6 space-y-3">
                    <Button className="w-full">Subscribe to Atlas Pro (Coming Soon)</Button>
                    <Button onClick={onLogout} variant="secondary" className="w-full">Logout</Button>
                </div>
            </Card>
        </div>
    );
};
