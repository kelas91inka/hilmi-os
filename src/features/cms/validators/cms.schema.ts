import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  published: z.boolean().default(false),
});

export type BlogFormData = z.infer<typeof blogSchema>;
