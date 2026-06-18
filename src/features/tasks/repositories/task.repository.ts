import { createClient } from "@/lib/supabase/server";
import { TaskInsert, TaskUpdate, TaskWithTags } from "../types/task.types";

export const taskRepository = {
  async getTasks(): Promise<TaskWithTags[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        task_tags (
          id,
          tag
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as TaskWithTags[];
  },

  async getTasksByGoalId(goalId: string): Promise<TaskWithTags[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        task_tags (
          id,
          tag
        )
      `)
      .eq("goal_id", goalId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as TaskWithTags[];
  },

  async getTaskById(id: string): Promise<TaskWithTags | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        task_tags (
          id,
          tag
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as TaskWithTags;
  },

  async createTask(taskData: Omit<TaskInsert, "user_id">, tags: string[]): Promise<TaskWithTags> {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure user_id is set
    const dataToInsert = { ...taskData, user_id: user.id };

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert(dataToInsert)
      .select()
      .single();

    if (taskError) throw taskError;

    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({ task_id: task.id, tag }));
      const { error: tagError } = await supabase
        .from("task_tags")
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    return this.getTaskById(task.id) as Promise<TaskWithTags>;
  },

  async updateTask(id: string, taskData: TaskUpdate, tags?: string[]): Promise<TaskWithTags> {
    const supabase = await createClient();

    if (Object.keys(taskData).length > 0) {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", id);
      if (error) throw error;
    }

    if (tags !== undefined) {
      await supabase.from("task_tags").delete().eq("task_id", id);
      
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({ task_id: id, tag }));
        const { error: tagError } = await supabase
          .from("task_tags")
          .insert(tagInserts);
        if (tagError) throw tagError;
      }
    }

    return this.getTaskById(id) as Promise<TaskWithTags>;
  },

  async deleteTask(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }
};
