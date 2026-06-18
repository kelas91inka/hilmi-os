import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitStats } from '../types/habit.types';
import { Flame, Trophy, CheckCircle2 } from 'lucide-react';

interface HabitStatsCardProps {
  stats: HabitStats;
}

export function HabitStatsCard({ stats }: HabitStatsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="transition-all hover:shadow-sm hover:border-primary/40 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.currentStreak} days</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep the fire burning!
          </p>
        </CardContent>
      </Card>
      
      <Card className="transition-all hover:shadow-sm hover:border-primary/40 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Streak</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.bestStreak} days</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your longest consecutive run.
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-sm hover:border-primary/40 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Completions</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCompletions}</div>
          <p className="text-xs text-muted-foreground">
            Total times you completed this habit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
