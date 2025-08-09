import React from 'react';
import type { Supplement } from '../types';
import { Card } from './Card';

interface SupplementModalProps {
  supplement?: Supplement;
  supplements?: Supplement[];
  isLibrary?: boolean;
  onClose: () => void;
  onViewSupplement?: (supplementId: string) => void;
}

export const SupplementModal: React.FC<SupplementModalProps> = ({ supplement, supplements = [], isLibrary = false, onClose, onViewSupplement }) => {
  
  const renderSupplementContent = (content: string) => {
    return <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
            {isLibrary ? 'Supplement Guide' : supplement?.title}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-4">
          {isLibrary ? (
            <ul className="space-y-4">
              {supplements.map(libSupplement => (
                <li key={libSupplement.id}>
                  <button onClick={() => onViewSupplement?.(libSupplement.id)} className="text-left p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 w-full transition-colors duration-200">
                    <p className="font-semibold text-brand dark:text-brand-light">{libSupplement.category}</p>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{libSupplement.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{libSupplement.summary}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : supplement ? (
            <div className="space-y-4">
              {renderSupplementContent(supplement.content)}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};