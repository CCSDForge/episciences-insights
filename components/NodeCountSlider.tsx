'use client';

import React, { useId } from 'react';

interface NodeCountSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  color: 'teal' | 'blue';
}

const ACCENT_COLOR: Record<'teal' | 'blue', string> = {
  teal: '#0d9488',
  blue: '#2563eb',
};

export default function NodeCountSlider({ value, onChange, min, max, step, label, color }: NodeCountSliderProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {label}
        </label>
        <span className="text-xs font-black text-zinc-700 dark:text-zinc-200">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: ACCENT_COLOR[color] }}
        aria-valuetext={`${value}`}
      />
    </div>
  );
}
