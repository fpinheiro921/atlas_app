import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing your profile...",
  "Calculating your metabolic rate...",
  "Applying evidence-based principles...",
  "Consulting AI Coach...",
  "Structuring your diet phases...",
  "Building your personalized roadmap...",
  "Finalizing your plan..."
];

export const PlanGenerationLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Speed up animation
      });
    }, 150); 

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div 
          className="bg-brand h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm text-center min-h-[20px]">
        {messages[messageIndex]}
      </p>
    </div>
  );
};