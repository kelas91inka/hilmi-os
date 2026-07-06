'use client';

/**
 * GlobalNoteDialog
 * A lightweight dialog for creating a note via AI pre-fill.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, Save } from 'lucide-react';
import { createNoteAction } from '@/features/notes/actions/note.actions';

interface GlobalNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    title: string;
    content: string;
    is_favorite: boolean;
  };
  onSuccess: () => void;
}

export function GlobalNoteDialog({ open, onOpenChange, initialData, onSuccess }: GlobalNoteDialogProps) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Judul note tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createNoteAction({
      title: title.trim(),
      content: content.trim(),
      is_favorite: initialData.is_favorite || false,
    });
    setLoading(false);
    if (result.success) {
      onSuccess();
      onOpenChange(false);
    } else {
      setError(result.error || 'Gagal membuat note.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Buat Note Baru
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="global-note-title">Judul</Label>
            <Input
              id="global-note-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Judul note..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="global-note-content">Konten</Label>
            <Textarea
              id="global-note-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Isi note..."
              className="resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
