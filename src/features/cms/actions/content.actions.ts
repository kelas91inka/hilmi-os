'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const achievementSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  category: z.string().optional(),
  achievement_date: z.string().optional(),
  image_url: z.string().optional(),
});

const timelineSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  event_date: z.string().optional(),
});

// ─── Achievement Actions ───────────────────────────────────────────────

export async function createAchievementAction(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
    achievement_date: (formData.get('achievement_date') as string) || undefined,
    image_url: (formData.get('image_url') as string) || undefined,
  };

  const parsed = achievementSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('achievements').insert({
    title: parsed.data.title,
    description: parsed.data.description ?? undefined,
    category: parsed.data.category ?? undefined,
    achievement_date: parsed.data.achievement_date ?? undefined,
    image_url: parsed.data.image_url ?? undefined,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/achievements');
  revalidatePath('/achievements');
  return { success: true };
}

export async function updateAchievementAction(id: string, formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
    achievement_date: (formData.get('achievement_date') as string) || undefined,
    image_url: (formData.get('image_url') as string) || undefined,
  };

  const parsed = achievementSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('achievements')
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? undefined,
      category: parsed.data.category ?? undefined,
      achievement_date: parsed.data.achievement_date ?? undefined,
      image_url: parsed.data.image_url ?? undefined,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/achievements');
  revalidatePath('/achievements');
  return { success: true };
}

export async function deleteAchievementAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/achievements');
  revalidatePath('/achievements');
  return { success: true };
}

// ─── Timeline Actions ─────────────────────────────────────────────────

export async function createTimelineEventAction(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    event_date: (formData.get('event_date') as string) || undefined,
  };

  const parsed = timelineSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const eventDate = parsed.data.event_date || new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('timeline_events').insert({
    title: parsed.data.title,
    description: parsed.data.description ?? undefined,
    event_date: eventDate,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/timeline');
  revalidatePath('/timeline');
  return { success: true };
}

export async function updateTimelineEventAction(id: string, formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    event_date: (formData.get('event_date') as string) || undefined,
  };

  const parsed = timelineSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('timeline_events')
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? undefined,
      event_date: parsed.data.event_date ?? undefined,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/timeline');
  revalidatePath('/timeline');
  return { success: true };
}

export async function deleteTimelineEventAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('timeline_events').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/portal/cms/timeline');
  revalidatePath('/timeline');
  return { success: true };
}
