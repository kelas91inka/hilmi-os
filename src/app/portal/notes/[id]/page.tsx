import { notFound } from 'next/navigation';
import { noteService } from '@/features/notes/services/note.service';
import { NoteView } from '@/features/notes/components/NoteView';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  
  let note;
  try {
    note = await noteService.getNoteById(id);
  } catch (error) {
    console.error('Error loading note:', error);
  }
  
  if (!note) {
    notFound();
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto h-full">
        <NoteView initialNote={note} />
      </div>
    </div>
  );
}
