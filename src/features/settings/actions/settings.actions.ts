'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserSettings, UpdateSettingsDTO } from '../types/settings.types';

export async function getSettingsAction(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found, create default settings
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert({
          user_id: user.id,
          theme: 'system',
          language: 'id',
          timezone: 'Asia/Jakarta',
          ai_enabled: true
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Failed to create default settings:', insertError);
        return null;
      }
      return newData as UserSettings;
    }
    console.error('Failed to fetch settings:', error);
    return null;
  }

  return data as UserSettings;
}

export async function updateSettingsAction(data: UpdateSettingsDTO): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('settings')
    .update(data)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/portal/settings');
  revalidatePath('/', 'layout'); // Revalidate everything to apply settings globally (like AI toggle)
  return { success: true };
}
