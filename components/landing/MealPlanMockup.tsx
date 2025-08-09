import React from 'react';

export const MealPlanMockup: React.FC = () => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Meal Plan</h2>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-20 bg-slate-700 rounded-md animate-pulse"></div>
        <div className="h-20 bg-slate-700 rounded-md animate-pulse"></div>
        <div className="h-20 bg-slate-700 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
};
