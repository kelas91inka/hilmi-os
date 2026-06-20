'use client';

import { useMemo } from 'react';
import { HabitWithLogs } from '../types/habit.types';
import { format } from 'date-fns';
import { Flame, CheckCircle2, Trophy, Sparkles } from 'lucide-react';

interface HabitStatsBarProps {
  habits: HabitWithLogs[];
}

export function HabitStatsBar({ habits }: HabitStatsBarProps) {
  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const totalActive = habits.filter(h => h.active).length;
    const completedToday = habits.filter(h => h.active && h.logs.some(l => l.completed_date === todayStr)).length;
    const todayPercentage = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0;
    
    const highestStreak = habits.reduce((max, h) => Math.max(max, h.stats.currentStreak), 0);
    const totalCompletions = habits.reduce((sum, h) => sum + h.stats.totalCompletions, 0);

    return {
      totalActive,
      completedToday,
      todayPercentage,
      highestStreak,
      totalCompletions,
    };
  }, [habits]);

  const items = [
    {
      id: 'active',
      label: 'Kebiasaan Aktif',
      value: `${stats.totalActive} Kebiasaan`,
      icon: Sparkles,
      color: 'text-violet-500',
      bg: 'bg-card border-border',
    },
    {
      id: 'today',
      label: 'Selesai Hari Ini',
      value: `${stats.todayPercentage}%`,
      subtitle: `${stats.completedToday} dari ${stats.totalActive}`,
      icon: CheckCircle2,
      color: stats.todayPercentage === 100 ? 'text-emerald-500' : 'text-primary',
      bg: stats.todayPercentage === 100 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 'bg-card border-border',
    },
    {
      id: 'streak',
      label: 'Streak Tertinggi',
      value: `${stats.highestStreak} Hari`,
      icon: Flame,
      color: stats.highestStreak > 0 ? 'text-orange-500' : 'text-muted-foreground',
      bg: stats.highestStreak > 0 ? 'bg-orange-500/10 border-orange-500/20 shadow-sm shadow-orange-500/5' : 'bg-card border-border',
    },
    {
      id: 'total',
      label: 'Total Checklist',
      value: `${stats.totalCompletions} Kali`,
      icon: Trophy,
      color: 'text-amber-500',
      bg: 'bg-card border-border',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${item.bg}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-background shrink-0 border border-border/40 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className={`text-xl font-bold leading-none truncate ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                <span>{item.label}</span>
                {item.subtitle && <span className="opacity-60">({item.subtitle})</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
