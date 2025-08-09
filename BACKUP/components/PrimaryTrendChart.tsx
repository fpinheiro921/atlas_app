import React, { useMemo, useState } from 'react';
import type { CheckInRecord } from '../types';
import { Card } from './Card';

const ChartTooltip: React.FC<{ x: number; y: number; content: React.ReactNode; visible: boolean }> = ({ x, y, content, visible }) => (
  <div
    className={`absolute bg-slate-800 dark:bg-slate-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-200 z-10 shadow-lg ${visible ? 'opacity-100' : 'opacity-0'}`}
    style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -110%)' }}
  >
    {content}
  </div>
);

export const PrimaryTrendChart: React.FC<{ history: CheckInRecord[] }> = ({ history }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode; visible: boolean } | null>(null);
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 40, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartData = useMemo(() => {
        return [...history].reverse().map((record, index) => ({
            week: index + 1,
            weight: record.checkInData.currentWeight,
            calories: record.checkInData.targetCalories,
        }));
    }, [history]);
    
    const { weightYScale, calorieYScale, xScale, linePath, bars } = useMemo(() => {
        if (chartData.length < 2) return { weightYScale: () => 0, calorieYScale: () => 0, xScale: () => 0, linePath: '', bars: [] };

        const weights = chartData.map(d => d.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        
        const calories = chartData.map(d => d.calories);
        const minCalorie = Math.min(...calories) * 0.95; // give some space at bottom
        const maxCalorie = Math.max(...calories);

        const weightYScale = (value: number) => innerHeight - ((value - minWeight) / (maxWeight - minWeight)) * innerHeight;
        const calorieYScale = (value: number) => innerHeight - ((value - minCalorie) / (maxCalorie - minCalorie)) * innerHeight;
        const xScale = (index: number) => (index / (chartData.length - 1)) * innerWidth;

        const linePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${weightYScale(d.weight)}`).join(' ');

        const barWidth = innerWidth / (chartData.length * 2);
        const bars = chartData.map((d, i) => ({
            x: xScale(i) - barWidth / 2,
            y: calorieYScale(d.calories),
            height: innerHeight - calorieYScale(d.calories),
            width: barWidth,
            ...d
        }));

        return { weightYScale, calorieYScale, xScale, linePath, bars };
    }, [chartData, innerWidth, innerHeight]);

    if (chartData.length < 2) {
        return null;
    }

    const weightTicks = [Math.min(...chartData.map(d => d.weight)), Math.max(...chartData.map(d => d.weight))];
    const calorieTicks = [Math.min(...chartData.map(d => d.calories)), Math.max(...chartData.map(d => d.calories))];

    return (
        <Card>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase mb-4">Weight &amp; Calorie Trends</h2>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {/* Weight Y-Axis (Left) */}
                        <g className="text-xs text-brand/80">
                            {weightTicks.map((tick, i) => (
                                <text key={i} x={-8} y={weightYScale(tick)} textAnchor="end" dy="0.32em" fill="currentColor">{tick.toFixed(1)}kg</text>
                            ))}
                        </g>

                        {/* Calorie Y-Axis (Right) */}
                        <g className="text-xs text-orange-400/80">
                            {calorieTicks.map((tick, i) => (
                                <text key={i} x={innerWidth + 8} y={calorieYScale(tick)} textAnchor="start" dy="0.32em" fill="currentColor">{tick}kcal</text>
                            ))}
                        </g>
                        
                        {/* Bars for Calories */}
                        <g>
                            {bars.map((bar, i) => (
                                <rect key={i} x={bar.x} y={bar.y} width={bar.width} height={bar.height} className="fill-current text-orange-400/30" />
                            ))}
                        </g>
                        
                        {/* Line for Weight */}
                        <path d={linePath} fill="none" className="stroke-current text-brand" strokeWidth="2" />
                        
                        {/* Interaction layer */}
                         {bars.map((bar, i) => (
                            <rect
                                key={`interaction-${i}`}
                                x={xScale(i) - innerWidth / (chartData.length * 2)}
                                y={0}
                                width={innerWidth / chartData.length}
                                height={innerHeight}
                                fill="transparent"
                                onMouseEnter={(e) => {
                                    const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                    setTooltip({
                                        x: (xScale(i) + margin.left) / width * svgRect.width,
                                        y: weightYScale(bar.weight) / height * svgRect.height + margin.top,
                                        content: (
                                            <div className="p-1">
                                                <div className="font-bold text-center mb-1">Week {bar.week}</div>
                                                <div className="text-brand">{bar.weight.toFixed(1)} kg</div>
                                                <div className="text-orange-400">{bar.calories} kcal</div>
                                            </div>
                                        ),
                                        visible: true,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(prev => prev && { ...prev, visible: false })}
                            />
                        ))}
                    </g>
                </svg>
                {tooltip && <ChartTooltip {...tooltip} />}
            </div>
        </Card>
    );
};
