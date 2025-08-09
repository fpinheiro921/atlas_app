import React from 'react';

const MealItem: React.FC<{ name: string; cal: string; p: string; opacityClass: string }> = ({ name, cal, p, opacityClass }) => (
    <div className={`bg-slate-900/50 p-3 rounded-lg ${opacityClass}`}>
        <h5 className="font-semibold text-white text-sm">{name}</h5>
        <p className="text-xs text-slate-400">🔥 {cal}kcal &nbsp; 💪 {p}g Protein</p>
    </div>
);

export const MealPlanMockup: React.FC = () => {
    return (
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-card shadow-xl shadow-black/40 border border-white/10 overflow-hidden w-full max-w-sm mx-auto">
            <div className="flex items-center gap-1.5 p-2 bg-slate-900/50">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            </div>
            <div className="p-4 space-y-2">
                <h4 className="font-bold text-white text-base">Tuesday's Meal Plan</h4>
                <MealItem name="Scrambled Eggs & Oatmeal" cal="570" p="33" opacityClass="opacity-100" />
                <MealItem name="Grilled Chicken Salad" cal="600" p="60" opacityClass="opacity-80" />
                <MealItem name="Beef Stir-fry with Rice" cal="760" p="48" opacityClass="opacity-60" />
            </div>
        </div>
    );
};
