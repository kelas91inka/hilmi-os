import { habitRepository } from '../repositories/habit.repository';
import { habitSchema } from '../validators/habit.schema';
import { HabitLog, HabitStats, HabitWithLogs } from '../types/habit.types';
import { differenceInDays, parseISO, isToday, isYesterday } from 'date-fns';

function calculateStats(logs: HabitLog[]): HabitStats {
  if (logs.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
  }

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime()
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let previousDate: Date | null = null;
  let isCurrentStreakActive = true;

  for (let i = 0; i < sortedLogs.length; i++) {
    const currentDate = parseISO(sortedLogs[i].completed_date);

    if (i === 0) {
      tempStreak = 1;
      if (!isToday(currentDate) && !isYesterday(currentDate)) {
        isCurrentStreakActive = false;
      }
    } else if (previousDate) {
      const diff = differenceInDays(previousDate, currentDate);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        if (isCurrentStreakActive) {
          currentStreak = tempStreak;
          isCurrentStreakActive = false;
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }

    previousDate = currentDate;
  }

  if (isCurrentStreakActive) {
    currentStreak = tempStreak;
  }
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }

  return {
    currentStreak,
    bestStreak,
    totalCompletions: sortedLogs.length,
  };
}

export const habitService = {
  async getHabitsWithRecentLogs(startDate: string, endDate: string): Promise<HabitWithLogs[]> {
    const habits = await habitRepository.getHabits();
    if (habits.length === 0) return [];

    const habitIds = habits.map(h => h.id);
    
    // To calculate accurate streaks, we really need all logs for these habits, not just recent
    // But for performance MVP, if we want global accurate stats, we should fetch all logs per habit.
    // Let's fetch all logs for all habits since it's a single owner system.
    const allLogs = await habitRepository.getLogsForHabits(habitIds, '1970-01-01', endDate);

    return habits.map(habit => {
      const habitLogs = allLogs.filter(log => log.habit_id === habit.id);
      return {
        ...habit,
        logs: habitLogs,
        stats: calculateStats(habitLogs),
      };
    });
  },

  async getHabitWithDetails(id: string): Promise<HabitWithLogs | null> {
    const habit = await habitRepository.getHabitById(id);
    if (!habit) return null;

    const logs = await habitRepository.getAllLogsForHabit(id);
    
    return {
      ...habit,
      logs,
      stats: calculateStats(logs),
    };
  },

  async createHabit(data: unknown) {
    const validated = habitSchema.parse(data);
    return habitRepository.createHabit(validated);
  },

  async updateHabit(id: string, data: unknown) {
    const validated = habitSchema.partial().parse(data);
    return habitRepository.updateHabit(id, validated);
  },

  async deleteHabit(id: string) {
    return habitRepository.deleteHabit(id);
  },

  async toggleHabitLog(habitId: string, date: string) {
    return habitRepository.toggleHabitLog(habitId, date);
  }
};
