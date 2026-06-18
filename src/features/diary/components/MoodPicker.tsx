'use client';

import { Mood } from '../types/diary.types';
import { cn } from '@/lib/utils';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const moods: { value: Mood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😄', label: 'Happy' },
  { value: 'productive', emoji: '🚀', label: 'Productive' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'tired', emoji: '🥱', label: 'Tired' },
  { value: 'stressed', emoji: '🤯', label: 'Stressed' },
  { value: 'sad', emoji: '😔', label: 'Sad' },
  { value: 'sick', emoji: '🤒', label: 'Sick' },
];

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95',
            value === mood.value 
              ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-500 dark:border-rose-400 border text-rose-700 dark:text-rose-300 font-medium shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          <span className="text-base">{mood.emoji}</span>
          <span>{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
