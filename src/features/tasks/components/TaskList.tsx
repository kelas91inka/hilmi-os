'use client';

import { TaskWithTags, TASK_STATUS } from '../types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { Goal } from '@/features/goals/types/goal.types';
import { TaskItem } from './TaskItem';
import { AlertCircle, Circle, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { isPast, isToday, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: TaskWithTags[];
  projects: Project[];
  goals: Goal[];
}

const STATUS_CONFIG = {
  [TASK_STATUS.SEDANG_DIKERJAKAN]: {
    label: 'Sedang Dikerjakan',
    icon: Clock,
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  [TASK_STATUS.BELUM_DIMULAI]: {
    label: 'Belum Dimulai',
    icon: Circle,
    iconColor: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
  [TASK_STATUS.DITUNDA]: {
    label: 'Ditunda',
    icon: PauseCircle,
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400',
  },
  [TASK_STATUS.SELESAI]: {
    label: 'Selesai',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    dotColor: 'bg-green-500',
  },
};

// Section order: overdue first, then by status importance
const STATUS_ORDER = [
  TASK_STATUS.SEDANG_DIKERJAKAN,
  TASK_STATUS.BELUM_DIMULAI,
  TASK_STATUS.DITUNDA,
  TASK_STATUS.SELESAI,
];

export function TaskList({ tasks, projects, goals }: TaskListProps) {
  // Separate overdue tasks (non-completed, past due date, not today)
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    if (t.status === TASK_STATUS.SELESAI) return false;
    const d = parseISO(t.due_date);
    return isPast(d) && !isToday(d);
  });

  // Non-overdue tasks grouped by status
  const overdueIds = new Set(overdueTasks.map(t => t.id));
  const remainingTasks = tasks.filter(t => !overdueIds.has(t.id));

  const groupedTasks = STATUS_ORDER.reduce((acc, status) => {
    const statusTasks = remainingTasks.filter(t => t.status === status);
    if (statusTasks.length > 0) acc[status] = statusTasks;
    return acc;
  }, {} as Record<string, TaskWithTags[]>);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
        <p className="text-muted-foreground text-sm">Tidak ada tugas yang sesuai dengan kriteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overdue Section — highlighted */}
      {overdueTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-sm text-red-600 dark:text-red-400 uppercase tracking-wider">
              Terlambat
            </h3>
            <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
              {overdueTasks.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-1 border-l-2 border-red-500/30">
            {overdueTasks.map(task => (
              <TaskItem key={task.id} task={task} projects={projects} goals={goals} />
            ))}
          </div>
        </div>
      )}

      {/* Grouped by status */}
      {STATUS_ORDER.map(status => {
        const statusTasks = groupedTasks[status];
        if (!statusTasks || statusTasks.length === 0) return null;

        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        const Icon = config.icon;

        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {config.label}
              </h3>
              <span className={`text-xs text-white font-bold px-2 py-0.5 rounded-full ${config.dotColor}`}>
                {statusTasks.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {statusTasks.map(task => (
                <TaskItem key={task.id} task={task} projects={projects} goals={goals} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
