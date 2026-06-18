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
import { Progress } from "@/components/ui/progress";
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
    active: { label: "Aktif", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent" },
    completed: { label: "Selesai", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent" },
    archived: { label: "Diarsipkan", className: "bg-slate-800/15 text-slate-900 dark:text-slate-300 border-transparent" },
  };

  const typeLabels: Record<string, string> = {
    mingguan: "Mingguan",
    bulanan: "Bulanan",
    tahunan: "Tahunan",
    lifetime: "Lifetime",
  };

  const handleDelete = async () => {
    await deleteGoalAction(goal.id);
  };

  const currentStatus = statusConfig[goal.status] || statusConfig.active;

  return (
    <>
      <Card className="relative flex flex-col transition-all hover:shadow-sm hover:border-primary/40 group overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/portal/goals/${goal.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500 shrink-0" />
                {goal.title}
              </h3>
            </Link>
            <div className="flex items-center text-xs text-slate-500 mt-1.5 gap-4">
              {goal.target_date && (
                <div className="flex items-center">
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  Target: {format(new Date(goal.target_date), "dd MMM yyyy")}
                </div>
              )}
              <Badge variant="outline" className="font-medium text-[10px] py-0 px-1.5 h-5">
                {typeLabels[goal.goal_type] || goal.goal_type}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors -mr-1">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/portal/goals/${goal.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeout(() => setIsEditDialogOpen(true), 100)}>
                Edit Tujuan
              </DropdownMenuItem>
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
        
        <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 mb-4">
            {goal.description || <span className="italic opacity-60">Tidak ada deskripsi</span>}
          </p>
          
          <div className="space-y-3 mt-auto">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Progres</span>
                <span className="font-bold">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-1.5" />
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              {goal.status && (
                <Badge variant="secondary" className={`${currentStatus.className} text-[10px] px-2 py-0.5 font-medium`}>
                  {currentStatus.label}
                </Badge>
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
