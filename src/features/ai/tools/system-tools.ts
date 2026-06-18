/* eslint-disable */
// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { aiRepository } from '../repositories/ai.repository';

export const systemTools = {
  get_active_tasks: tool({
    description: 'Fetch all active (non-completed) tasks for the user. Use this when the user asks about their current tasks or what to focus on.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const tasks = await aiRepository.getActiveTasks();
        return { success: true, tasks };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_weekly_tasks: tool({
    description: 'Fetch the user\'s tasks from the last 7 days to perform a weekly review or analyze task completion.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const tasks = await aiRepository.getWeeklyTasks();
        return { success: true, tasks };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_active_projects: tool({
    description: 'Fetch the user\'s currently active projects and their timelines to analyze project progress.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const projects = await aiRepository.getActiveProjects();
        return { success: true, projects };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_goals_progress: tool({
    description: 'Fetch all goals and their current completion percentages.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const goals = await aiRepository.getGoalsProgress();
        return { success: true, goals };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_recent_diary: tool({
    description: 'Fetch the user\'s diary entries from the last 30 days to analyze mood trends and daily reflections.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const diary = await aiRepository.getRecentDiary();
        return { success: true, diary };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_notes: tool({
    description: 'Fetch the user\'s recent and favorite notes.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const notes = await aiRepository.getNotes();
        return { success: true, notes };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  get_habit_stats: tool({
    description: 'Fetch the user\'s active habits to analyze daily routines and consistency.',
    parameters: z.object({ prompt: z.string().optional() }),
    execute: async (_args: { prompt?: string }) => {
      try {
        const habits = await aiRepository.getHabitStats();
        return { success: true, habits };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  create_task: tool({
    description: 'Create a new task in the database based on the user\'s command.',
    parameters: z.object({
      title: z.string().describe('The title or main description of the task.'),
      description: z.string().optional().describe('Additional details about the task.'),
      priority: z.enum(['rendah', 'normal', 'tinggi', 'kritis']).optional().default('normal').describe('Priority level of the task.'),
      due_date: z.string().optional().describe('Due date in ISO format or YYYY-MM-DD.')
    }),
    execute: async (args) => {
      try {
        const task = await aiRepository.createTask(args.title, args.description, args.priority, args.due_date);
        return { success: true, task };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),

  create_diary_entry: tool({
    description: 'Create a new quick diary entry or note based on the user\'s reflection.',
    parameters: z.object({
      content: z.string().describe('The content of the reflection or note.'),
      mood: z.enum(['happy', 'neutral', 'sad', 'productive', 'stressed', 'tired', 'sick']).optional().default('neutral').describe('The mood associated with the entry.')
    }),
    execute: async (args) => {
      try {
        const entry = await aiRepository.createDiaryEntry(args.content, args.mood);
        return { success: true, entry };
      } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
      }
    },
  }),
};
