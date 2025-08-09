import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface AuthProps {
    onGetStarted: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                 <h1 className="font-display text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                    ATLAS
                </h1>
            </div>
            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
                    Welcome to Atlas
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                     Your personal AI metabolic coach.
                </p>
                <div className="space-y-4">
                    <Button onClick={onGetStarted} className="w-full" size="lg">
                        Get Started
                    </Button>
                </div>
            </Card>
        </div>
    </div>
  );
};
