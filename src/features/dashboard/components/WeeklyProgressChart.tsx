'use client';

import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  count: number;
}

interface WeeklyProgressChartProps {
  dailyChartData: DayData[];
  completedTasksThisWeek: number;
}

export function WeeklyProgressChart({
  dailyChartData,
  completedTasksThisWeek,
}: WeeklyProgressChartProps) {
  const maxCount = Math.max(...dailyChartData.map(d => d.count), 1);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCount = dailyChartData.find(d => d.date === today)?.count ?? 0;

  return (
    <div className="space-y-4">
      {/* Mini bar chart */}
      <div className="flex items-end justify-between gap-1.5 h-[72px]">
        {dailyChartData.map((day) => {
          const isToday = day.date === today;
          const heightPct = maxCount > 0
            ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 18 : 5)
            : 5;
          const label = format(parseISO(day.date), 'EEE', { locale: id });

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              {/* Count */}
              <span className={cn(
                'text-[9px] font-mono-num font-bold',
                isToday ? 'text-primary' : 'text-muted-foreground/60',
                day.count === 0 && 'opacity-0'
              )}>
                {day.count || 0}
              </span>

              {/* Bar container */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-700',
                    isToday
                      ? 'bg-primary glow-primary'
                      : day.count > 0
                      ? 'bg-primary/35'
                      : 'bg-muted'
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day label */}
              <span className={cn(
                'text-[9px] font-medium leading-none',
                isToday ? 'text-primary' : 'text-muted-foreground/60'
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="font-mono-num text-2xl font-bold leading-none">{completedTasksThisWeek}</p>
          <p className="text-[10px] text-muted-foreground mt-1">tugas minggu ini</p>
        </div>
        <div className="text-right">
          <p className={cn(
            'font-mono-num text-lg font-bold leading-none',
            todayCount > 0 ? 'text-primary' : 'text-muted-foreground'
          )}>
            {todayCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">hari ini</p>
        </div>
      </div>
    </div>
  );
}
