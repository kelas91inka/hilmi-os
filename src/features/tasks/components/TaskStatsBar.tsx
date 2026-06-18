'use client';

import { useMemo } from 'react';
import { TaskWithTags, TASK_STATUS } from '../types/task.types';
import { isPast, isToday, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { AlertCircle, CalendarCheck, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface TaskStatsBarProps {
  tasks: TaskWithTags[];
}

export function TaskStatsBar({ tasks }: TaskStatsBarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const weekInterval = {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };

    const overdue = tasks.filter(t => {
      if (!t.due_date) return false;
      if (t.status === TASK_STATUS.SELESAI) return false;
      const d = parseISO(t.due_date);
      return isPast(d) && !isToday(d);
    }).length;

    const dueToday = tasks.filter(t => {
      if (!t.due_date) return false;
      if (t.status === TASK_STATUS.SELESAI) return false;
      return isToday(parseISO(t.due_date));
    }).length;

    const inProgress = tasks.filter(t => t.status === TASK_STATUS.SEDANG_DIKERJAKAN).length;

    const completedThisWeek = tasks.filter(t => {
      if (t.status !== TASK_STATUS.SELESAI) return false;
      if (!t.completed_at) return false;
      return isWithinInterval(new Date(t.completed_at), weekInterval);
    }).length;

    const total = tasks.filter(t => t.status !== TASK_STATUS.SELESAI).length;

    return { overdue, dueToday, inProgress, completedThisWeek, total };
  }, [tasks]);

  const items = [
    {
      id: 'overdue',
      label: 'Terlambat',
      value: stats.overdue,
      icon: AlertCircle,
      color: stats.overdue > 0 ? 'text-red-500' : 'text-muted-foreground',
      bg: stats.overdue > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-card border-border',
    },
    {
      id: 'today',
      label: 'Hari Ini',
      value: stats.dueToday,
      icon: CalendarCheck,
      color: stats.dueToday > 0 ? 'text-orange-500' : 'text-muted-foreground',
      bg: stats.dueToday > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-card border-border',
    },
    {
      id: 'inprogress',
      label: 'Dikerjakan',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-card border-border',
    },
    {
      id: 'week',
      label: 'Selesai Minggu Ini',
      value: stats.completedThisWeek,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-card border-border',
    },
    {
      id: 'active',
      label: 'Total Aktif',
      value: stats.total,
      icon: CheckCircle2,
      color: 'text-primary',
      bg: 'bg-card border-border',
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
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-background ${item.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xl font-bold leading-none ${item.color}`}>{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
