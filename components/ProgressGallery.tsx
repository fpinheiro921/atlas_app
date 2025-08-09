import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ProgressPhoto } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface PhotoUploaderModalProps {
    onClose: () => void;
    onAddPhoto: (imageDataUrl: string) => void;
}

const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({ onClose, onAddPhoto }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err) {
            console.error("Camera error:", err);
            // Handle camera permission error
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setCapturedImage(canvas.toDataURL('image/jpeg'));
            stopCamera();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedImage(e.target?.result as string);
                stopCamera();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (capturedImage) {
            onAddPhoto(capturedImage);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white uppercase mb-4">Add Progress Photo</h3>
                <div className="space-y-4">
                    {capturedImage ? (
                        <img src={capturedImage} alt="Progress" className="rounded-lg w-full" />
                    ) : (
                        <video ref={videoRef} autoPlay playsInline className="rounded-lg w-full bg-slate-200 dark:bg-slate-700"></video>
                    )}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    {capturedImage ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" onClick={() => { setCapturedImage(null); startCamera(); }}>Retake</Button>
                            <Button onClick={handleSave}>Save Photo</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={handleCapture}>Take Photo</Button>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload</Button>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
            </Card>
        </div>
    );
};

interface CompareViewProps {
    photo1: ProgressPhoto;
    photo2: ProgressPhoto;
    onClose: () => void;
}

const CompareView: React.FC<CompareViewProps> = ({ photo1, photo2, onClose }) => {
    const timeDiff = new Date(photo2.date).getTime() - new Date(photo1.date).getTime();
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    const weightDiff = photo2.weight - photo1.weight;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 p-4 flex flex-col" onClick={onClose}>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                {[photo1, photo2].map((photo, index) => (
                    <div key={index} className="relative">
                        <img src={photo.imageDataUrl} alt={`Progress ${index + 1}`} className="w-full h-full object-contain" />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-lg text-sm">
                            <p>{new Date(photo.date).toLocaleDateString()}</p>
                            <p className="font-bold">{photo.weight.toFixed(1)} kg</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 mt-4 bg-slate-900/80 text-white p-4 rounded-lg text-center">
                <h3 className="text-xl font-bold">Comparison</h3>
                <p>{daysDiff} days between photos</p>
                <p className={`font-bold ${weightDiff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg change
                </p>
            </div>
        </div>
    );
};


export const ProgressGallery: React.FC<{ photos: ProgressPhoto[], onAddPhoto: (imageDataUrl: string) => void, onDeletePhoto: (id: string) => void }> = ({ photos, onAddPhoto, onDeletePhoto }) => {
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
    const [comparePhotos, setComparePhotos] = useState<{ photo1: ProgressPhoto, photo2: ProgressPhoto } | null>(null);

    const handleSelectPhoto = (photo: ProgressPhoto) => {
        setSelectedPhotos(prev => {
            if (prev.find(p => p.id === photo.id)) {
                return prev.filter(p => p.id !== photo.id);
            }
            if (prev.length < 2) {
                return [...prev, photo];
            }
            return [prev[1], photo]; // Keep last selected and add new one
        });
    };

    const handleCompare = () => {
        if (selectedPhotos.length === 2) {
            const sorted = [...selectedPhotos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setComparePhotos({ photo1: sorted[0], photo2: sorted[1] });
        }
    };
    
    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedPhotos.length} photo(s)?`)) {
            selectedPhotos.forEach(p => onDeletePhoto(p.id));
            setSelectedPhotos([]);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white uppercase">Photo Gallery</h2>
                    <Button onClick={() => setIsUploaderOpen(true)}>Add Photo</Button>
                </div>
                {selectedPhotos.length > 0 && (
                    <div className="flex gap-4 mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Button onClick={handleCompare} disabled={selectedPhotos.length !== 2}>Compare ({selectedPhotos.length}/2)</Button>
                        <Button onClick={handleDeleteSelected} variant="secondary" className="!bg-red-500/20 !text-red-500 hover:!bg-red-500/30">Delete Selected</Button>
                    </div>
                )}
                {photos.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                        No photos yet. Add your first progress photo to start tracking your visual changes!
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {photos.map(photo => {
                            const isSelected = selectedPhotos.some(p => p.id === photo.id);
                            return (
                                <div key={photo.id} className="relative cursor-pointer group" onClick={() => handleSelectPhoto(photo)}>
                                    <img src={photo.imageDataUrl} alt={`Progress on ${photo.date}`} className={`w-full aspect-[3/4] object-cover rounded-lg transition-all duration-200 ${isSelected ? 'ring-4 ring-brand' : 'ring-2 ring-transparent'}`} />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-4xl">{isSelected ? 'check_circle' : 'add_circle'}</span>
                                    </div>
                                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs p-1 rounded">
                                        {new Date(photo.date).toLocaleDateString()} - {photo.weight.toFixed(1)}kg
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {isUploaderOpen && <PhotoUploaderModal onClose={() => setIsUploaderOpen(false)} onAddPhoto={onAddPhoto} />}
            {comparePhotos && <CompareView photo1={comparePhotos.photo1} photo2={comparePhotos.photo2} onClose={() => { setComparePhotos(null); setSelectedPhotos([]); }} />}
        </div>
    );
};
