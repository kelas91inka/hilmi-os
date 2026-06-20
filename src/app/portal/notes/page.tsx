import { Metadata } from 'next';
import { noteService } from '@/features/notes/services/note.service';
import { NotesClient } from '@/features/notes/components/NotesClient';

export const metadata: Metadata = {
  title: 'Catatan | Hilmi OS',
  description: 'Kelola catatan, ide, dan basis pengetahuan Anda',
};

export default async function NotesPage() {
  // Fetch all notes (including tags and links relations)
  const notes = await noteService.getNotes();

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto">
      <NotesClient initialNotes={notes} />
    </div>
  );
}
