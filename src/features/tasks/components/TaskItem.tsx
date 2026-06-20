"use client";

import { useState } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  CalendarIcon, MoreVertical, Trash, CheckCircle2, Circle, CircleDot,
  FolderKanban, Target, AlertCircle, Play,
} from "lucide-react";
import { TaskWithTags, TASK_STATUS, TASK_PRIORITY, TaskStatus, TaskPriority } from "../types/task.types";
import { deleteTaskAction, updateTaskStatusAction } from "../actions/task.actions";
import { TaskForm } from "./TaskForm";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Project } from "@/features/projects/types/project.types";
import { Goal } from "@/features/goals/types/goal.types";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  [TASK_PRIORITY.RENDAH]: { label: 'Rendah', className: 'bg-muted text-muted-foreground border border-border' },
  [TASK_PRIORITY.NORMAL]: { label: 'Normal', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  [TASK_PRIORITY.TINGGI]: { label: 'Tinggi', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' },
  [TASK_PRIORITY.KRITIS]: { label: 'Kritis', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' },
};

const STATUS_LABEL: Record<string, string> = {
  [TASK_STATUS.BELUM_DIMULAI]: 'Belum Dimulai',
  [TASK_STATUS.SEDANG_DIKERJAKAN]: 'Sedang Dikerjakan',
  [TASK_STATUS.SELESAI]: 'Selesai',
};

export function TaskItem({ task, projects = [], goals = [] }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority ?? ''] ?? PRIORITY_CONFIG[TASK_PRIORITY.NORMAL];

  const handleDelete = async () => {
    console.log("[TaskItem - Delete] handleDelete triggered for task ID:", task.id);
    const res = await deleteTaskAction(task.id);
    console.log("[TaskItem - Delete] Server Action response:", res);
  };

  const toggleComplete = async () => {
    console.log("[TaskItem - ToggleComplete] toggleComplete triggered for task ID:", task.id);
    setIsTogglingComplete(true);
    try {
      let newStatus: TaskStatus;
      if (task.status === TASK_STATUS.BELUM_DIMULAI) {
        newStatus = TASK_STATUS.SEDANG_DIKERJAKAN;
      } else if (task.status === TASK_STATUS.SEDANG_DIKERJAKAN) {
        newStatus = TASK_STATUS.SELESAI;
      } else {
        newStatus = TASK_STATUS.BELUM_DIMULAI;
      }
      console.log("[TaskItem - ToggleComplete] Changing status from", task.status, "to", newStatus);
      const res = await updateTaskStatusAction(task.id, newStatus);
      console.log("[TaskItem - ToggleComplete] Server Action response:", res);
    } catch (err) {
      console.error("[TaskItem - ToggleComplete] Error:", err);
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const changeStatus = async (newStatus: TaskStatus) => {
    console.log("[TaskItem - ChangeStatus] changeStatus triggered for task ID:", task.id, "newStatus:", newStatus);
    if (task.status === newStatus) return;
    setIsChangingStatus(true);
    try {
      const res = await updateTaskStatusAction(task.id, newStatus);
      console.log("[TaskItem - ChangeStatus] Server Action response:", res);
    } catch (err) {
      console.error("[TaskItem - ChangeStatus] Error:", err);
    } finally {
      setIsChangingStatus(false);
    }
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
        className={`glow-card relative rounded-2xl border transition-all duration-200 hover:border-primary/25 hover-border-primary ${
          isCompleted ? 'opacity-50 bg-muted/20' : 'bg-card'
        } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Complete toggle */}
            <button
              onClick={toggleComplete}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary transition-colors mt-0.5 shrink-0"
              aria-label={
                task.status === TASK_STATUS.BELUM_DIMULAI
                  ? 'Mulai kerjakan'
                  : task.status === TASK_STATUS.SEDANG_DIKERJAKAN
                  ? 'Tandai selesai'
                  : 'Kembalikan ke belum dimulai'
              }
            >
              {isTogglingComplete ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : task.status === TASK_STATUS.SELESAI ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : task.status === TASK_STATUS.SEDANG_DIKERJAKAN ? (
                <CircleDot className="h-5 w-5 text-blue-500" />
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
              <DropdownMenuItem onClick={() => {
                console.log("[TaskItem - Click] Edit Tugas clicked for task:", task.id);
                setTimeout(() => {
                  setIsEditDialogOpen(true);
                  console.log("[TaskItem - State] Set isEditDialogOpen to true");
                }, 100);
              }}>
                Edit Tugas
              </DropdownMenuItem>
              {task.status !== TASK_STATUS.SEDANG_DIKERJAKAN && (
                <DropdownMenuItem onClick={() => {
                  console.log("[TaskItem - Click] Mulai Kerjakan clicked for task:", task.id);
                  changeStatus(TASK_STATUS.SEDANG_DIKERJAKAN);
                }} disabled={isLoading}>
                  <Play className="mr-2 h-3.5 w-3.5 text-blue-500" />
                  Mulai Kerjakan
                </DropdownMenuItem>
              )}
              {task.status !== TASK_STATUS.SELESAI && (
                <DropdownMenuItem onClick={() => {
                  console.log("[TaskItem - Click] Tandai Selesai clicked for task:", task.id);
                  changeStatus(TASK_STATUS.SELESAI);
                }} disabled={isLoading}>
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                  Tandai Selesai
                </DropdownMenuItem>
              )}
              {task.status !== TASK_STATUS.BELUM_DIMULAI && (
                <DropdownMenuItem onClick={() => {
                  console.log("[TaskItem - Click] Belum Dimulai clicked for task:", task.id);
                  changeStatus(TASK_STATUS.BELUM_DIMULAI);
                }} disabled={isLoading}>
                  <Circle className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Belum Dimulai
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={() => {
                  console.log("[TaskItem - Click] Hapus clicked for task:", task.id);
                  setTimeout(() => {
                    setIsDeleteDialogOpen(true);
                    console.log("[TaskItem - State] Set isDeleteDialogOpen to true");
                  }, 100);
                }}
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
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${priorityConfig.className}`}>
                {priorityConfig.label}
              </span>
            )}
            {task.status && task.status !== TASK_STATUS.SELESAI && (
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">
                {STATUS_LABEL[task.status] ?? task.status}
              </span>
            )}
            {task.task_tags?.map((tag) => (
              <span key={tag.id} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-primary/8 text-primary/80 border border-primary/15">
                #{tag.tag}
              </span>
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
