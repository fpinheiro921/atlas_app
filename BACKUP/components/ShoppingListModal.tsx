import React, { useState } from 'react';
import type { ShoppingList } from '../types';
import type { AppStatus } from '../types';
import { Card } from './Card';
import { Spinner } from './Spinner';
import { Button } from './Button';

interface ShoppingListModalProps {
    list: ShoppingList | null;
    status: AppStatus;
    onClose: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ list, status, onClose }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (!list) return;
        
        let text = "My Shopping List:\n\n";
        Object.entries(list).forEach(([category, items]) => {
            if (items.length > 0) {
                text += `--- ${category} ---\n`;
                items.forEach(item => {
                    text += `- ${item.quantity} ${item.item}${item.notes ? ` (${item.notes})` : ''}\n`;
                });
                text += "\n";
            }
        });

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Spinner size="h-10 w-10" className="text-brand"/>
                    <p className="text-slate-600 dark:text-slate-400">AI is building your shopping list...</p>
                </div>
            );
        }

        if (status === 'error' || !list) {
            return (
                 <div className="text-center p-4">
                    <h3 className="text-lg font-bold text-red-500">An Error Occurred</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Could not generate the shopping list. Please try again.</p>
                </div>
            );
        }

        return (
             <div className="space-y-4">
                {Object.entries(list).filter(([, items]) => items.length > 0).map(([category, items]) => (
                    <div key={category}>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">{category}</h3>
                        <ul className="space-y-2">
                            {items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <input type="checkbox" id={`${category}-${index}`} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
                                    <label htmlFor={`${category}-${index}`} className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="font-semibold">{item.item}</span> - {item.quantity}
                                        {item.notes && <span className="text-xs text-slate-500 italic"> ({item.notes})</span>}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
                    Shopping List
                  </h2>
                  <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                     <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                 <div className="overflow-y-auto pr-2 -mr-4 flex-grow">
                    {renderContent()}
                </div>
                {status === 'success' && list && (
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button onClick={copyToClipboard} variant="secondary" className="w-full">
                            <span className="material-symbols-outlined mr-2">{copied ? 'task_alt' : 'content_copy'}</span>
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
