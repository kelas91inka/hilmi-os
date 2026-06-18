import { Metadata } from 'next';
import { noteService } from '@/features/notes/services/note.service';
import { NoteList } from '@/features/notes/components/NoteList';
import { CreateNoteButton } from '@/features/notes/components/CreateNoteButton';
import { NotesSearch } from '@/features/notes/components/NotesSearch';
import { Book } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Catatan | Hilmi OS',
  description: 'Kelola catatan, ide, dan basis pengetahuan Anda',
};

interface NotesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { q } = await searchParams;
  const notes = await noteService.getNotes(q);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Book className="w-8 h-8 text-primary" />
            Second Brain
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola catatan, ide, dan basis pengetahuan Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateNoteButton />
        </div>
      </div>

      <NotesSearch />

      <NoteList notes={notes} />
    </div>
  );
}
