
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: number;
}

export const Slider: React.FC<SliderProps> = ({ label, id, value, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}: <span className="font-bold text-brand">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min="1"
        max="10"
        value={value}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand"
        {...props}
      />
    </div>
  );
};
