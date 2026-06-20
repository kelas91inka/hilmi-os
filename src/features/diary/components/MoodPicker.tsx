'use client';

import { Mood } from '../types/diary.types';
import { cn } from '@/lib/utils';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const moods: { value: Mood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😄', label: 'Bahagia' },
  { value: 'productive', emoji: '🚀', label: 'Produktif' },
  { value: 'neutral', emoji: '😐', label: 'Netral' },
  { value: 'tired', emoji: '🥱', label: 'Lelah' },
  { value: 'stressed', emoji: '🤯', label: 'Stres' },
  { value: 'sad', emoji: '😔', label: 'Sedih' },
  { value: 'sick', emoji: '🤒', label: 'Sakit' },
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
