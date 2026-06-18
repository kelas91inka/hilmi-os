"use client";

import { useState, useTransition } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  CalendarIcon, MoreVertical, Trash, CheckCircle2, Circle,
  FolderKanban, Target, AlertCircle, Play, Pause,
} from "lucide-react";
import { TaskWithTags, TASK_STATUS, TASK_PRIORITY, TaskStatus, TaskPriority } from "../types/task.types";
import { deleteTaskAction, updateTaskStatusAction } from "../actions/task.actions";
import { TaskForm } from "./TaskForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Project } from "@/features/projects/types/project.types";
import { Goal } from "@/features/goals/types/goal.types";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: TaskWithTags;
  projects?: Project[];
  goals?: Goal[];
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  [TASK_PRIORITY.RENDAH]: { label: 'Rendah', className: 'bg-muted text-muted-foreground border-transparent' },
  [TASK_PRIORITY.NORMAL]: { label: 'Normal', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent' },
  [TASK_PRIORITY.TINGGI]: { label: 'Tinggi', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-transparent' },
  [TASK_PRIORITY.KRITIS]: { label: 'Kritis', className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-transparent' },
};

const STATUS_LABEL: Record<string, string> = {
  [TASK_STATUS.BELUM_DIMULAI]: 'Belum Dimulai',
  [TASK_STATUS.SEDANG_DIKERJAKAN]: 'Dikerjakan',
  [TASK_STATUS.SELESAI]: 'Selesai',
  [TASK_STATUS.DITUNDA]: 'Ditunda',
};

export function TaskItem({ task, projects = [], goals = [] }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTogglingComplete, startToggleTransition] = useTransition();
  const [isChangingStatus, startStatusTransition] = useTransition();

  const priorityConfig = PRIORITY_CONFIG[task.priority ?? ''] ?? PRIORITY_CONFIG[TASK_PRIORITY.NORMAL];

  const handleDelete = async () => {
    await deleteTaskAction(task.id);
  };

  const toggleComplete = () => {
    startToggleTransition(async () => {
      const newStatus = task.status === TASK_STATUS.SELESAI
        ? TASK_STATUS.BELUM_DIMULAI
        : TASK_STATUS.SELESAI;
      await updateTaskStatusAction(task.id, newStatus);
    });
  };

  const setInProgress = () => {
    if (task.status === TASK_STATUS.SEDANG_DIKERJAKAN) return;
    startStatusTransition(async () => {
      await updateTaskStatusAction(task.id, TASK_STATUS.SEDANG_DIKERJAKAN);
    });
  };

  const setOnHold = () => {
    if (task.status === TASK_STATUS.DITUNDA) return;
    startStatusTransition(async () => {
      await updateTaskStatusAction(task.id, TASK_STATUS.DITUNDA);
    });
  };

  const project = projects.find(p => p.id === task.project_id);
  const goal = goals.find(g => g.id === task.goal_id);

  let isOverdue = false;
  let dateText = '';
  if (task.due_date) {
    const dDate = parseISO(task.due_date);
    isOverdue = isPast(dDate) && !isToday(dDate) && task.status !== TASK_STATUS.SELESAI;
    dateText = format(dDate, "dd MMM yyyy", { locale: localeId });
  }

  const isCompleted = task.status === TASK_STATUS.SELESAI;
  const isLoading = isTogglingComplete || isChangingStatus;

  return (
    <>
      <Card
        className={`relative transition-all duration-200 hover:border-primary/50 hover:shadow-sm ${
          isCompleted ? 'opacity-55 bg-muted/30' : 'bg-card'
        } ${isLoading ? 'opacity-70' : ''}`}
      >
        <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Complete toggle */}
            <button
              onClick={toggleComplete}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary transition-colors mt-0.5 shrink-0"
              aria-label={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
            >
              {isTogglingComplete ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-sm leading-tight ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                {task.due_date && (
                  <div className={`flex items-center text-xs gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                    {isOverdue ? <AlertCircle className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
                    {isOverdue ? `Terlambat · ${dateText}` : dateText}
                  </div>
                )}
                {project && (
                  <div className="flex items-center text-xs text-blue-500 gap-1">
                    <FolderKanban className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{project.title}</span>
                  </div>
                )}
                {goal && (
                  <div className="flex items-center text-xs text-purple-500 gap-1">
                    <Target className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{goal.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted -mr-1 -mt-0.5 text-muted-foreground shrink-0"
              aria-label="Opsi tugas"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => setTimeout(() => setIsEditDialogOpen(true), 100)}>
                Edit Tugas
              </DropdownMenuItem>
              {task.status !== TASK_STATUS.SEDANG_DIKERJAKAN && task.status !== TASK_STATUS.SELESAI && (
                <DropdownMenuItem onSelect={setInProgress} disabled={isChangingStatus}>
                  <Play className="mr-2 h-3.5 w-3.5 text-blue-500" />
                  Mulai Kerjakan
                </DropdownMenuItem>
              )}
              {task.status === TASK_STATUS.SEDANG_DIKERJAKAN && (
                <DropdownMenuItem onSelect={setOnHold} disabled={isChangingStatus}>
                  <Pause className="mr-2 h-3.5 w-3.5 text-orange-500" />
                  Tunda
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onSelect={() => setTimeout(() => setIsDeleteDialogOpen(true), 100)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-5 pt-1">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {task.priority && (
              <Badge
                variant="secondary"
                className={`${priorityConfig.className} text-[10px] px-1.5 py-0 font-medium`}
              >
                {priorityConfig.label}
              </Badge>
            )}
            {task.status && task.status !== TASK_STATUS.SELESAI && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                {STATUS_LABEL[task.status] ?? task.status}
              </Badge>
            )}
            {task.task_tags?.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="bg-muted/80 text-muted-foreground text-[10px] px-1.5 py-0">
                #{tag.tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <TaskForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projects={projects}
        goals={goals}
        initialData={{
          id: task.id,
          title: task.title,
          description: task.description || "",
          status: task.status as TaskStatus,
          priority: task.priority as TaskPriority,
          due_date: task.due_date || "",
          project_id: task.project_id || null,
          goal_id: task.goal_id || null,
          tags: task.task_tags?.map(t => t.tag) || [],
        }}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Tugas"
        description={`"${task.title}" akan dihapus secara permanen dan tidak dapat dikembalikan.`}
      />
    </>
  );
}
