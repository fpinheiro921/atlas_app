import React from 'react';

export const CheckInMockup: React.FC = () => {
    return (
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-card shadow-xl shadow-black/40 border border-white/10 overflow-hidden w-full max-w-sm mx-auto">
            <div className="flex items-center gap-1.5 p-2 bg-slate-900/50">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700">
                        <span className="material-symbols-outlined text-2xl text-red-400">trending_down</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Recommendation: DECREASE</h4>
                        <p className="text-xs text-slate-400">Based on your weekly check-in.</p>
                    </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-300">
                    <p>Progress has slowed slightly, which is expected. A small calorie reduction should get things moving again...</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="px-2 py-1 rounded-full text-xs font-bold text-red-400">-150 kcal</div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">-25g Carbs</div>
                </div>
            </div>
        </div>
    );
};
