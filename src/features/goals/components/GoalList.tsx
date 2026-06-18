"use client";

import { Goal } from "../types/goal.types";
import { GoalCard } from "./GoalCard";
import { Target } from "lucide-react";

interface GoalListProps {
  goals: Goal[];
  emptyMessage?: string;
}

export function GoalList({ goals, emptyMessage = "Belum ada goal." }: GoalListProps) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
        <Target className="h-10 w-10 mb-4 text-slate-300" />
        <p className="text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
