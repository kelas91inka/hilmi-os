import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { habitService } from '@/features/habits/services/habit.service';
import { HabitStatsCard } from '@/features/habits/components/HabitStatsCard';
import { HabitFormDialog } from '@/features/habits/components/HabitFormDialog';
import { DeleteHabitButton } from '@/features/habits/components/DeleteHabitButton';
import { HabitCalendar } from '@/features/habits/components/HabitCalendar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const habit = await habitService.getHabitWithDetails(id);
  
  return {
    title: habit ? `${habit.title} - Habits | Hilmi OS` : 'Habit Not Found',
  };
}

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await habitService.getHabitWithDetails(id);

  if (!habit) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <Link href="/portal/habits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {habit.title}
            </h2>
            {habit.description && (
              <p className="text-muted-foreground">
                {habit.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <HabitFormDialog 
            initialData={habit} 
            trigger={
              <Button variant="outline" size="sm" className="dark:border-slate-800 dark:hover:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            } 
          />
          <DeleteHabitButton habitId={habit.id} habitTitle={habit.title} />
        </div>
      </div>

      <HabitStatsCard stats={habit.stats} />

      <div className="rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <CalendarIcon className="w-5 h-5 text-emerald-500" />
          Riwayat Penyelesaian
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <HabitCalendar completedDates={habit.logs.map(log => log.completed_date)} />
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border dark:border-slate-800 flex-1 w-full text-center md:text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Total hari diselesaikan</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{habit.logs.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Membangun konsistensi butuh waktu. Setiap progres kecil sangat berarti!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
