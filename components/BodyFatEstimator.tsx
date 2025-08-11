import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Sex } from '../types';
import { getAIBodyFatEstimation } from '../services/geminiService';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Spinner } from './Spinner';

// As per the spec
const MALE_FORMULA_CONSTANTS = {
    c1: 86.010,
    c2: 70.041,
    c3: 36.76
};

const FEMALE_FORMULA_CONSTANTS = {
    c1: 163.205,
    c2: 97.684,
    c3: -78.387
};

interface BodyFatEstimatorProps {
    onComplete: (bodyFat: number) => void;
}

export interface BodyFatEstimatorRef {
    submit: () => void;
}

export const BodyFatEstimator = forwardRef<BodyFatEstimatorRef, BodyFatEstimatorProps>(({ onComplete }, ref) => {
    const [sex, setSex] = useState<Sex>(Sex.MALE);
    const [height, setHeight] = useState('');
    const [neck, setNeck] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
    const [sidePhoto, setSidePhoto] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'front') {
                setFrontPhoto(file);
            } else {
                setSidePhoto(file);
            }
        }
    };

    const calculateBodyFat = () => {
        const h = parseFloat(height);
        const n = parseFloat(neck);
        const w = parseFloat(waist);
        const hip = parseFloat(hips);

        if (sex === Sex.MALE) {
            if (h > 0 && n > 0 && w > 0) {
                const bfp = MALE_FORMULA_CONSTANTS.c1 * Math.log10(w - n) - MALE_FORMULA_CONSTANTS.c2 * Math.log10(h) + MALE_FORMULA_CONSTANTS.c3;
                return bfp;
            }
        } else {
            if (h > 0 && n > 0 && w > 0 && hip > 0) {
                const bfp = FEMALE_FORMULA_CONSTANTS.c1 * Math.log10(w + hip - n) - FEMALE_FORMULA_CONSTANTS.c2 * Math.log10(h) + FEMALE_FORMULA_CONSTANTS.c3;
                return bfp;
            }
        }
        return null;
    };

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleSubmit = async () => {
        setError(null);
        setStatus('processing');

        if (!frontPhoto || !sidePhoto || !height || !neck || !waist || (sex === Sex.FEMALE && !hips)) {
            setError("Please fill all fields and upload both photos.");
            setStatus('idle');
            return;
        }

        try {
            const frontPhotoBase64 = await toBase64(frontPhoto);
            const sidePhotoBase64 = await toBase64(sidePhoto);

            const aiEstimation = await getAIBodyFatEstimation(
                frontPhotoBase64,
                sidePhotoBase64,
                sex,
                parseFloat(height)
            );

            if (!aiEstimation.image_quality_ok) {
                setError(`Image quality issue: ${aiEstimation.image_quality_issue_reason}`);
                setStatus('idle');
                return;
            }

            const userWaist = parseFloat(waist);
            const aiWaist = aiEstimation.ai_estimated_measurements_cm.waist_circumference_cm;
            const waistDifference = Math.abs(userWaist - aiWaist) / userWaist;

            if (waistDifference > 0.15) { // 15% tolerance
                setError("Our AI analysis suggests your waist measurement might be off. Could you please measure again carefully to ensure the most accurate result?");
                setStatus('idle');
                return;
            }

            const bodyFat = calculateBodyFat();
            if (bodyFat !== null) {
                onComplete(bodyFat);
            } else {
                setError("Could not calculate body fat. Please check your measurements.");
                setStatus('idle');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
            setStatus('idle');
        }
    };

    return (
        <div className="p-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-center">Estimate Body Fat</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Upload Photos</h4>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Front View</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand dark:file:bg-brand-dark dark:file:text-white hover:file:bg-brand-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Side View</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'side')} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand dark:file:bg-brand-dark dark:file:text-white hover:file:bg-brand-accent" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Enter Measurements (cm)</h4>
                    <Select label="Sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                        <option value={Sex.MALE}>Male</option>
                        <option value={Sex.FEMALE}>Female</option>
                    </Select>
                    <Input label="Height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 180" />
                    <Input label="Neck" type="number" value={neck} onChange={(e) => setNeck(e.target.value)} placeholder="e.g., 40" />
                    <Input label="Waist" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g., 85" />
                    {sex === Sex.FEMALE && (
                        <Input label="Hips" type="number" value={hips} onChange={(e) => setHips(e.target.value)} placeholder="e.g., 95" />
                    )}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {status === 'processing' && <div className="flex justify-center"><Spinner /></div>}
        </div>
    );
});
