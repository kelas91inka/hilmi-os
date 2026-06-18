import { createClient } from '@/lib/supabase/server';
import { Habit, HabitLog } from '../types/habit.types';
import { HabitFormData } from '../validators/habit.schema';

export const habitRepository = {
  async getHabits(): Promise<Habit[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Habit[];
  },

  async getHabitById(id: string): Promise<Habit | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Habit;
  },

  async getLogsForHabits(habitIds: string[], startDate: string, endDate: string): Promise<HabitLog[]> {
    if (habitIds.length === 0) return [];
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habitIds)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate)
      .order('completed_date', { ascending: false });

    if (error) throw error;
    return data as HabitLog[];
  },

  async getAllLogsForHabit(habitId: string): Promise<HabitLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('completed_date', { ascending: false });

    if (error) throw error;
    return data as HabitLog[];
  },

  async createHabit(data: HabitFormData): Promise<Habit> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: newHabit, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return newHabit as Habit;
  },

  async updateHabit(id: string, data: Partial<HabitFormData>): Promise<Habit> {
    const supabase = await createClient();
    const { data: updatedHabit, error } = await supabase
      .from('habits')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedHabit as Habit;
  },

  async deleteHabit(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleHabitLog(habitId: string, date: string): Promise<void> {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('completed_date', date)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          completed_date: date,
        });
      if (error) throw error;
    }
  }
};
