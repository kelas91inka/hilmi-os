'use client';

import { Note } from '../types/note.types';
import Link from 'next/link';
import { FileText, Star, Clock } from 'lucide-react';
import { CreateNoteButton } from './CreateNoteButton';
import { Card, CardContent } from '@/components/ui/card';

interface NoteListProps {
  notes: Note[];
}

export const NoteList = ({ notes }: NoteListProps) => {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-xl bg-card">
        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Tidak ada catatan ditemukan</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">Buat catatan pertamamu untuk mulai membangun Second Brain yang menyimpan ide dan pengetahuanmu.</p>
        <CreateNoteButton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="hover:border-primary/40 hover:shadow-md transition-all group h-52">
          <Link 
            href={`/portal/notes/${note.id}`}
            className="flex flex-col h-full"
          >
            <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {note.title}
            </h3>
            {note.is_favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0 ml-2" />
            )}
          </div>
          
          <div className="text-sm text-muted-foreground line-clamp-3 flex-grow leading-relaxed">
            {note.excerpt || note.content?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || 'Catatan kosong...'}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
            {new Date(note.updated_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
            </div>
          </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
};
