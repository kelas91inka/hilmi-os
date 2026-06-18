'use client';

import { useTransition } from 'react';
import { toggleHabitLogAction } from '@/features/habits/actions/habit.actions';
import { CheckCircle2, Circle, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface HabitItem {
  id: string;
  title: string;
  completedToday: boolean;
  completionsThisWeek: number;
  streak: number;
}

interface HabitCheckInProps {
  habits: HabitItem[];
  habitsCompletedToday: number;
  totalActiveHabits: number;
}

function HabitRow({ habit, today }: { habit: HabitItem; today: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleHabitLogAction(habit.id, today);
    });
  };

  return (
    <div
      className={`flex items-center gap-3 group cursor-pointer rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/50 ${isPending ? 'opacity-60' : ''}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      aria-label={`${habit.completedToday ? 'Batalkan' : 'Selesaikan'} habit: ${habit.title}`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          habit.completedToday
            ? 'border-primary bg-primary scale-110'
            : 'border-muted-foreground/40 group-hover:border-primary/50'
        }`}
      >
        {habit.completedToday && (
          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
        )}
      </div>

      <span
        className={`text-sm flex-1 line-clamp-1 transition-colors ${
          habit.completedToday
            ? 'line-through text-muted-foreground'
            : 'group-hover:text-primary'
        }`}
      >
        {habit.title}
      </span>

      {/* Streak badge */}
      {habit.streak >= 2 && (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-500 shrink-0">
          <Flame className="w-3 h-3" />
          {habit.streak}
        </span>
      )}

      {/* Weekly dots */}
      <div className="flex gap-0.5 shrink-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < habit.completionsThisWeek ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function HabitCheckInWidget({
  habits,
  habitsCompletedToday,
  totalActiveHabits,
}: HabitCheckInProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const pct = totalActiveHabits > 0
    ? Math.round((habitsCompletedToday / totalActiveHabits) * 100)
    : 0;

  if (habits.length === 0) return (
    <div className="text-center py-4 text-sm text-muted-foreground">
      Belum ada habit aktif.
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            {habitsCompletedToday} dari {totalActiveHabits} selesai
          </span>
          <span className={`font-bold ${pct === 100 ? 'text-green-500' : 'text-primary'}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              pct === 100 ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Habit list — interactive */}
      <div className="space-y-0.5">
        {habits.slice(0, 8).map((habit) => (
          <HabitRow key={habit.id} habit={habit} today={today} />
        ))}
      </div>

      {pct === 100 && (
        <p className="text-xs text-center text-green-600 font-medium bg-green-500/10 rounded-lg py-1.5">
          🎉 Semua habit hari ini selesai!
        </p>
      )}
    </div>
  );
}
