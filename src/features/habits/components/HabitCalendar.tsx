"use client";

import { Calendar } from "@/components/ui/calendar";
import { parseISO } from "date-fns";

interface HabitCalendarProps {
  completedDates: string[]; // Array of YYYY-MM-DD
}

export function HabitCalendar({ completedDates }: HabitCalendarProps) {
  const dates = completedDates.map(d => parseISO(d));

  return (
    <div className="border dark:border-slate-800 rounded-lg bg-card shadow-sm inline-block p-4">
      <Calendar
        mode="multiple"
        selected={dates}
        className="rounded-md"
        classNames={{
          selected:
            "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white",
        }}
      />
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
        <span>Hari diselesaikan</span>
      </div>
    </div>
  );
}
