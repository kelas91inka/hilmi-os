import { createClient } from '@/lib/supabase/server';
import { DiaryEntry, DiaryEntryWithDetails } from '../types/diary.types';
import { DiaryEntryFormData } from '../validators/diary.schema';

export const diaryRepository = {
  async getEntries(): Promise<DiaryEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .limit(100); // Reasonable limit for MVP

    if (error) throw error;
    return (data || []) as DiaryEntry[];
  },

  async getEntryByDate(date: string): Promise<DiaryEntryWithDetails | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('diary_entries')
      .select('*, links:diary_links(*)')
      .eq('user_id', user.id)
      .eq('entry_date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as unknown as DiaryEntryWithDetails;
  },

  async upsertEntry(entry: DiaryEntryFormData): Promise<DiaryEntry> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if exists
    const existing = await this.getEntryByDate(entry.entry_date);

    if (existing) {
      const { data, error } = await supabase
        .from('diary_entries')
        .update({
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
        })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as DiaryEntry;
    } else {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user.id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          entry_date: entry.entry_date,
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as DiaryEntry;
    }
  },

  async deleteEntry(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
