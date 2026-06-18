'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function linkNoteAction(noteId: string, linkedType: 'task' | 'project' | 'goal', linkedId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('note_links')
      .insert({
        note_id: noteId,
        linked_type: linkedType,
        linked_id: linkedId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Link already exists' };
      }
      throw error;
    }

    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error linking note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unlinkNoteAction(linkId: string, noteId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('note_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;

    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true };
  } catch (error) {
    console.error('Error unlinking note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
