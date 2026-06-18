'use client';

import { useState } from 'react';
import { HabitWithLogs } from '../types/habit.types';
import { toggleHabitLogAction } from '../actions/habit.actions';
import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface HabitTrackerGridProps {
  habits: HabitWithLogs[];
  daysCount?: number;
}

export function HabitTrackerGrid({ habits, daysCount = 7 }: HabitTrackerGridProps) {
  const [loadingCells, setLoadingCells] = useState<Record<string, boolean>>({});

  // Generate the last X days array
  const today = new Date();
  const days = Array.from({ length: daysCount }).map((_, i) => subDays(today, daysCount - 1 - i));

  const handleToggle = async (habitId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const cellKey = `${habitId}-${dateString}`;
    
    setLoadingCells(prev => ({ ...prev, [cellKey]: true }));
    await toggleHabitLogAction(habitId, dateString);
    setLoadingCells(prev => ({ ...prev, [cellKey]: false }));
  };

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-max border rounded-lg overflow-hidden bg-card text-sm">
        <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${daysCount}, minmax(48px, 1fr))` }}>
          <div className="p-3 font-semibold text-foreground flex items-center border-r">Kebiasaan</div>
          {days.map((day, i) => (
            <div key={i} className="p-2 border-r last:border-r-0 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{format(day, 'dd')}</span>
              <span>{format(day, 'E')}</span>
            </div>
          ))}
        </div>

        {/* Habit Rows */}
        {habits.map((habit) => (
          <div key={habit.id} className="grid border-b last:border-b-0 hover:bg-muted/50 transition-colors" style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${daysCount}, minmax(48px, 1fr))` }}>
            <div className="p-3 flex items-center justify-between border-r">
              <Link href={`/portal/habits/${habit.id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                {habit.title}
              </Link>
              <div className="text-xs text-muted-foreground ml-2 hidden sm:flex items-center gap-1">
                <span className="text-orange-500 font-bold" title="Current Streak">🔥 {habit.stats.currentStreak}</span>
              </div>
            </div>
            
            {days.map((day, i) => {
              const dateString = format(day, 'yyyy-MM-dd');
              const isCompleted = habit.logs.some(log => log.completed_date === dateString);
              const isTodayCell = isSameDay(day, today);
              const cellKey = `${habit.id}-${dateString}`;
              const isLoading = loadingCells[cellKey];

              return (
                <div key={i} className={cn("border-r last:border-r-0 flex items-center justify-center p-1 cursor-pointer transition-colors hover:bg-muted", isTodayCell && "bg-primary/5")}>
                  <button
                    onClick={() => handleToggle(habit.id, day)}
                    disabled={isLoading}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                      isCompleted ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600",
                      isLoading && "opacity-50"
                    )}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCompleted ? <Check className="w-4 h-4" /> : null)}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
