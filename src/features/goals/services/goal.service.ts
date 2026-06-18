import { goalRepository } from '../repositories/goal.repository';
import { GoalFormData, GoalMilestoneFormData } from '../validators/goal.schema';
import { Goal, GoalMilestone } from '../types/goal.types';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    return goalRepository.getGoals();
  },

  async getGoalById(id: string): Promise<Goal | null> {
    return goalRepository.getGoalById(id);
  },

  async createGoal(data: GoalFormData): Promise<Goal> {
    return goalRepository.createGoal(data);
  },

  async updateGoal(id: string, data: Partial<GoalFormData>): Promise<Goal> {
    return goalRepository.updateGoal(id, data);
  },

  async deleteGoal(id: string): Promise<void> {
    return goalRepository.deleteGoal(id);
  },

  // --- MILESTONES & PROGRESS ---

  async getMilestones(goalId: string): Promise<GoalMilestone[]> {
    return goalRepository.getMilestones(goalId);
  },

  async createMilestone(goalId: string, data: GoalMilestoneFormData): Promise<GoalMilestone> {
    const milestone = await goalRepository.createMilestone(goalId, data);
    await this.recalculateGoalProgress(goalId);
    return milestone;
  },

  async updateMilestone(id: string, data: Partial<GoalMilestoneFormData>, goalId: string): Promise<GoalMilestone> {
    const milestone = await goalRepository.updateMilestone(id, data);
    await this.recalculateGoalProgress(goalId);
    return milestone;
  },

  async deleteMilestone(id: string, goalId: string): Promise<void> {
    await goalRepository.deleteMilestone(id);
    await this.recalculateGoalProgress(goalId);
  },

  /**
   * Recalculates the goal's progress percentage based on completed milestones and tasks
   */
  async recalculateGoalProgress(goalId: string): Promise<void> {
    const milestones = await goalRepository.getMilestones(goalId);
    
    // We also need tasks. We need to import taskRepository.
    const { taskRepository } = await import('@/features/tasks/repositories/task.repository');
    const tasks = await taskRepository.getTasksByGoalId(goalId);
    
    let progress = 0;
    const totalItems = milestones.length + tasks.length;
    
    if (totalItems > 0) {
      const completedMilestones = milestones.filter(m => m.completed).length;
      const completedTasks = tasks.filter(t => t.status === 'selesai').length;
      
      const totalCompleted = completedMilestones + completedTasks;
      progress = Math.round((totalCompleted / totalItems) * 100);
    }

    await goalRepository.updateGoal(goalId, { progress });
  }
};
