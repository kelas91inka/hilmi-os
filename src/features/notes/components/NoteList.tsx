'use client';

import { NoteWithDetails } from '../types/note.types';
import Link from 'next/link';
import { FileText, Star, Clock, Link as LinkIcon } from 'lucide-react';
import { CreateNoteButton } from './CreateNoteButton';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';

interface NoteListProps {
  notes: NoteWithDetails[];
}

export const NoteList = ({ notes }: NoteListProps) => {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-6 h-6" />}
        title="Tidak ada catatan ditemukan"
        description="Buat catatan pertamamu untuk mulai membangun Second Brain yang menyimpan ide dan pengetahuanmu."
        action={<CreateNoteButton />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="glow-card hover:-translate-y-1 hover:shadow-md hover:border-primary/25 hover-border-primary transition-all duration-200 group h-56 rounded-2xl flex flex-col bg-card">
          <Link 
            href={`/portal/notes/${note.id}`}
            className="flex flex-col h-full w-full"
          >
            <CardContent className="p-5 flex flex-col h-full w-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  {note.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0 mt-1 animate-in zoom-in duration-200" />
                  )}
                </div>

                {/* Badge tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5 max-h-5 overflow-hidden">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="text-[9px] font-semibold bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded-full dark:bg-primary/10">
                        #{tag.tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[9px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1">
                  {note.excerpt || note.content?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || 'Catatan kosong...'}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50 mt-4">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/60" />
                  <span className="font-mono-num">
                    {new Date(note.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Link indicators */}
                {note.links && note.links.length > 0 && (
                  <div className="flex items-center gap-1 bg-muted/80 px-2 py-0.5 rounded-md text-[10px] text-muted-foreground font-medium border border-border/50">
                    <LinkIcon className="w-3 h-3 text-primary" />
                    <span>{note.links.length} Tautan</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
};
