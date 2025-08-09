import React from 'react';
import type { Article } from '../types';
import { Card } from './Card';

interface EducationModalProps {
  article?: Article;
  articles?: Article[];
  isLibrary?: boolean;
  onClose: () => void;
  onViewArticle?: (articleId: string) => void;
  readArticleIds?: Set<string>;
}

export const EducationModal: React.FC<EducationModalProps> = ({ article, articles = [], isLibrary = false, onClose, onViewArticle, readArticleIds }) => {
  
  const renderArticleContent = (content: string) => {
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
            {isLibrary ? 'Education Library' : article?.title}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-4">
          {isLibrary ? (
            <ul className="space-y-4">
              {articles.map(libArticle => (
                <li key={libArticle.id}>
                  <button onClick={() => onViewArticle?.(libArticle.id)} className="text-left p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 w-full transition-colors duration-200 relative">
                    {readArticleIds && !readArticleIds.has(libArticle.id) && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
                    )}
                    <p className="font-semibold text-brand dark:text-brand-light">{libArticle.category}</p>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{libArticle.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{libArticle.summary}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : article ? (
            <div className="space-y-4">
              {renderArticleContent(article.content)}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};