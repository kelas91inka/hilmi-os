"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, MoreVertical, Trash, Eye, Target } from "lucide-react";
import { Goal } from "../types/goal.types";
import { deleteGoalAction } from "../actions/goal.actions";
import { GoalForm } from "./GoalForm";
import { DeleteConfirmDialog } from "@/features/tasks/components/DeleteConfirmDialog";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Aktif", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
    completed: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
    archived: { label: "Diarsipkan", className: "bg-muted text-muted-foreground border border-border" },
  };

  const typeLabels: Record<string, string> = {
    mingguan: "Mingguan",
    bulanan: "Bulanan",
    tahunan: "Tahunan",
    lifetime: "Lifetime",
  };

  const handleDelete = async () => {
    console.log("[GoalCard - Delete] handleDelete triggered for goal ID:", goal.id);
    const res = await deleteGoalAction(goal.id);
    console.log("[GoalCard - Delete] Server Action response:", res);
  };

  const currentStatus = statusConfig[goal.status] || statusConfig.active;

  return (
    <>
      <Card className="glow-card relative flex flex-col rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/25 hover-border-primary group overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/portal/goals/${goal.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                {goal.title}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-1.5 gap-2">
              {goal.target_date && (
                <div className="flex items-center mr-2">
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  Target: {format(new Date(goal.target_date), "dd MMM yyyy")}
                </div>
              )}
              <Badge variant="outline" className="font-medium text-[10px] py-0 px-1.5 h-5 shrink-0">
                {typeLabels[goal.goal_type] || goal.goal_type}
              </Badge>
              {goal.category && (
                <Badge variant="secondary" className="font-medium text-[10px] py-0 px-1.5 h-5 shrink-0 bg-primary/10 text-primary border-transparent dark:bg-primary/20">
                  {goal.category}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors -mr-1">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                console.log("[GoalCard - Click] Lihat Detail clicked for goal:", goal.id);
                router.push(`/portal/goals/${goal.id}`);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log("[GoalCard - Click] Edit Tujuan clicked for goal:", goal.id);
                setTimeout(() => {
                  setIsEditDialogOpen(true);
                  console.log("[GoalCard - State] Set isEditDialogOpen to true");
                }, 100);
              }}>
                Edit Tujuan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={() => {
                  console.log("[GoalCard - Click] Hapus clicked for goal:", goal.id);
                  setTimeout(() => {
                    setIsDeleteDialogOpen(true);
                    console.log("[GoalCard - State] Set isDeleteDialogOpen to true");
                  }, 100);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-between">
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-4">
            {goal.description || <span className="italic opacity-60">Tidak ada deskripsi</span>}
          </p>
          
          <div className="space-y-4 mt-auto">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progres</span>
                <span className={`font-semibold ${
                  goal.progress >= 80 ? 'text-emerald-500' :
                  goal.progress >= 50 ? 'text-primary' : 'text-amber-500'
                }`}>{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="w-full flex-col gap-0">
                <ProgressTrack className="h-1.5 rounded-full">
                  <ProgressIndicator className={
                    goal.progress >= 80 ? 'bg-emerald-500' :
                    goal.progress >= 50 ? 'bg-primary' : 'bg-amber-500'
                  } />
                </ProgressTrack>
              </Progress>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              {goal.status && (
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${currentStatus.className}`}>
                  {currentStatus.label}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <GoalForm 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={{
          id: goal.id,
          title: goal.title,
          description: goal.description || "",
          status: goal.status,
          goal_type: goal.goal_type,
          target_date: goal.target_date ? goal.target_date.split('T')[0] : "",
          progress: goal.progress,
          category: goal.category || "",
        }} 
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Tujuan"
        description={`"${goal.title}" dan semua milestone di dalamnya akan ikut terhapus secara permanen.`}
      />
    </>
  );
}
