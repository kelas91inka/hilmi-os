'use server';

import { revalidatePath } from 'next/cache';
import { goalService } from '../services/goal.service';
import { GoalFormData, GoalMilestoneFormData } from '../validators/goal.schema';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function createGoalAction(data: GoalFormData) {
  try {
    const result = await goalService.createGoal(data);
    revalidatePath('/portal/goals');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateGoalAction(id: string, data: Partial<GoalFormData>) {
  try {
    const result = await goalService.updateGoal(id, data);
    revalidatePath('/portal/goals');
    revalidatePath(`/portal/goals/${id}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteGoalAction(id: string) {
  try {
    await goalService.deleteGoal(id);
    revalidatePath('/portal/goals');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// --- MILESTONES ---

export async function createMilestoneAction(goalId: string, data: GoalMilestoneFormData) {
  try {
    const result = await goalService.createMilestone(goalId, data);
    revalidatePath(`/portal/goals/${goalId}`);
    revalidatePath('/portal/goals'); // update progress on list view
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateMilestoneAction(id: string, data: Partial<GoalMilestoneFormData>, goalId: string) {
  try {
    const result = await goalService.updateMilestone(id, data, goalId);
    revalidatePath(`/portal/goals/${goalId}`);
    revalidatePath('/portal/goals'); // update progress on list view
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteMilestoneAction(id: string, goalId: string) {
  try {
    await goalService.deleteMilestone(id, goalId);
    revalidatePath(`/portal/goals/${goalId}`);
    revalidatePath('/portal/goals'); // update progress on list view
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
