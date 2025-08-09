import React from 'react';

const MacroTile: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-400">{unit}</p>
    </div>
);

export const DashboardMockup: React.FC = () => {
    return (
        <div className="group relative transition-transform duration-500 ease-in-out transform md:rotate-3 md:hover:rotate-0 md:scale-100 hover:scale-105">
            <div className="absolute -inset-2 bg-gradient-to-br from-brand to-accent rounded-card opacity-20 group-hover:opacity-40 blur-xl transition-all duration-500"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-card shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center gap-2 p-3 bg-slate-900/50">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Mock Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Your Daily Plan</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <MacroTile label="Calories" value="2350" unit="kcal" color="text-brand-light" />
                        <MacroTile label="Protein" value="185" unit="g" color="text-white" />
                        <MacroTile label="Carbs" value="220" unit="g" color="text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mt-6 mb-2">Progress Trend</h3>
                    <div className="w-full h-32 bg-slate-900/50 rounded-lg p-2">
                        {/* Fake SVG Chart */}
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            <path d="M0,50 C40,10 80,60 120,40 C160,20 200,80 240,60 C280,40 320,70 360,50" stroke="hsl(217.2 91.2% 59.8%)" strokeWidth="2" fill="none" />
                            <circle cx="360" cy="50" r="3" fill="hsl(217.2 91.2% 59.8%)" />
                        </svg>
                    </div>

                    <div className="mt-6">
                        <div className="w-full text-center px-6 py-3 text-base font-semibold rounded-lg transition-colors duration-200 bg-brand text-white">
                            Start Weekly Check-In
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
