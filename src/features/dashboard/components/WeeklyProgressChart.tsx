'use client';

import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

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

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1.5 h-20">
        {dailyChartData.map((day) => {
          const isToday = day.date === today;
          const heightPct = maxCount > 0 ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 15 : 4) : 4;
          const label = format(parseISO(day.date), 'EEE', { locale: id });

          return (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
              {/* Count badge */}
              {day.count > 0 && (
                <span className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {day.count}
                </span>
              )}
              {day.count === 0 && <span className="text-[10px] opacity-0">0</span>}

              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${
                    isToday
                      ? 'bg-primary'
                      : day.count > 0
                      ? 'bg-primary/40'
                      : 'bg-muted'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day label */}
              <span className={`text-[10px] ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <p className="text-xl font-bold">{completedTasksThisWeek}</p>
          <p className="text-xs text-muted-foreground">tugas minggu ini</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">
            {dailyChartData.find(d => d.date === today)?.count ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">hari ini</p>
        </div>
      </div>
    </div>
  );
}
