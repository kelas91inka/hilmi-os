'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntryWithDetails, Mood } from '../types/diary.types';
import { NoteEditor } from '@/features/notes/components/NoteEditor'; // Reusing from notes domain
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { upsertDiaryEntryAction, deleteDiaryEntryAction } from '../actions/diary.actions';
import { MoodPicker } from './MoodPicker';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface DiaryEditorProps {
  entryDate: string; // YYYY-MM-DD
  initialEntry: DiaryEntryWithDetails | null;
}

export const DiaryEditor = ({ entryDate, initialEntry }: DiaryEditorProps) => {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState<Mood | null>(initialEntry?.mood || null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    initialEntry ? new Date(initialEntry.updated_at) : null
  );

  const displayDate = format(parseISO(entryDate), 'EEEE, d MMMM yyyy', { locale: id });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await upsertDiaryEntryAction({
      title,
      content,
      mood,
      entry_date: entryDate,
    });
    
    if (result.success && result.data) {
      setLastSaved(new Date());
    }
    setIsSaving(false);
  }, [title, content, mood, entryDate]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasChanged = 
        title !== (initialEntry?.title || '') || 
        content !== (initialEntry?.content || '') ||
        mood !== (initialEntry?.mood || null);

      if (hasChanged) {
        handleSave();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, content, mood, initialEntry, handleSave]);

  const handleDelete = async () => {
    if (!initialEntry) return;
    const result = await deleteDiaryEntryAction(initialEntry.id);
    if (result.success) {
      router.push('/portal/diary');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/portal/diary')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{displayDate}</span>
            <span className="text-xs text-muted-foreground">
              {lastSaved ? `Terakhir disimpan: ${lastSaved.toLocaleTimeString('id-ID')}` : 'Draf Baru'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs mr-2">
            {isSaving ? (
              <span className="flex items-center text-blue-500 font-medium">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Menyimpan...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center text-emerald-500 font-medium opacity-70">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Tersimpan
              </span>
            ) : null}
          </div>
          {initialEntry && (
            <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>

      {/* Mood Picker */}
      <div className="px-2">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Bagaimana perasaan Anda hari ini?</h3>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      {/* Title Input */}
      <div className="px-2 pt-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 shadow-none h-auto rounded-none pb-2"
          placeholder="Judul Jurnal (Opsional)"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-2 pb-20">
        <NoteEditor
          content={content}
          onChange={setContent}
        />
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Diary"
        description={`Apakah Anda yakin ingin menghapus catatan diary untuk tanggal ${displayDate}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};
