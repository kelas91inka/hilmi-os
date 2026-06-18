import { noteRepository } from '../repositories/note.repository';
import { noteSchema, noteLinkSchema } from '../validators/note.schema';

export const noteService = {
  async getNotes(searchQuery?: string) {
    return noteRepository.getNotes(searchQuery);
  },

  async getNotesByLinkedId(linkedType: string, linkedId: string) {
    return noteRepository.getNotesByLinkedId(linkedType, linkedId);
  },

  async getNoteById(id: string) {
    const note = await noteRepository.getNoteById(id);
    if (!note) throw new Error('Note not found');
    return note;
  },

  async createNote(data: unknown) {
    const validated = noteSchema.parse(data);
    return noteRepository.createNote(validated);
  },

  async updateNote(id: string, data: unknown) {
    const validated = noteSchema.partial().parse(data);
    return noteRepository.updateNote(id, validated);
  },

  async deleteNote(id: string) {
    return noteRepository.deleteNote(id);
  },

  async toggleFavorite(id: string, isFavorite: boolean) {
    return noteRepository.updateNote(id, { is_favorite: isFavorite });
  },

  // Tags
  async addTag(noteId: string, tag: string) {
    if (!tag.trim()) throw new Error('Tag cannot be empty');
    return noteRepository.addTag(noteId, tag.trim().toLowerCase());
  },

  async removeTag(noteId: string, tag: string) {
    return noteRepository.removeTag(noteId, tag.trim().toLowerCase());
  },

  // Links
  async addLink(noteId: string, data: unknown) {
    const validated = noteLinkSchema.parse(data);
    return noteRepository.addLink(noteId, validated);
  },

  async removeLink(linkId: string) {
    return noteRepository.removeLink(linkId);
  }
};
