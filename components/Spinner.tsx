import React from 'react';

export const Spinner: React.FC<{ size?: string; className?: string; text?: string; fullScreen?: boolean }> = ({ size = 'h-5 w-5', className = 'text-white', text, fullScreen }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex flex-col items-center justify-center z-50">
        <svg className={`animate-spin h-10 w-10 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <p className="mt-4 text-lg text-white">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${size} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
};
