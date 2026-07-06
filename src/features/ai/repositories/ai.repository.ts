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

    // Duplicate prevention: check if a conversation with the same title was created within the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
    const { data: existing } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('title', title)
      .gte('created_at', thirtySecondsAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0];
    }

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
    
    if (error) {
      throw new Error(error.message);
    }
    const messages = data || [];
    return messages;
  },

  async saveMessage(conversationId: string, role: string, content: string, messageData?: any): Promise<AIMessage> {
    const supabase = await createClient();
    // Duplicate prevention: only check if content is non-empty (empty content like tool-calls would match everything with LIKE ''%)
    if (content && content.trim()) {
      const contentHash = content.substring(0, 200);
      const threeSecondsAgo = new Date(Date.now() - 3000).toISOString();
      
      const { data: existing } = await supabase
        .from('ai_messages')
        .select('id, message_data')
        .eq('conversation_id', conversationId)
        .eq('role', role)
        .like('content', `${contentHash}%`)
        .gte('created_at', threeSecondsAgo)
        .limit(1);
      
      if (existing && existing.length > 0) {
        // If the new call has messageData but the existing one doesn't, update it!
        if (messageData && !existing[0].message_data) {
          const { data: updatedMsg } = await supabase
            .from('ai_messages')
            .update({ message_data: typeof messageData === 'string' ? messageData : JSON.stringify(messageData) })
            .eq('id', existing[0].id)
            .select()
            .single();
          if (updatedMsg) return updatedMsg;
        }

        // Return existing message instead of creating duplicate
        const { data: existingMsg } = await supabase
          .from('ai_messages')
          .select('*')
          .eq('id', existing[0].id)
          .single();
        if (existingMsg) return existingMsg;
      }
    }

    // Also update conversation updated_at
    await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    const insertData: any = { conversation_id: conversationId, role, content };
    if (messageData) {
      insertData.message_data = typeof messageData === 'string' ? messageData : JSON.stringify(messageData);
    }

    const { data, error } = await supabase
      .from('ai_messages')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    
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
  },

  async getFinanceSummary() {
    const supabase = await createClient();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('finance_transactions')
      .select('type, amount, category, description, transaction_date')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: false });
    if (error) throw new Error(error.message);

    const transactions = data || [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome,
      totalExpense,
      netBalance,
      topExpenseCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
      recentTransactions: transactions.slice(0, 5),
    };
  },

  async createGoal(title: string, description?: string, goal_type: string = 'bulanan', target_date?: string, category?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title,
        description,
        goal_type,
        status: 'active',
        progress: 0,
        target_date,
        category,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateTaskStatus(taskId: string, status: string) {
    const supabase = await createClient();
    const updateData: Record<string, string | null> = { status };
    if (status === 'selesai') updateData.completed_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getAchievements() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('achievements')
      .select('id, title, description, category, achievement_date')
      .order('achievement_date', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getDashboardInsight() {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const [tasksRes, goalsRes, habitsRes, projectsRes] = await Promise.all([
      supabase.from('tasks').select('id, status, priority, due_date').neq('status', 'selesai'),
      supabase.from('goals').select('id, title, status, progress, target_date').eq('status', 'active'),
      supabase.from('habits').select('id, title, active').eq('active', true),
      supabase.from('projects').select('id, title, status').eq('status', 'active'),
    ]);

    const overdueTasks = (tasksRes.data || []).filter(t => t.due_date && t.due_date < today);
    const criticalTasks = (tasksRes.data || []).filter(t => t.priority === 'kritis');
    const lowProgressGoals = (goalsRes.data || []).filter(g => (g.progress || 0) < 30);

    return {
      totalActiveTasks: tasksRes.data?.length || 0,
      overdueTasks: overdueTasks.length,
      criticalTasks: criticalTasks.length,
      activeGoals: goalsRes.data?.length || 0,
      lowProgressGoals: lowProgressGoals.map(g => g.title),
      activeHabits: habitsRes.data?.length || 0,
      activeProjects: projectsRes.data?.length || 0,
    };
  },

  async getWeeklyInsight() {
    const supabase = await createClient();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    const [tasksCompleted, tasksCreated, financeRes, diaryRes, goalsRes, habitsRes] = await Promise.all([
      supabase.from('tasks').select('id, title, completed_at').eq('status', 'selesai').gte('completed_at', weekAgoISO),
      supabase.from('tasks').select('id, title, status, priority').gte('created_at', weekAgoISO),
      supabase.from('finance_transactions').select('type, amount, category, description').gte('transaction_date', weekAgo.toISOString().split('T')[0]),
      supabase.from('diary_entries').select('id, mood, entry_date').gte('entry_date', weekAgo.toISOString().split('T')[0]).order('entry_date', { ascending: false }),
      supabase.from('goals').select('id, title, progress, status').eq('status', 'active'),
      supabase.from('habits').select('id, title, active').eq('active', true),
    ]);

    const transactions = financeRes.data || [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const moodCounts: Record<string, number> = {};
    (diaryRes.data || []).forEach(d => {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      period: 'weekly',
      tasksCompleted: tasksCompleted.data?.length || 0,
      tasksCreated: tasksCreated.data?.length || 0,
      finance: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, transactionCount: transactions.length },
      diaryEntries: diaryRes.data?.length || 0,
      dominantMood: dominantMood ? dominantMood[0] : null,
      activeGoals: goalsRes.data?.length || 0,
      avgGoalProgress: goalsRes.data?.length
        ? Math.round((goalsRes.data || []).reduce((s, g) => s + (g.progress || 0), 0) / goalsRes.data.length)
        : 0,
      activeHabits: habitsRes.data?.length || 0,
    };
  },

  async getMonthlyInsight() {
    const supabase = await createClient();
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthAgoISO = monthAgo.toISOString();
    const monthAgoDate = monthAgo.toISOString().split('T')[0];

    const [tasksCompleted, financeRes, diaryRes, goalsRes, projectsRes, achievementsRes] = await Promise.all([
      supabase.from('tasks').select('id, title, completed_at').eq('status', 'selesai').gte('completed_at', monthAgoISO),
      supabase.from('finance_transactions').select('type, amount, category').gte('transaction_date', monthAgoDate),
      supabase.from('diary_entries').select('id, mood, entry_date').gte('entry_date', monthAgoDate),
      supabase.from('goals').select('id, title, progress, status').eq('status', 'active'),
      supabase.from('projects').select('id, title, status').eq('status', 'active'),
      supabase.from('achievements').select('id, title, category').gte('achievement_date', monthAgoDate),
    ]);

    const transactions = financeRes.data || [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category || 'Lainnya'] = (byCategory[t.category || 'Lainnya'] || 0) + Number(t.amount);
    });
    const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      period: 'monthly',
      tasksCompleted: tasksCompleted.data?.length || 0,
      finance: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, topCategories },
      diaryEntries: diaryRes.data?.length || 0,
      activeGoals: goalsRes.data?.length || 0,
      avgGoalProgress: goalsRes.data?.length
        ? Math.round((goalsRes.data || []).reduce((s, g) => s + (g.progress || 0), 0) / goalsRes.data.length)
        : 0,
      activeProjects: projectsRes.data?.length || 0,
      achievements: achievementsRes.data?.length || 0,
    };
  },

  async getCmsPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, post_type, published, published_at, created_at, slug')
      .order('created_at', { ascending: false })
      .limit(15);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createTask(title: string, description?: string, priority?: string, dueDate?: string) {
    const supabase = await createClient();
    const insertData: any = { title, status: 'belum_dimulai' };
    if (description) insertData.description = description;
    if (priority) insertData.priority = priority;
    if (dueDate) insertData.due_date = dueDate;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteTask(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
};
