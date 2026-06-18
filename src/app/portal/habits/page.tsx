import { Metadata } from 'next';
import { habitService } from '@/features/habits/services/habit.service';
import { HabitTrackerGrid } from '@/features/habits/components/HabitTrackerGrid';
import { HabitFormDialog } from '@/features/habits/components/HabitFormDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Repeat } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Kebiasaan | Hilmi OS',
  description: 'Lacak kebiasaan harian dan bangun konsistensi',
};

export default async function HabitsPage() {
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), 14), 'yyyy-MM-dd'); // Show last 14 days in grid

  const habits = await habitService.getHabitsWithRecentLogs(startDate, endDate);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Repeat className="w-8 h-8 text-primary" />
            Pelacak Kebiasaan
          </h2>
          <p className="text-muted-foreground mt-1">
            Bangun konsistensi melalui pelacakan harian.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <HabitFormDialog />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
          <Repeat className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Kebiasaan</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">Mulai bangun konsistensi dengan membuat kebiasaan pertamamu hari ini.</p>
          <HabitFormDialog />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pelacakan Harian (14 Hari Terakhir)</h3>
              <HabitTrackerGrid habits={habits} daysCount={14} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
