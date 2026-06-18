"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import { id } from "date-fns/locale";

interface MonthNavigatorProps {
  currentYear: number;
  currentMonth: number;
}

export function MonthNavigator({ currentYear, currentMonth }: MonthNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigate = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth.toString());
    params.set("year", newYear.toString());

    router.push(`/portal/finance?${params.toString()}`);
  };

  const handleResetToCurrent = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("month");
    params.delete("year");
    router.push(`/portal/finance?${params.toString()}`);
  };

  const isCurrentMonth = 
    currentMonth === new Date().getMonth() + 1 && 
    currentYear === new Date().getFullYear();

  // Create a date object to format the month name nicely
  const displayDate = setYear(setMonth(new Date(), currentMonth - 1), currentYear);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-md p-1 shadow-sm">
      <Button variant="ghost" size="icon" onClick={() => handleNavigate(-1)} className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div 
        className="flex items-center justify-center min-w-[140px] gap-2 font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
        onClick={!isCurrentMonth ? handleResetToCurrent : undefined}
        title={!isCurrentMonth ? "Kembali ke bulan ini" : undefined}
      >
        <CalendarIcon className="w-4 h-4 text-emerald-500" />
        {format(displayDate, "MMMM yyyy", { locale: id })}
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleNavigate(1)} 
        disabled={isCurrentMonth}
        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
