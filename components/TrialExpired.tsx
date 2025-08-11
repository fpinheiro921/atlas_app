import React from 'react';
import { Card } from './Card';

export const TrialExpired: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <Card className="text-center p-8 max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">lock</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white uppercase">Trial Expired</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your 7-day free trial has ended. Please upgrade to a paid plan to continue using Atlas.
        </p>
        <div className="mt-6">
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full px-6 py-3 text-base font-semibold text-white bg-brand rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light"
          >
            Upgrade Now
          </a>
        </div>
      </Card>
    </div>
  );
};
