import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  is_favorite: z.boolean().default(false),
});

export type NoteFormData = z.infer<typeof noteSchema>;

export const noteTagSchema = z.object({
  tag: z.string().min(1, 'Tag is required'),
});

export type NoteTagFormData = z.infer<typeof noteTagSchema>;

export const noteLinkSchema = z.object({
  linked_type: z.enum(['project', 'goal', 'task', 'diary', 'blog']),
  linked_id: z.string().uuid('Invalid ID for linked item'),
});

export type NoteLinkFormData = z.infer<typeof noteLinkSchema>;
