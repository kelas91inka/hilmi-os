'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TaskWithTags, TASK_STATUS, TaskStatus } from '../types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { Goal } from '@/features/goals/types/goal.types';
import { TaskItem } from './TaskItem';
import { updateTaskStatusAction } from '../actions/task.actions';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: TaskWithTags[];
  projects: Project[];
  goals: Goal[];
}

const COLUMNS = [
  {
    id: TASK_STATUS.BELUM_DIMULAI,
    title: 'Belum Dimulai',
    icon: Circle,
    iconColor: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
    headerBg: 'bg-muted/60',
    activeBg: 'bg-primary/5 border-primary border-dashed',
  },
  {
    id: TASK_STATUS.SEDANG_DIKERJAKAN,
    title: 'Sedang Dikerjakan',
    icon: Clock,
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-500/5',
    activeBg: 'bg-blue-500/10 border-blue-400 border-dashed',
  },
  {
    id: TASK_STATUS.SELESAI,
    title: 'Selesai',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    dotColor: 'bg-green-500',
    headerBg: 'bg-green-500/5',
    activeBg: 'bg-green-500/10 border-green-400 border-dashed',
  },
] as const;

export function TaskBoard({ tasks, projects, goals }: TaskBoardProps) {
  const router = useRouter();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state: track in-flight status changes
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, update: { taskId: string; newStatus: TaskStatus }) =>
      currentTasks.map(t =>
        t.id === update.taskId ? { ...t, status: update.newStatus } : t
      )
  );

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setIsDraggingOver(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (isDraggingOver !== columnId) {
      setIsDraggingOver(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column container entirely
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDraggingOver(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setIsDraggingOver(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = optimisticTasks.find(t => t.id === taskId);
    if (!task || task.status === columnId) return;

    // Run the optimistic update in a synchronous transition
    startTransition(() => {
      updateOptimisticTasks({ taskId, newStatus: columnId as TaskStatus });
    });

    // Run the server action outside of the transition to prevent hanging
    await updateTaskStatusAction(taskId, columnId as TaskStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = optimisticTasks.filter(t => t.status === column.id);
        const Icon = column.icon;
        const isOver = isDraggingOver === column.id;

        return (
          <div
            key={column.id}
            className={`rounded-2xl min-h-[500px] transition-all duration-200 border-2 ${
              isOver
                ? `${column.activeBg}`
                : 'border-transparent bg-muted/30'
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`rounded-t-2xl px-4 py-3 ${column.headerBg} border-b border-border/50`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${column.iconColor}`} />
                  <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${column.dotColor}`}>
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-3 flex flex-col gap-2.5">
              {columnTasks.length === 0 ? (
                <div className={`text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-xl transition-colors ${
                  isOver ? 'border-primary/40 text-primary' : 'border-muted'
                }`}>
                  {isOver ? '📥 Lepas di sini' : 'Tarik tugas ke sini'}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing transition-all duration-150 ${
                      draggedTaskId === task.id
                        ? 'opacity-40 scale-95 rotate-1'
                        : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <TaskItem task={task} projects={projects} goals={goals} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
