import { taskRepository } from "../repositories/task.repository";
import { TaskFormValues } from "../validators/task.schema";
import { TaskStatus, TaskUpdate, TaskWithTags } from "../types/task.types";

export const taskService = {
  async getAllTasks(): Promise<TaskWithTags[]> {
    return taskRepository.getTasks();
  },

  async getTasksByGoalId(goalId: string): Promise<TaskWithTags[]> {
    return taskRepository.getTasksByGoalId(goalId);
  },

  async getTask(id: string): Promise<TaskWithTags | null> {
    return taskRepository.getTaskById(id);
  },

  async createTask(data: TaskFormValues): Promise<TaskWithTags> {
    const { tags, ...taskData } = data;
    
    // Convert empty strings and undefined to null for Supabase
    const insertData = {
      ...taskData,
      description: taskData.description || null,
      due_date: taskData.due_date || null,
      project_id: taskData.project_id || null,
      goal_id: taskData.goal_id || null,
    };

    const task = await taskRepository.createTask(insertData, tags);
    
    if (task.goal_id) {
      const { goalService } = await import('@/features/goals/services/goal.service');
      await goalService.recalculateGoalProgress(task.goal_id);
    }

    // Future: Create activity log
    // await activityService.log('TASK_CREATED', task.id);

    return task;
  },

  async updateTask(id: string, data: Partial<TaskFormValues>): Promise<TaskWithTags> {
    const { tags, ...taskData } = data;
    
    const updateData: TaskUpdate = {};
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description || null;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date || null;
    if (taskData.project_id !== undefined) updateData.project_id = taskData.project_id || null;
    if (taskData.goal_id !== undefined) updateData.goal_id = taskData.goal_id || null;

    if (taskData.status === 'selesai') {
      updateData.completed_at = new Date().toISOString();
    } else if (taskData.status !== undefined) {
      updateData.completed_at = null;
    }

    const oldTask = await taskRepository.getTaskById(id);
    const task = await taskRepository.updateTask(id, updateData, tags);
    
    if (oldTask) {
      const { goalService } = await import('@/features/goals/services/goal.service');
      if (oldTask.goal_id && oldTask.goal_id !== task.goal_id) {
        await goalService.recalculateGoalProgress(oldTask.goal_id);
      }
      if (task.goal_id) {
        await goalService.recalculateGoalProgress(task.goal_id);
      }
    }
    
    // Future: Create activity log
    // await activityService.log('TASK_UPDATED', task.id);

    return task;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<TaskWithTags> {
    return this.updateTask(id, { status });
  },

  async deleteTask(id: string): Promise<void> {
    const oldTask = await taskRepository.getTaskById(id);
    await taskRepository.deleteTask(id);
    
    if (oldTask?.goal_id) {
      const { goalService } = await import('@/features/goals/services/goal.service');
      await goalService.recalculateGoalProgress(oldTask.goal_id);
    }
    
    // Future: Create activity log
    // await activityService.log('TASK_DELETED', id);
  }
};
