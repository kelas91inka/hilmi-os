'use server';

import { revalidatePath } from 'next/cache';
import { noteService } from '../services/note.service';

export async function createNoteAction(data: unknown) {
  try {
    const note = await noteService.createNote(data);
    revalidatePath('/portal/notes');
    revalidatePath('/portal/dashboard');
    return { success: true, data: note };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateNoteAction(id: string, data: unknown) {
  try {
    const note = await noteService.updateNote(id, data);
    revalidatePath('/portal/notes');
    revalidatePath(`/portal/notes/${id}`);
    return { success: true, data: note };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    await noteService.deleteNote(id);
    revalidatePath('/portal/notes');
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  try {
    const note = await noteService.toggleFavorite(id, isFavorite);
    revalidatePath('/portal/notes');
    revalidatePath(`/portal/notes/${id}`);
    return { success: true, data: note };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Tags
export async function addNoteTagAction(noteId: string, tag: string) {
  try {
    const result = await noteService.addTag(noteId, tag);
    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error adding tag:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeNoteTagAction(noteId: string, tag: string) {
  try {
    await noteService.removeTag(noteId, tag);
    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true };
  } catch (error) {
    console.error('Error removing tag:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Links
export async function addNoteLinkAction(noteId: string, data: unknown) {
  try {
    const link = await noteService.addLink(noteId, data);
    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true, data: link };
  } catch (error) {
    console.error('Error adding link:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeNoteLinkAction(noteId: string, linkId: string) {
  try {
    await noteService.removeLink(linkId);
    revalidatePath(`/portal/notes/${noteId}`);
    return { success: true };
  } catch (error) {
    console.error('Error removing link:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
