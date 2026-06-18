"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import { GoalMilestone } from "../types/goal.types";
import { updateMilestoneAction, deleteMilestoneAction } from "../actions/goal.actions";
import { MilestoneForm } from "./MilestoneForm";
import { DeleteConfirmDialog } from "@/features/tasks/components/DeleteConfirmDialog";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MilestoneListProps {
  goalId: string;
  milestones: GoalMilestone[];
}

export function MilestoneList({ goalId, milestones }: MilestoneListProps) {
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<{id: string, title: string} | null>(null);

  const toggleMilestone = async (milestone: GoalMilestone) => {
    const isCompleted = !milestone.completed;
    const completedAt = isCompleted ? new Date().toISOString() : null;
    
    await updateMilestoneAction(milestone.id, { 
      completed: isCompleted,
      completed_at: completedAt
    }, goalId);
  };

  const confirmDelete = async () => {
    if (!deletingMilestone) return;
    await deleteMilestoneAction(deletingMilestone.id, goalId);
    setDeletingMilestone(null);
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center p-8 bg-card border-2 border-dashed rounded-xl text-muted-foreground">
        Belum ada milestone untuk tujuan ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((milestone) => (
        <Card key={milestone.id} className={`transition-all duration-300 ${milestone.completed ? 'bg-slate-50/50 dark:bg-slate-900/50 scale-[0.99] opacity-75 hover:opacity-100' : 'bg-white dark:bg-slate-950 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}`}>
          <CardContent className="p-4 flex items-start gap-4">
            <button 
              onClick={() => toggleMilestone(milestone)}
              className={`mt-0.5 shrink-0 transition-all duration-300 hover:scale-110 ${milestone.completed ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
            >
              {milestone.completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
            
            <div className={`flex-1 min-w-0 transition-all duration-300`}>
              <h4 className={`font-medium text-base transition-colors ${milestone.completed ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                {milestone.title}
              </h4>
              
              {milestone.description && (
                <p className={`text-sm mt-1 transition-colors ${milestone.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{milestone.description}</p>
              )}
              
              {milestone.completed && milestone.completed_at && (
                <p className="text-[11px] font-medium text-emerald-600/70 mt-2">
                  Selesai pada {format(new Date(milestone.completed_at), "dd MMM yyyy HH:mm")}
                </p>
              )}
            </div>

            <div className="flex gap-1 shrink-0 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 group-hover:opacity-100" style={{ opacity: 1 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={() => setEditingMilestoneId(milestone.id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setDeletingMilestone({ id: milestone.id, title: milestone.title })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>

          {/* Edit Dialog */}
          {editingMilestoneId === milestone.id && (
            <MilestoneForm
              goalId={goalId}
              open={true}
              onOpenChange={(open) => !open && setEditingMilestoneId(null)}
              initialData={{
                id: milestone.id,
                title: milestone.title,
                description: milestone.description || "",
                completed: milestone.completed,
                completed_at: milestone.completed_at || "",
              }}
            />
          )}
        </Card>
      ))}

      <DeleteConfirmDialog
        open={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={confirmDelete}
        title="Hapus Milestone"
        description={`Apakah Anda yakin ingin menghapus milestone "${deletingMilestone?.title}"?`}
      />
    </div>
  );
}
