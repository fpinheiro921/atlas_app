import React, { useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { AppView } from '../types';
import type { User } from 'firebase/auth';

interface HeaderProps {
    user: User | null;
    onSave: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenLibrary: () => void;
    onOpenSupplementLibrary: () => void;
    onNavigate: (view: AppView) => void;
    onReset: () => void;
    onSignOut: () => void;
}

const buttonClasses = "flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 bg-slate-200/50 text-slate-800 hover:bg-slate-300/80 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700/80";

export const Header: React.FC<HeaderProps> = ({ user, onSave, onLoad, onOpenLibrary, onOpenSupplementLibrary, onNavigate, onReset, onSignOut }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <aside className="fixed top-0 left-0 h-full w-20 bg-black/10 dark:bg-black/20 backdrop-blur-lg border-r border-white/10 dark:border-white/5 flex flex-col items-center py-6 gap-4 z-20">
            <div title="Atlas AI" className="font-display text-4xl font-black text-brand-light select-none">
                A
            </div>
            <div className="flex-grow flex flex-col items-center justify-start gap-4 mt-10">
                <button onClick={() => onNavigate('dashboard')} title="Dashboard" aria-label="Dashboard" className={buttonClasses}>
                    <span className="material-symbols-outlined">dashboard</span>
                </button>
                 <button onClick={() => onNavigate('progress')} title="Progress Review" aria-label="Progress Review" className={buttonClasses}>
                    <span className="material-symbols-outlined">trending_up</span>
                </button>
                 <button onClick={() => onNavigate('mealPlan')} title="Meal Planner" aria-label="Meal Planner" className={buttonClasses}>
                    <span className="material-symbols-outlined">restaurant_menu</span>
                </button>
                 <button onClick={() => onNavigate('recipes')} title="Recipe Book" aria-label="Recipe Book" className={buttonClasses}>
                    <span className="material-symbols-outlined">menu_book</span>
                </button>
                <div className="w-full px-4"><div className="h-px bg-slate-300/50 dark:bg-slate-700/50"></div></div>
                <button onClick={onSave} title="Export Data" aria-label="Export Data" className={buttonClasses}>
                    <span className="material-symbols-outlined">save</span>
                </button>
                <button onClick={handleLoadClick} title="Import Data" aria-label="Import Data" className={buttonClasses}>
                    <span className="material-symbols-outlined">upload</span>
                </button>
                <div className="w-full px-4"><div className="h-px bg-slate-300/50 dark:bg-slate-700/50"></div></div>
                <button onClick={onOpenLibrary} title="Education Library" aria-label="Open Education Library" className={buttonClasses}>
                    <span className="material-symbols-outlined">school</span>
                </button>
                 <button onClick={onOpenSupplementLibrary} title="Supplement Guide" aria-label="Open Supplement Guide" className={buttonClasses}>
                    <span className="material-symbols-outlined">pill</span>
                </button>
            </div>
            <div className="w-12 h-12">
                <ThemeToggle />
            </div>
             <button onClick={onReset} title="Reset & Start Over" aria-label="Reset all app data and start over" className={`${buttonClasses} mt-2`}>
                <span className="material-symbols-outlined">restart_alt</span>
            </button>
            {user && (
                <button onClick={onSignOut} title="Sign Out" aria-label="Sign Out" className={`${buttonClasses} mt-2`}>
                    <span className="material-symbols-outlined">logout</span>
                </button>
            )}
             <input
              type="file"
              ref={fileInputRef}
              onChange={onLoad}
              accept=".json,application/json"
              className="hidden"
              aria-hidden="true"
            />
        </aside>
    );
};
