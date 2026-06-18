export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
  stats: HabitStats;
}
