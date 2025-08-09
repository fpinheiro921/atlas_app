import React, { useMemo, useState } from 'react';
import type { CheckInRecord } from '../types';
import { Card } from './Card';

const ChartTooltip: React.FC<{ x: number; y: number; content: React.ReactNode; visible: boolean }> = ({ x, y, content, visible }) => (
    <div
        className={`absolute bg-slate-800 dark:bg-slate-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-200 z-10 shadow-lg ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -105%)' }}
    >
        {content}
    </div>
);

type SubjectiveMetric = 'energy' | 'hunger' | 'sleep' | 'strength';

const METRIC_CONFIG: Record<SubjectiveMetric, { label: string; color: string; }> = {
    energy: { label: 'Energy', color: '#f59e0b' }, // amber-500
    hunger: { label: 'Hunger', color: '#ef4444' }, // red-500
    sleep: { label: 'Sleep', color: '#8b5cf6' }, // violet-500
    strength: { label: 'Strength', color: '#22c55e' }, // green-500
};

export const SubjectiveTrendsChart: React.FC<{ history: CheckInRecord[] }> = ({ history }) => {
    const [visibleMetrics, setVisibleMetrics] = useState<Record<SubjectiveMetric, boolean>>({
        energy: true,
        hunger: true,
        sleep: false,
        strength: false,
    });
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode; visible: boolean } | null>(null);

    const toggleMetric = (metric: SubjectiveMetric) => {
        setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
    };

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartData = useMemo(() => {
        return [...history].reverse().map((record, index) => ({
            week: index + 1,
            energy: record.checkInData.energy,
            hunger: record.checkInData.hunger,
            sleep: record.checkInData.sleep,
            strength: record.checkInData.strength,
        }));
    }, [history]);

    const { linePaths, pointsByWeek } = useMemo(() => {
        if (chartData.length < 2) return { linePaths: [], pointsByWeek: [] };

        const yScale = (value: number) => innerHeight - ((value - 1) / 9) * innerHeight; // Scale from 1 to 10
        const xScale = (index: number) => (index / (chartData.length - 1)) * innerWidth;

        const linePaths = (Object.keys(METRIC_CONFIG) as SubjectiveMetric[])
            .filter(key => visibleMetrics[key])
            .map(key => ({
                key,
                color: METRIC_CONFIG[key].color,
                path: chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d[key])}`).join(' ')
            }));

        const pointsByWeek = chartData.map((weekData, i) => ({
            x: xScale(i),
            week: weekData.week,
            points: (Object.keys(METRIC_CONFIG) as SubjectiveMetric[]).map(key => ({
                key,
                y: yScale(weekData[key]),
                value: weekData[key],
                color: METRIC_CONFIG[key].color,
            }))
        }));

        return { linePaths, pointsByWeek };
    }, [chartData, innerWidth, innerHeight, visibleMetrics]);
    
    if (chartData.length < 2) {
        return null;
    }

    const yAxisLabels = [1, 5, 10];

    return (
        <Card>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase mb-4">Subjective Feedback Trends</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {(Object.keys(METRIC_CONFIG) as SubjectiveMetric[]).map(key => (
                    <label key={key} className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={visibleMetrics[key]}
                            onChange={() => toggleMetric(key)}
                            className="h-4 w-4 rounded border-slate-300 accent-brand focus:ring-brand"
                            style={{ accentColor: METRIC_CONFIG[key].color }}
                        />
                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300" style={{ color: METRIC_CONFIG[key].color }}>
                            {METRIC_CONFIG[key].label}
                        </span>
                    </label>
                ))}
            </div>

            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {/* Y Axis Grid Lines & Labels */}
                        {yAxisLabels.map((label, i) => {
                            const y = innerHeight - ((label - 1) / 9) * innerHeight;
                            return (
                                <g key={i} className="text-xs text-slate-400 dark:text-slate-500">
                                    <line x1={0} x2={innerWidth} y1={y} y2={y} className="stroke-current text-slate-200 dark:text-slate-700/50" strokeDasharray="2,2" />
                                    <text x={-8} y={y} textAnchor="end" dy="0.32em" className="fill-current">{label}</text>
                                </g>
                            )
                        })}
                        
                        {/* Data Lines */}
                        {linePaths.map(({ key, path, color }) => (
                            <path key={key} d={path} fill="none" stroke={color} strokeWidth="2" />
                        ))}

                        {/* Interaction Layer */}
                        {pointsByWeek.map((week, i) => (
                            <rect
                                key={`interaction-${i}`}
                                x={week.x - (innerWidth / (chartData.length * 2))}
                                y={0}
                                width={innerWidth / chartData.length}
                                height={innerHeight}
                                fill="transparent"
                                onMouseEnter={(e) => {
                                    const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                    setTooltip({
                                        x: (week.x + margin.left) / width * svgRect.width,
                                        y: e.clientY - svgRect.top,
                                        content: (
                                            <div className="p-1 space-y-0.5">
                                                <div className="font-bold text-center mb-1">Week {week.week}</div>
                                                {week.points.filter(p => visibleMetrics[p.key as SubjectiveMetric]).map(p => (
                                                    <div key={p.key} style={{ color: p.color }}>{METRIC_CONFIG[p.key as SubjectiveMetric].label}: {p.value}</div>
                                                ))}
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
