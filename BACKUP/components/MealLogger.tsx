import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { getMealMacrosFromImage } from '../services/geminiService';
import type { MealAnalysis } from '../types';
import { Input } from './Input';

interface MealLoggerProps {
    onClose: () => void;
    onLogMeal: (analysis: MealAnalysis) => void;
}

const MealAnalysisDisplay: React.FC<{ analysis: MealAnalysis; image: string; onReset: () => void; onLogMeal: (analysis: MealAnalysis) => void; }> = ({ analysis, image, onReset, onLogMeal }) => {
    const [isLogged, setIsLogged] = useState(false);

    const handleLog = () => {
        onLogMeal(analysis);
        setIsLogged(true);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img src={image} alt="Captured meal" className="rounded-lg shadow-md" />
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{analysis.mealName}</h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Calories</p>
                            <p className="text-2xl font-bold text-brand">{analysis.calories}</p>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Protein</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{analysis.protein}g</p>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Carbs</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{analysis.carbs}g</p>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Fat</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{analysis.fat}g</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                 <h4 className="font-semibold text-slate-700 dark:text-slate-300">AI Rationale:</h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md mt-1">{analysis.rationale}</p>
                 <p className="text-xs text-slate-500 mt-2">Note: This is an AI-powered estimation and may not be 100% accurate. Use it as a guideline.</p>
            </div>
             <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={handleLog} className="w-full" disabled={isLogged}>
                    {isLogged ? 'Logged!' : 'Log Meal Macros'}
                </Button>
                <Button onClick={onReset} variant="secondary" className="w-full">
                    Analyze Another
                </Button>
            </div>
        </div>
    );
};


export const MealLogger: React.FC<MealLoggerProps> = ({ onClose, onLogMeal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const [status, setStatus] = useState<'idle' | 'capturing' | 'captured' | 'analyzing' | 'analyzed' | 'error'>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualMeal, setManualMeal] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
            setStatus('capturing');
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access the camera. Please check your browser permissions.");
            setStatus('error');
        }
    }, []);
    
    useEffect(() => {
        if(mode === 'camera'){
            startCamera();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera, mode]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(dataUrl);
            setStatus('captured');
        }
    };
    
    const handleAnalyze = async () => {
        if (!capturedImage) return;
        setStatus('analyzing');
        setError(null);
        try {
            const base64Image = capturedImage.split(',')[1];
            const result = await getMealMacrosFromImage(base64Image);
            setAnalysisResult(result);
            setStatus('analyzed');
        } catch(err) {
            console.error("Analysis failed:", err);
            setError(err instanceof Error ? err.message : "The AI failed to analyze the image. The food might be unclear, or there was a network issue. Please try again.");
            setStatus('error');
        }
    }
    
    const handleReset = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setError(null);
        if (stream) {
             setStatus('capturing');
        } else {
            startCamera();
        }
    };

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualMeal(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const analysis: MealAnalysis = {
            mealName: manualMeal.name || 'Manually Logged Meal',
            calories: parseInt(manualMeal.calories, 10) || 0,
            protein: parseInt(manualMeal.protein, 10) || 0,
            carbs: parseInt(manualMeal.carbs, 10) || 0,
            fat: parseInt(manualMeal.fat, 10) || 0,
            rationale: 'Manually logged entry.'
        };
        onLogMeal(analysis);
        onClose();
    };


    const renderContent = () => {
        if (mode === 'manual') {
            return (
                <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in">
                    <Input id="name" label="Meal Name" type="text" value={manualMeal.name} onChange={handleManualChange} placeholder="e.g., Chicken and Rice" required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="calories" label="Calories (kcal)" type="number" value={manualMeal.calories} onChange={handleManualChange} required />
                        <Input id="protein" label="Protein (g)" type="number" value={manualMeal.protein} onChange={handleManualChange} required />
                        <Input id="carbs" label="Carbs (g)" type="number" value={manualMeal.carbs} onChange={handleManualChange} required />
                        <Input id="fat" label="Fat (g)" type="number" value={manualMeal.fat} onChange={handleManualChange} required />
                    </div>
                    <Button type="submit" className="w-full">Log Manual Meal</Button>
                </form>
            );
        }

        switch(status) {
            case 'idle':
            case 'capturing':
                return (
                    <div className="space-y-4">
                        <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden">
                             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        </div>
                        <Button onClick={handleCapture} className="w-full">Capture Photo</Button>
                    </div>
                );
            case 'captured':
                return (
                     <div className="space-y-4">
                        {capturedImage && <img src={capturedImage} alt="Captured meal" className="rounded-lg shadow-md" />}
                        <div className="flex gap-4">
                            <Button onClick={handleReset} variant="secondary" className="w-full">Retake</Button>
                            <Button onClick={handleAnalyze} className="w-full">Analyze Meal</Button>
                        </div>
                    </div>
                );
            case 'analyzing':
                return (
                     <div className="flex flex-col items-center justify-center p-8 space-y-4">
                        <Spinner size="h-10 w-10" className="text-brand"/>
                        <p className="text-slate-600 dark:text-slate-400">AI is analyzing your meal...</p>
                        {capturedImage && <img src={capturedImage} alt="Analyzing meal" className="rounded-lg shadow-md mt-4 w-1/2 opacity-50" />}
                    </div>
                );
            case 'analyzed':
                return analysisResult && capturedImage ? (
                    <MealAnalysisDisplay analysis={analysisResult} image={capturedImage} onReset={handleReset} onLogMeal={onLogMeal} />
                ) : null;
            case 'error':
                 return (
                    <div className="text-center p-4">
                        <h3 className="text-lg font-bold text-red-500">An Error Occurred</h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">{error}</p>
                        <Button onClick={handleReset} variant="secondary" className="mt-4">Try Again</Button>
                    </div>
                );
        }
    };

    return (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex-grow">
                         <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">
                            Meal Analyzer
                          </h2>
                    </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                     <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setMode('camera')} className={`px-2 py-1 text-xs rounded-md transition-colors ${mode === 'camera' ? 'bg-white dark:bg-slate-900 text-brand' : 'text-slate-500'}`}><span className="material-symbols-outlined !text-base">photo_camera</span></button>
                        <button onClick={() => setMode('manual')} className={`px-2 py-1 text-xs rounded-md transition-colors ${mode === 'manual' ? 'bg-white dark:bg-slate-900 text-brand' : 'text-slate-500'}`}><span className="material-symbols-outlined !text-base">edit</span></button>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
                 <div className="overflow-y-auto pr-2 -mr-4">
                    {renderContent()}
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </Card>
        </div>
    );
};
