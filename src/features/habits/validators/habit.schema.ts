import { z } from 'zod';

export const habitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional().nullable(),
  target_frequency: z.string().default('daily'),
  active: z.boolean().default(true),
});

export type HabitFormData = z.infer<typeof habitSchema>;
