'use client';

import { useTransition } from 'react';
import { toggleHabitLogAction } from '@/features/habits/actions/habit.actions';
import { Check, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
      className={cn(
        'flex items-center gap-3 group cursor-pointer rounded-xl px-2.5 py-2 -mx-2.5 transition-all duration-150',
        'hover:bg-muted/70 border border-transparent hover:border-border/50',
        isPending && 'opacity-60 pointer-events-none'
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      aria-label={`${habit.completedToday ? 'Batalkan' : 'Selesaikan'} habit: ${habit.title}`}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
          habit.completedToday
            ? 'border-emerald-500 bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/30'
            : 'border-muted-foreground/30 group-hover:border-primary/60'
        )}
      >
        {habit.completedToday && (
          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
        )}
      </div>

      {/* Title */}
      <span
        className={cn(
          'text-sm flex-1 line-clamp-1 transition-colors leading-tight',
          habit.completedToday
            ? 'line-through text-muted-foreground'
            : 'group-hover:text-primary'
        )}
      >
        {habit.title}
      </span>

      {/* Streak badge */}
      {habit.streak >= 2 && (
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-orange-500 shrink-0 font-mono-num">
          <Flame className="w-3 h-3" />
          {habit.streak}
        </span>
      )}

      {/* Weekly dots — 7 dots showing this week */}
      <div className="flex gap-0.5 shrink-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              i < habit.completionsThisWeek
                ? 'bg-emerald-500'
                : 'bg-muted'
            )}
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
  const isAllDone = pct === 100 && totalActiveHabits > 0;

  if (habits.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-sm text-muted-foreground">Belum ada habit aktif.</p>
        <Link href="/portal/habits" className="text-xs text-primary hover:underline mt-1.5 inline-block font-medium">
          Buat habit pertama →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            <span className="font-mono-num font-bold text-foreground">{habitsCompletedToday}</span>
            {' '}dari{' '}
            <span className="font-mono-num font-bold text-foreground">{totalActiveHabits}</span>
            {' '}selesai
          </span>
          <span className={cn(
            'text-xs font-bold font-mono-num',
            isAllDone ? 'text-emerald-500' : 'text-primary'
          )}>
            {pct}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all duration-700',
              isAllDone ? 'bg-emerald-500' : 'bg-primary'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Habit list */}
      <div className="space-y-0.5 -mx-0">
        {habits.slice(0, 8).map((habit) => (
          <HabitRow key={habit.id} habit={habit} today={today} />
        ))}
      </div>

      {/* All done celebration */}
      {isAllDone && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 flex items-center gap-2">
          <span className="text-base">🎉</span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Semua habit hari ini selesai!
          </p>
        </div>
      )}
    </div>
  );
}
