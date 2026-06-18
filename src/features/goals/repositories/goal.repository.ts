import { createClient } from '@/lib/supabase/server';
import { Goal, GoalMilestone } from '../types/goal.types';
import { GoalFormData, GoalMilestoneFormData } from '../validators/goal.schema';

export const goalRepository = {
  async getGoals(): Promise<Goal[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Goal[];
  },

  async getGoalById(id: string): Promise<Goal | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    return data as Goal;
  },

  async createGoal(goal: GoalFormData): Promise<Goal> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description || null,
        goal_type: goal.goal_type,
        status: goal.status,
        target_date: goal.target_date || null,
        progress: goal.progress,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async updateGoal(id: string, goal: Partial<GoalFormData>): Promise<Goal> {
    const supabase = await createClient();
    // Convert empty string for dates to null to prevent 22P02 Postgres errors
    const updateData = { ...goal };
    if (updateData.target_date === '') {
        updateData.target_date = null;
    }
    
    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async deleteGoal(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- MILESTONES ---

  async getMilestones(goalId: string): Promise<GoalMilestone[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as GoalMilestone[];
  },

  async createMilestone(goalId: string, milestone: GoalMilestoneFormData): Promise<GoalMilestone> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({
        goal_id: goalId,
        title: milestone.title,
        description: milestone.description || null,
        completed: milestone.completed,
        completed_at: milestone.completed_at || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async updateMilestone(id: string, milestone: Partial<GoalMilestoneFormData>): Promise<GoalMilestone> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goal_milestones')
      .update(milestone)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async deleteMilestone(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
