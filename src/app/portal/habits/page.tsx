import { Metadata } from 'next';
import { habitService } from '@/features/habits/services/habit.service';
import { HabitsClient } from '@/features/habits/components/HabitsClient';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';
import { Repeat } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Kebiasaan | Hilmi OS',
  description: 'Lacak kebiasaan harian dan bangun konsistensi',
};

export default async function HabitsPage() {
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd'); // Fetch last 30 days in grid

  const habits = await habitService.getHabitsWithRecentLogs(startDate, endDate);

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto">
      <PageContextSetter context="Pelacak Kebiasaan" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Repeat className="w-7 h-7 text-primary" />
            Pelacak Kebiasaan
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Bangun konsistensi melalui pelacakan harian dan mingguan.
          </p>
        </div>
      </div>

      <HabitsClient initialHabits={habits} daysCount={30} />
    </div>
  );
}


