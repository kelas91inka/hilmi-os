import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  goal_type: z.enum(['mingguan', 'bulanan', 'tahunan', 'lifetime']),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  target_date: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).default(0),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const goalMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  completed: z.boolean().default(false),
  completed_at: z.string().optional().nullable(),
});

export type GoalMilestoneFormData = z.infer<typeof goalMilestoneSchema>;
