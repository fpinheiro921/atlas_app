import React from 'react';
import { Card } from './Card';
import type { ExerciseGuide } from '../services/exerciseLibraryService';

interface ExerciseGuideModalProps {
  guide: ExerciseGuide;
  onClose: () => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({ guide, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <Card className="w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
            {guide.name}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-4 space-y-4">
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">{guide.equipment}</span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light">{guide.bodyPart}</span>
            </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{guide.description}</p>
        </div>
      </Card>
    </div>
  );
};
