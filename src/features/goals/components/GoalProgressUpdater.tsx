"use client";

import { useState } from "react";
import { updateGoalAction } from "../actions/goal.actions";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoalProgressUpdaterProps {
  goalId: string;
  initialProgress: number;
}

export function GoalProgressUpdater({ goalId, initialProgress }: GoalProgressUpdaterProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = async (value: number) => {
    setIsUpdating(true);
    const result = await updateGoalAction(goalId, { progress: value });
    setIsUpdating(false);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Progres Pencapaian
        </h3>
        <div className="flex items-center gap-3">
          {showSuccess && <span className="text-xs text-emerald-600 font-medium animate-in fade-in flex items-center"><Check className="w-3 h-3 mr-1" /> Tersimpan</span>}
          <span className="text-2xl font-bold text-emerald-600">{progress}%</span>
        </div>
      </div>
      
      <div className="group relative py-2">
        <Progress value={progress} className="h-4 bg-slate-100" />
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          onMouseUp={() => handleUpdate(progress)}
          onTouchEnd={() => handleUpdate(progress)}
          disabled={isUpdating}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Geser untuk mengubah progress"
        />
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center group-hover:text-slate-500 transition-colors">
        Geser bar di atas untuk memperbarui progres secara cepat.
      </p>
    </div>
  );
}
