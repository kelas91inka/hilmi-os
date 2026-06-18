import { z } from 'zod';

export const moodSchema = z.enum(['happy', 'neutral', 'sad', 'productive', 'stressed', 'tired', 'sick']);

export const diaryEntrySchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  mood: moodSchema.optional().nullable(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
});

export type DiaryEntryFormData = z.infer<typeof diaryEntrySchema>;
