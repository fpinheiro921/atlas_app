import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        const themes = ['system', 'light', 'dark'] as const;
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const themeIcons = {
        system: <span className="material-symbols-outlined">devices</span>,
        light: <span className="material-symbols-outlined">light_mode</span>,
        dark: <span className="material-symbols-outlined">dark_mode</span>,
    };
    
    const themeLabels: Record<typeof theme, string> = {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
    };

    return (
        <button
            onClick={cycleTheme}
            className="flex items-center justify-center w-full h-full rounded-lg transition-colors duration-200 bg-slate-200/50 text-slate-800 hover:bg-slate-300/80 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700/80"
            aria-label={`Current theme: ${themeLabels[theme]}. Switch theme.`}
            title={`Current theme: ${themeLabels[theme]}`}
        >
            {themeIcons[theme]}
        </button>
    );
};