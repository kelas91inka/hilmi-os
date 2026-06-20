'use client';

import { useState } from 'react';
import { HabitWithLogs } from '../types/habit.types';
import { toggleHabitLogAction, createHabitAction } from '../actions/habit.actions';
import { format, subDays, isSameDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HabitFormDialog } from './HabitFormDialog';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import { deleteHabitAction } from '../actions/habit.actions';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Trash2,
  Edit,
  Copy,
  MoreVertical,
  Loader2,
  Check
} from 'lucide-react';

interface HabitCardProps {
  habit: HabitWithLogs;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [loadingDates, setLoadingDates] = useState<Record<string, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const isCompletedToday = habit.logs.some(log => log.completed_date === todayStr);

  // Generate last 7 days in chronological order (oldest to newest/today)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

  const handleToggleDate = async (dateString: string) => {
    setLoadingDates(prev => ({ ...prev, [dateString]: true }));
    try {
      await toggleHabitLogAction(habit.id, dateString);
    } catch (error) {
      console.error('Error toggling habit log:', error);
    } finally {
      setLoadingDates(prev => ({ ...prev, [dateString]: false }));
    }
  };

  const handleDuplicate = async () => {
    console.log("[HabitCard - Duplicate] handleDuplicate triggered for habit ID:", habit.id);
    setIsDuplicating(true);
    try {
      const res = await createHabitAction({
        title: `${habit.title} (Salinan)`,
        description: habit.description || '',
        target_frequency: habit.target_frequency,
        active: habit.active,
      });
      console.log("[HabitCard - Duplicate] Server Action response:", res);
    } catch (error) {
      console.error("[HabitCard - Duplicate] Error:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    console.log("[HabitCard - Delete] handleDelete triggered for habit ID:", habit.id);
    try {
      const res = await deleteHabitAction(habit.id);
      console.log("[HabitCard - Delete] Server Action response:", res);
    } catch (error) {
      console.error("[HabitCard - Delete] Error:", error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "glow-card group rounded-2xl border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
          isCompletedToday
            ? "border-emerald-500/25 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/5 dark:border-emerald-500/20"
            : "border-border hover:border-slate-400 dark:hover:border-slate-800"
        )}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          
          {/* Header & Quick Action */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn(
                  "text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md",
                  habit.target_frequency === 'daily' 
                    ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400" 
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}>
                  {habit.target_frequency === 'daily' ? 'Harian' : 'Mingguan'}
                </span>
                {!habit.active && (
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    Nonaktif
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-1">
                {habit.title}
              </h4>
              {habit.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {habit.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Today's Toggle Button */}
              <button
                onClick={() => handleToggleDate(todayStr)}
                disabled={loadingDates[todayStr]}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                  isCompletedToday
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10"
                    : "bg-[#0A0A0B]/40 border-border text-muted-foreground hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-600"
                )}
                title="Tandai selesai hari ini"
              >
                {loadingDates[todayStr] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCompletedToday ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 opacity-45 group-hover:opacity-100" />
                )}
              </button>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="w-8 h-8 rounded-xl flex items-center justify-center border border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem onClick={() => {
                    console.log("[HabitCard - Click] Edit clicked for habit:", habit.id);
                    setTimeout(() => {
                      setIsEditDialogOpen(true);
                      console.log("[HabitCard - State] Set isEditDialogOpen to true");
                    }, 100);
                  }} className="cursor-pointer text-xs">
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    console.log("[HabitCard - Click] Duplikasi clicked for habit:", habit.id);
                    handleDuplicate();
                  }} disabled={isDuplicating} className="cursor-pointer text-xs">
                    {isDuplicating ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-2" />
                    )}
                    Duplikasi
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log("[HabitCard - Click] Hapus clicked for habit:", habit.id);
                      setShowDeleteConfirm(true);
                      console.log("[HabitCard - State] Set showDeleteConfirm to true");
                    }} 
                    className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 7-Day Interactive Trackers */}
          <div className="bg-[#0A0A0B]/25 dark:bg-[#0A0A0B]/35 border border-border/40 p-3 rounded-2xl">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Riwayat 7 Hari</p>
            <div className="flex items-center justify-between gap-1">
              {last7Days.map((day) => {
                const dateString = format(day, 'yyyy-MM-dd');
                const isCompleted = habit.logs.some(log => log.completed_date === dateString);
                const isTodayCell = isSameDay(day, today);
                const isLoading = loadingDates[dateString];

                return (
                  <div key={dateString} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                      {isTodayCell ? 'Hari Ini' : format(day, 'E', { locale: localeId }).substring(0, 2)}
                    </span>
                    <button
                      onClick={() => handleToggleDate(dateString)}
                      disabled={isLoading}
                      className={cn(
                        "w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all relative border",
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10 hover:bg-emerald-600"
                          : "bg-muted/40 border-border/70 text-muted-foreground/70 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-600",
                        isTodayCell && !isCompleted && "border-primary/40 ring-1 ring-primary/20"
                      )}
                      title={`${format(day, 'EEEE, d MMMM yyyy', { locale: localeId })} - ${isCompleted ? 'Selesai' : 'Belum selesai'}`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        format(day, 'd')
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary Footer */}
          <div className="grid grid-cols-3 gap-1 bg-[#0A0A0B]/20 p-2 rounded-xl border border-border/30 text-center text-xs">
            <div>
              <div className="text-[8px] uppercase font-bold text-muted-foreground">Streak</div>
              <div className="font-mono font-extrabold text-orange-500 mt-0.5 flex items-center justify-center gap-0.5 text-xs">
                <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                <span>{habit.stats.currentStreak}h</span>
              </div>
            </div>
            <div>
              <div className="text-[8px] uppercase font-bold text-muted-foreground">Rekor</div>
              <div className="font-mono font-extrabold text-indigo-500 dark:text-indigo-400 mt-0.5 flex items-center justify-center gap-0.5 text-xs">
                <Trophy className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>{habit.stats.bestStreak}h</span>
              </div>
            </div>
            <div>
              <div className="text-[8px] uppercase font-bold text-muted-foreground">Total</div>
              <div className="font-mono font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-0.5 text-xs">
                <CheckCircle2 className="w-3 h-3 text-slate-600 dark:text-slate-400 shrink-0" />
                <span>{habit.stats.totalCompletions}x</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Kebiasaan"
        description={`Apakah Anda yakin ingin menghapus kebiasaan "${habit.title}"? Semua riwayat log penyelesaian untuk kebiasaan ini juga akan dihapus secara permanen.`}
      />

      <HabitFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={habit}
      />
    </>
  );
}
