'use client';

/**
 * GlobalDiaryDialog
 * A lightweight dialog for creating a diary entry via AI pre-fill.
 * Opened by GlobalModalContainer when AI action type = 'create_diary_entry'.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2, Save } from 'lucide-react';
import { upsertDiaryEntryAction } from '@/features/diary/actions/diary.actions';

interface GlobalDiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    content: string;
    mood: string;
    entry_date: string;
    title: string;
  };
  onSuccess: () => void;
}

const MOODS = [
  { value: 'happy', label: '😊 Senang' },
  { value: 'neutral', label: '😐 Netral' },
  { value: 'sad', label: '😢 Sedih' },
  { value: 'productive', label: '⚡ Produktif' },
  { value: 'stressed', label: '😰 Stres' },
  { value: 'tired', label: '😴 Lelah' },
  { value: 'sick', label: '🤒 Sakit' },
];

export function GlobalDiaryDialog({ open, onOpenChange, initialData, onSuccess }: GlobalDiaryDialogProps) {
  const [content, setContent] = useState(initialData.content);
  const [mood, setMood] = useState(initialData.mood || 'neutral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Konten jurnal tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await upsertDiaryEntryAction({
      title: initialData.title || 'Catatan AI',
      content,
      mood: mood as any,
      entry_date: initialData.entry_date,
    });
    setLoading(false);
    if (result.success) {
      onSuccess();
      onOpenChange(false);
    } else {
      setError(result.error || 'Gagal menyimpan jurnal.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Tambah Entri Jurnal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="global-diary-mood">Mood</Label>
            <Select value={mood} onValueChange={(val) => setMood(val || 'neutral')}>
              <SelectTrigger id="global-diary-mood">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="global-diary-content">Catatan</Label>
            <Textarea
              id="global-diary-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Tulis refleksi hari ini..."
              className="resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Jurnal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
