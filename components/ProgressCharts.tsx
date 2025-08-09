
import React, { useMemo, useState } from 'react';
import type { CheckInRecord, WorkoutLog, TrainingPlan } from '../types';
import { Card } from './Card';
import { Select } from './Select';
import { calculateE1RM } from '../services/trainingService';

const ChartTooltip: React.FC<{ x: number; y: number; content: React.ReactNode; visible: boolean }> = ({ x, y, content, visible }) => (
    <div
        className={`absolute bg-slate-800 dark:bg-slate-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-200 z-10 shadow-lg ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -105%)' }}
    >
        {content}
    </div>
);

// BodyMeasurementChart Component
type MeasurementMetric = 'waist' | 'hips' | 'chest' | 'thighs' | 'arms';

const MEASUREMENT_CONFIG: Record<MeasurementMetric, { label: string; color: string; }> = {
    waist: { label: 'Waist (cm)', color: '#ef4444' }, // red-500
    hips: { label: 'Hips (cm)', color: '#f97316' }, // orange-500
    chest: { label: 'Chest (cm)', color: '#8b5cf6' }, // violet-500
    thighs: { label: 'Thigh (cm)', color: '#22c55e' }, // green-500
    arms: { label: 'Arm (cm)', color: '#3b82f6' }, // blue-500
};

export const BodyMeasurementChart: React.FC<{ history: CheckInRecord[] }> = ({ history }) => {
    const [visibleMetrics, setVisibleMetrics] = useState<Record<MeasurementMetric, boolean>>({
        waist: true, hips: true, chest: false, thighs: false, arms: false,
    });
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode; visible: boolean } | null>(null);

    const toggleMetric = (metric: MeasurementMetric) => {
        setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
    };

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { linePaths, pointsByWeek, yAxisLabels } = useMemo(() => {
        const chartData = [...history].reverse().map((record, index) => ({
            week: index + 1,
            waist: record.checkInData.waist,
            hips: record.checkInData.hips,
            chest: record.checkInData.chest,
            thighs: record.checkInData.thighs,
            arms: record.checkInData.arms,
        }));
        
        const allValues = chartData.flatMap(d => Object.values(d).filter(v => typeof v === 'number')) as number[];
        if (allValues.length < 2) return { linePaths: [], pointsByWeek: [], yAxisLabels: [] };

        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);

        const yScale = (value: number) => innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;
        const xScale = (index: number) => (index / (chartData.length - 1)) * innerWidth;

        const linePaths = (Object.keys(MEASUREMENT_CONFIG) as MeasurementMetric[])
            .filter(key => visibleMetrics[key])
            .map(key => {
                const dataPoints = chartData.map((d, i) => ({ x: xScale(i), y: d[key] ? yScale(d[key]!) : null })).filter(p => p.y !== null);
                return {
                    key,
                    color: MEASUREMENT_CONFIG[key].color,
                    path: dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
                };
            });

        const pointsByWeek = chartData.map((weekData, i) => ({
            x: xScale(i),
            week: weekData.week,
            points: (Object.keys(MEASUREMENT_CONFIG) as MeasurementMetric[]).map(key => ({
                key,
                y: weekData[key] ? yScale(weekData[key]!) : null,
                value: weekData[key],
                color: MEASUREMENT_CONFIG[key].color,
            }))
        }));

        const yAxisLabels = [minValue, minValue + (maxValue-minValue)/2, maxValue];

        return { linePaths, pointsByWeek, yAxisLabels };
    }, [history, innerWidth, innerHeight, visibleMetrics]);

    if (history.length < 2) {
        return <p className="text-center text-slate-500">Log at least two check-ins with measurements to see trends.</p>;
    }

    return (
        <Card>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Body Measurements</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {(Object.keys(MEASUREMENT_CONFIG) as MeasurementMetric[]).map(key => (
                    <label key={key} className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={visibleMetrics[key]} onChange={() => toggleMetric(key)} className="h-4 w-4 rounded border-slate-300 accent-brand" style={{ accentColor: MEASUREMENT_CONFIG[key].color }} />
                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300" style={{ color: MEASUREMENT_CONFIG[key].color }}>{MEASUREMENT_CONFIG[key].label}</span>
                    </label>
                ))}
            </div>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {yAxisLabels.map((label, i) => {
                            const y = innerHeight - ((label - yAxisLabels[0]) / (yAxisLabels[2] - yAxisLabels[0])) * innerHeight;
                            return (
                                <g key={i} className="text-xs text-slate-400 dark:text-slate-500">
                                    <line x1={0} x2={innerWidth} y1={y} y2={y} className="stroke-current text-slate-200 dark:text-slate-700/50" strokeDasharray="2,2" />
                                    <text x={-8} y={y} textAnchor="end" dy="0.32em" className="fill-current">{label.toFixed(1)}</text>
                                </g>
                            )
                        })}
                        {linePaths.map(({ key, path, color }) => ( <path key={key} d={path} fill="none" stroke={color} strokeWidth="2" /> ))}
                        {pointsByWeek.map((week, i) => (
                            <rect key={`interaction-${i}`} x={week.x - (innerWidth / (history.length * 2))} y={0} width={innerWidth / history.length} height={innerHeight} fill="transparent"
                                onMouseEnter={(e) => {
                                    const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                    setTooltip({
                                        x: (week.x + margin.left) / width * svgRect.width,
                                        y: e.clientY - svgRect.top,
                                        content: (
                                            <div className="p-1 space-y-0.5">
                                                <div className="font-bold text-center mb-1">Week {week.week}</div>
                                                {week.points.filter(p => visibleMetrics[p.key as MeasurementMetric] && p.value).map(p => (
                                                    <div key={p.key} style={{ color: p.color }}>{MEASUREMENT_CONFIG[p.key as MeasurementMetric].label}: {p.value}</div>
                                                ))}
                                            </div>
                                        ), visible: true,
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

// E1RMChart Component
export const E1RMChart: React.FC<{ workoutLogs: WorkoutLog[], trainingPlan: TrainingPlan | null }> = ({ workoutLogs, trainingPlan }) => {
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const exerciseOptions = useMemo(() => {
        const planExercises = trainingPlan?.schedule.flatMap(day => day.exercises.filter(ex => !ex.isBodyweight).map(ex => ex.name)) || [];
        const logExercises = workoutLogs.flatMap(log => log.exercises.filter(ex => !ex.isBodyweight).map(ex => ex.exerciseName));
        return [...new Set([...planExercises, ...logExercises])].sort();
    }, [workoutLogs, trainingPlan]);

    const [selectedExercise, setSelectedExercise] = useState<string>(exerciseOptions[0] || '');

    const { linePath, points, yAxisLabels } = useMemo(() => {
        if (!selectedExercise || workoutLogs.length < 1) return { linePath: '', points: [], yAxisLabels: [] };

        const e1rmData = workoutLogs.map(log => {
            const exerciseLog = log.exercises.find(ex => ex.exerciseName === selectedExercise);
            if (!exerciseLog) return null;
            const maxE1RM = Math.max(...exerciseLog.sets.map(set => calculateE1RM(set.weight, set.reps)));
            return { date: new Date(log.completedAt), e1rm: maxE1RM };
        }).filter(d => d && d.e1rm > 0).sort((a,b) => a!.date.getTime() - b!.date.getTime());

        if (e1rmData.length < 2) return { linePath: '', points: [], yAxisLabels: [] };

        const e1rms = e1rmData.map(d => d!.e1rm);
        const minE1RM = Math.min(...e1rms);
        const maxE1RM = Math.max(...e1rms);

        const yScale = (value: number) => innerHeight - ((value - minE1RM) / (maxE1RM - minE1RM)) * innerHeight;
        const xScale = (index: number) => (index / (e1rmData.length - 1)) * innerWidth;

        const linePath = e1rmData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d!.e1rm)}`).join(' ');
        const points = e1rmData.map((d, i) => ({ x: xScale(i), y: yScale(d!.e1rm), ...d }));
        const yAxisLabels = [minE1RM, minE1RM + (maxE1RM-minE1RM)/2, maxE1RM];

        return { linePath, points, yAxisLabels };
    }, [selectedExercise, workoutLogs, innerHeight, innerWidth]);

    if (workoutLogs.length < 1 || exerciseOptions.length === 0) {
        return <p className="text-center text-slate-500">Log some workouts to see your strength trends.</p>;
    }

    return (
        <Card>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Estimated 1-Rep Max (e1RM)</h3>
            <Select id="e1rm-exercise" label="Select Exercise" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
                {exerciseOptions.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </Select>

            {points.length < 2 ? (
                 <p className="text-center text-slate-500 pt-8">Not enough data for this exercise. Log at least two sessions to see a trend.</p>
            ): (
                 <div className="relative mt-4">
                    <svg viewBox={`0 0 500 250`} className="w-full h-auto">
                        <g transform={`translate(40, 20)`}>
                            {yAxisLabels.map((label, i) => {
                                const y = innerHeight - ((label - yAxisLabels[0]) / (yAxisLabels[2] - yAxisLabels[0])) * innerHeight;
                                return (
                                    <g key={i} className="text-xs text-slate-400 dark:text-slate-500">
                                        <line x1={0} x2={innerWidth} y1={y} y2={y} className="stroke-current text-slate-200 dark:text-slate-700/50" strokeDasharray="2,2" />
                                        <text x={-8} y={y} textAnchor="end" dy="0.32em" className="fill-current">{label.toFixed(0)}kg</text>
                                    </g>
                                );
                            })}
                            <path d={linePath} fill="none" className="stroke-current text-brand" strokeWidth="2" />
                            {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-current text-brand" />
                            ))}
                        </g>
                    </svg>
                </div>
            )}
        </Card>
    );
};


