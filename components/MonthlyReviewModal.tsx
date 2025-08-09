import React from 'react';
import type { MonthlyReviewReport } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface MonthlyReviewModalProps {
    report: MonthlyReviewReport;
    onClose: () => void;
}

const ReportSection: React.FC<{ title: string; items: string[]; icon: string; iconClass: string; }> = ({ title, items, icon, iconClass }) => (
    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-lg">
        <h3 className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            <span className={`material-symbols-outlined mr-2 ${iconClass}`}>{icon}</span>
            {title}
        </h3>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

export const MonthlyReviewModal: React.FC<MonthlyReviewModalProps> = ({ report, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className="text-center mb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                         <span className="material-symbols-outlined text-brand text-3xl">insights</span>
                    </div>
                    <h2 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
                        {report.title}
                    </h2>
                     <p className="text-slate-500 dark:text-slate-400 mt-1">Your strategic review is ready.</p>
                </div>
                <div className="overflow-y-auto pr-2 -mr-4 space-y-6">
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{report.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReportSection 
                            title="Key Successes" 
                            items={report.successes} 
                            icon="check_circle" 
                            iconClass="text-green-500" 
                        />
                        <ReportSection 
                            title="Emerging Challenges" 
                            items={report.challenges} 
                            icon="flag" 
                            iconClass="text-yellow-500" 
                        />
                    </div>
                    
                    <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 p-4 rounded-lg">
                        <h3 className="flex items-center text-lg font-semibold text-sky-800 dark:text-sky-200 mb-2">
                             <span className="material-symbols-outlined mr-2">target</span>
                             Strategic Focus for Next Month
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">{report.strategicFocus}</p>
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button onClick={onClose} className="w-full">
                        Continue to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};
