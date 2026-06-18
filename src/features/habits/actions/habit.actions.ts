'use server';

import { revalidatePath } from 'next/cache';
import { habitService } from '../services/habit.service';

export async function createHabitAction(data: unknown) {
  try {
    const habit = await habitService.createHabit(data);
    revalidatePath('/portal/habits');
    return { success: true, data: habit };
  } catch (error) {
    console.error('Error creating habit:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateHabitAction(id: string, data: unknown) {
  try {
    const habit = await habitService.updateHabit(id, data);
    revalidatePath('/portal/habits');
    revalidatePath(`/portal/habits/${id}`);
    return { success: true, data: habit };
  } catch (error) {
    console.error('Error updating habit:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteHabitAction(id: string) {
  try {
    await habitService.deleteHabit(id);
    revalidatePath('/portal/habits');
    return { success: true };
  } catch (error) {
    console.error('Error deleting habit:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function toggleHabitLogAction(habitId: string, date: string) {
  try {
    await habitService.toggleHabitLog(habitId, date);
    revalidatePath('/portal/habits');
    revalidatePath(`/portal/habits/${habitId}`);
    revalidatePath('/portal/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error toggling habit log:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