// WeeklyVolumeChart Component
export const WeeklyVolumeChart: React.FC<{ workoutLogs: WorkoutLog[], history: CheckInRecord[] }> = ({ workoutLogs, history }) => {
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const weeklyVolumes = useMemo(() => {
        if (history.length === 0) return [];
        const reversedHistory = [...history].reverse();
        
        return reversedHistory.map((record, index) => {
            const weekEndDate = new Date(record.date);
            const weekStartDate = new Date(weekEndDate);
            weekStartDate.setDate(weekStartDate.getDate() - 6);

            const weekLogs = workoutLogs.filter(log => {
                const logDate = new Date(log.completedAt);
                return logDate >= weekStartDate && logDate <= weekEndDate;
            });

            const volume = weekLogs.reduce((totalVol, log) => {
                return totalVol + log.exercises.reduce((exVol, ex) => {
                    if (ex.isBodyweight) return exVol;
                    return exVol + ex.sets.reduce((setVol, set) => setVol + (set.weight * set.reps), 0);
                }, 0);
            }, 0);

            return { week: index + 1, volume };
        }).filter(d => d.volume > 0);
    }, [workoutLogs, history]);

    if (weeklyVolumes.length < 1) {
        return (
            <Card>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Weekly Training Volume</h3>
                <p className="text-center text-slate-500 pt-8">Log weighted workouts to see your volume trends.</p>
            </Card>
        );
    }
    
    const maxVolume = Math.max(...weeklyVolumes.map(d => d.volume), 1);
    const yScale = (value: number) => innerHeight - (value / maxVolume) * innerHeight;
    const barBandwidth = innerWidth / weeklyVolumes.length;
    const barPadding = 0.2;
    const barWidth = barBandwidth * (1 - barPadding);

    const yAxisLabels = [0, maxVolume/2, maxVolume];

    return (
        <Card>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Weekly Training Volume (kg)</h3>
             <div className="relative mt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                         {yAxisLabels.map((label, i) => {
                            const y = innerHeight - ((label) / (maxVolume)) * innerHeight;
                            return (
                                <g key={i} className="text-xs text-slate-400 dark:text-slate-500">
                                    <line x1={0} x2={innerWidth} y1={y} y2={y} className="stroke-current text-slate-200 dark:text-slate-700/50" strokeDasharray="2,2" />
                                    <text x={-8} y={y} textAnchor="end" dy="0.32em" className="fill-current">{Math.round(label/1000)}k</text>
                                </g>
                            );
                        })}
                        {weeklyVolumes.map((d, i) => (
                            <rect
                                key={i}
                                x={i * barBandwidth + (barBandwidth * barPadding / 2)}
                                y={yScale(d.volume)}
                                width={barWidth}
                                height={innerHeight - yScale(d.volume)}
                                className="fill-current text-accent"
                            />
                        ))}
                    </g>
                </svg>
            </div>
        </Card>
    );
};

