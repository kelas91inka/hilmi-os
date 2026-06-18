'use server';

import { revalidatePath } from 'next/cache';
import { diaryService } from '../services/diary.service';

export async function upsertDiaryEntryAction(data: unknown) {
  try {
    const entry = await diaryService.upsertEntry(data);
    revalidatePath('/portal/diary');
    revalidatePath(`/portal/diary/${entry.entry_date}`);
    return { success: true, data: entry };
  } catch (error) {
    console.error('Error saving diary entry:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteDiaryEntryAction(id: string) {
  try {
    await diaryService.deleteEntry(id);
    revalidatePath('/portal/diary');
    return { success: true };
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
