'use client';

import { useMemo } from 'react';
import { DiaryEntry } from '../types/diary.types';
import { parseISO, subDays, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import { Flame, BookOpen, Calendar, Zap, Heart } from 'lucide-react';

interface DiaryStatsBarProps {
  entries: DiaryEntry[];
}

export function DiaryStatsBar({ entries }: DiaryStatsBarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');
    
    // 1. Streak calculation (consecutive writing days)
    let streak = 0;
    if (entries.length > 0) {
      // Get unique sorted dates in descending order
      const uniqueDates = Array.from(new Set(entries.map(e => e.entry_date)))
        .sort((a, b) => b.localeCompare(a));
      
      // Streak continues if latest entry is today or yesterday
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        streak = 1;
        let expectedDate = parseISO(uniqueDates[0]);
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevExpectedDate = subDays(expectedDate, 1);
          const prevExpectedStr = format(prevExpectedDate, 'yyyy-MM-dd');
          
          if (uniqueDates[i] === prevExpectedStr) {
            streak++;
            expectedDate = prevExpectedDate;
          } else {
            break; // Streak broken
          }
        }
      }
    }

    // 2. Entries this calendar month
    const currentYearMonth = format(now, 'yyyy-MM');
    const thisMonth = entries.filter(e => e.entry_date.startsWith(currentYearMonth)).length;

    // 3. Entries this calendar week
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = entries.filter(e => {
      try {
        const d = parseISO(e.entry_date);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      } catch (err) {
        return false;
      }
    }).length;

    // 4. Positive days count (happy or productive)
    const positiveDays = entries.filter(e => e.mood === 'happy' || e.mood === 'productive').length;

    // 5. Total entries count
    const total = entries.length;

    return { streak, thisMonth, thisWeek, positiveDays, total };
  }, [entries]);

  const items = [
    {
      id: 'streak',
      label: 'Streak Menulis',
      value: `${stats.streak} Hari`,
      icon: Flame,
      color: stats.streak > 0 ? 'text-orange-500' : 'text-muted-foreground',
      bg: stats.streak > 0 ? 'bg-orange-500/10 border-orange-500/20 shadow-sm shadow-orange-500/5' : 'bg-card border-border',
    },
    {
      id: 'total',
      label: 'Total Jurnal',
      value: stats.total,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-card border-border',
    },
    {
      id: 'month',
      label: 'Bulan Ini',
      value: stats.thisMonth,
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-card border-border',
    },
    {
      id: 'week',
      label: 'Minggu Ini',
      value: stats.thisWeek,
      icon: Calendar,
      color: 'text-emerald-500',
      bg: 'bg-card border-border',
    },
    {
      id: 'positive',
      label: 'Hari Positif',
      value: stats.positiveDays,
      icon: Heart,
      color: stats.positiveDays > 0 ? 'text-rose-500' : 'text-muted-foreground',
      bg: stats.positiveDays > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-card border-border',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.bg}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-background shrink-0 ${item.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xl font-bold leading-none ${item.color}`}>{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
