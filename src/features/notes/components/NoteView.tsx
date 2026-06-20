'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NoteWithDetails } from '../types/note.types';
import { NoteEditor } from './NoteEditor';
import { NoteLinkManager } from './NoteLinkManager';
import { NoteTagManager } from './NoteTagManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Star, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { updateNoteAction, deleteNoteAction, toggleFavoriteAction } from '../actions/note.actions';
import { useCallback } from 'react';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface NoteViewProps {
  initialNote: NoteWithDetails;
}

export const NoteView = ({ initialNote }: NoteViewProps) => {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(initialNote.updated_at));

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // Simple excerpt generation
    const excerptText = note.content ? note.content.replace(/<[^>]*>?/gm, '').substring(0, 150) : '';
    
    const result = await updateNoteAction(note.id, {
      title: note.title,
      content: note.content,
      excerpt: excerptText,
    });
    
    if (result.success && result.data) {
      setLastSaved(new Date());
    }
    setIsSaving(false);
  }, [note.id, note.title, note.content]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note.title !== initialNote.title || note.content !== initialNote.content) {
        handleSave();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [note.title, note.content, initialNote.title, initialNote.content, handleSave]);

  const handleDelete = async () => {
    const result = await deleteNoteAction(note.id);
    if (result.success) {
      router.push('/portal/notes');
    }
  };

  const handleToggleFavorite = async () => {
    const newFavorite = !note.is_favorite;
    setNote(prev => ({ ...prev, is_favorite: newFavorite }));
    await toggleFavoriteAction(note.id, newFavorite);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/portal/notes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Terakhir disimpan: {lastSaved.toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs mr-2">
            {isSaving ? (
              <span className="flex items-center text-blue-500 font-medium">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Menyimpan...
              </span>
            ) : (
              <span className="flex items-center text-emerald-500 font-medium opacity-70">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Tersimpan
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleFavorite}
            className={note.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground'}
          >
            <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-2">
        <Input
          value={note.title}
          onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
          className="text-4xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 shadow-none h-auto rounded-none pb-4"
          placeholder="Judul Catatan"
        />
      </div>

      {/* Tag and Link Section */}
      <div className="flex flex-wrap items-center gap-6 px-2 pb-4 text-sm text-muted-foreground border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags:</span>
          <NoteTagManager noteId={note.id} initialTags={note.tags || []} />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Koneksi:</span>
          <NoteLinkManager noteId={note.id} initialLinks={note.links || []} />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto pb-20">
        <NoteEditor
          content={note.content || ''}
          onChange={(content) => setNote(prev => ({ ...prev, content }))}
        />
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan"
        description={`Apakah Anda yakin ingin menghapus catatan "${note.title}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};
