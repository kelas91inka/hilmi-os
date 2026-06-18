/* eslint-disable */
// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { AIConversation, AIMessage } from '../types/ai.types';

export const aiRepository = {
  async getConversations(): Promise<AIConversation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(msg => ({ ...msg, role: msg.role as any }));
  },

  async getConversationById(id: string): Promise<AIConversation | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  async createConversation(title: string): Promise<AIConversation> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ title, user_id: user.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getMessages(conversationId: string): Promise<AIMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async saveMessage(conversationId: string, role: string, content: string): Promise<AIMessage> {
    const supabase = await createClient();
    
    // Also update conversation updated_at
    await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    const { data, error } = await supabase
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Context Fetchers for AI Function Calling
  async getActiveTasks() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, project_id, goal_id')
      .neq('status', 'selesai')
      .order('due_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getWeeklyTasks() {
    const supabase = await createClient();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, completed_at')
      .gte('created_at', lastWeek.toISOString());
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getActiveProjects() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, status, start_date, end_date')
      .eq('status', 'active');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getGoalsProgress() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .select('id, title, status, progress, target_date');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getRecentDiary() {
    const supabase = await createClient();
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, title, mood, entry_date, content')
      .gte('entry_date', lastMonth.toISOString())
      .order('entry_date', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getNotes() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, excerpt, is_favorite, updated_at')
      .order('updated_at', { ascending: false })
      .limit(15);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getHabitStats() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('habits')
      .select('id, title, target_frequency, active')
      .eq('active', true);
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Action Generators for Voice Commands
  async createTask(title: string, description?: string, priority: string = 'normal', due_date?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        status: 'belum_dimulai',
        due_date
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async createDiaryEntry(content: string, mood: string = 'neutral') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        content,
        mood,
        entry_date: today,
        title: 'Catatan Cepat (AI)'
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
};