// PersonalRecordsDisplay Component
export const PersonalRecordsDisplay: React.FC<{ workoutLogs: WorkoutLog[] }> = ({ workoutLogs }) => {
    const personalRecords = useMemo(() => {
        const records: { [key: string]: { e1rm: number; weight: number; reps: number; date: string } } = {};

        workoutLogs.forEach(log => {
            log.exercises.forEach(ex => {
                if (ex.isBodyweight) return;
                ex.sets.forEach(set => {
                    const e1rm = calculateE1RM(set.weight, set.reps);
                    if (e1rm > (records[ex.exerciseName]?.e1rm || 0)) {
                        records[ex.exerciseName] = { e1rm, weight: set.weight, reps: set.reps, date: new Date(log.completedAt).toLocaleDateString() };
                    }
                });
            });
        });

        return Object.entries(records).sort(([, a], [, b]) => b.e1rm - a.e1rm);
    }, [workoutLogs]);

    if (personalRecords.length === 0) {
        return (
            <Card>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Personal Records</h3>
                <p className="text-center text-slate-500 pt-8">No records yet. Log some heavy sets!</p>
            </Card>
        );
    }
    
    return (
        <Card>
             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Personal Records (e1RM)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                 {personalRecords.slice(0, 9).map(([name, record]) => (
                     <div key={name} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                         <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">{name}</p>
                         <p className="text-2xl font-bold text-accent dark:text-accent-light">{record.e1rm.toFixed(1)} <span className="text-lg text-slate-500">kg</span></p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{record.weight}kg x {record.reps} reps on {record.date}</p>
                     </div>
                 ))}
             </div>
        </Card>
    );
};