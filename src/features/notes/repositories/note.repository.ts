import { createClient } from '@/lib/supabase/server';
import { Note, NoteLink, NoteTag, NoteWithDetails } from '../types/note.types';
import { NoteFormData, NoteLinkFormData } from '../validators/note.schema';

export const noteRepository = {
  async getNotes(searchQuery?: string): Promise<Note[]> {
    const supabase = await createClient();
    let query = supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (searchQuery) {
      // Very basic ilike search, in a real app you might use PostgreSQL full text search
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Note[];
  },

  async getNotesByLinkedId(linkedType: string, linkedId: string): Promise<Note[]> {
    const supabase = await createClient();
    
    // Step 1: Find note IDs
    const { data: links, error: linkError } = await supabase
      .from('note_links')
      .select('note_id')
      .eq('linked_type', linkedType)
      .eq('linked_id', linkedId);

    if (linkError) throw linkError;
    
    if (!links || links.length === 0) return [];

    const noteIds = links.map(link => link.note_id);

    // Step 2: Fetch notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .in('id', noteIds)
      .order('updated_at', { ascending: false });

    if (notesError) throw notesError;
    return (notes || []) as Note[];
  },

  async getNoteById(id: string): Promise<NoteWithDetails | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        tags:note_tags(*),
        links:note_links(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    // Type assertion because Supabase joined relations are typed loosely
    return data as unknown as NoteWithDetails;
  },

  async createNote(note: NoteFormData): Promise<Note> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: note.title,
        content: note.content || null,
        excerpt: note.excerpt || null,
        is_favorite: note.is_favorite,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Note;
  },

  async updateNote(id: string, note: Partial<NoteFormData>): Promise<Note> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notes')
      .update(note)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Note;
  },

  async deleteNote(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Tags Management
  async addTag(noteId: string, tag: string): Promise<NoteTag> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('note_tags')
      .insert({
        note_id: noteId,
        tag: tag,
      })
      .select()
      .single();

    if (error) throw error;
    return data as NoteTag;
  },

  async removeTag(noteId: string, tag: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag', tag);

    if (error) throw error;
  },

  // Links Management
  async addLink(noteId: string, link: NoteLinkFormData): Promise<NoteLink> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('note_links')
      .insert({
        note_id: noteId,
        linked_type: link.linked_type,
        linked_id: link.linked_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as NoteLink;
  },

  async removeLink(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('note_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
