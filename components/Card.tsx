import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-card shadow-2xl shadow-black/20 dark:shadow-black/40 border border-white/20 dark:border-slate-700/60 p-6 sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
