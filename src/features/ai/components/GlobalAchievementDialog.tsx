'use client';

/**
 * GlobalAchievementDialog
 * A lightweight dialog for recording an achievement via AI pre-fill.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GlobalAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    title: string;
    description: string;
    category: string;
    achievement_date: string;
  };
  onSuccess: () => void;
}

const CATEGORIES = [
  'Akademik', 'Karir', 'Teknologi', 'Personal', 'Kesehatan', 'Sosial', 'Keuangan', 'Lainnya'
];

export function GlobalAchievementDialog({ open, onOpenChange, initialData, onSuccess }: GlobalAchievementDialogProps) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category || 'Personal');
  const [achievementDate, setAchievementDate] = useState(initialData.achievement_date);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Judul achievement tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from('achievements').insert({
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        achievement_date: achievementDate || null,
      });
      if (dbError) throw new Error(dbError.message);
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || 'Gagal mencatat achievement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Catat Achievement Baru
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="global-achievement-title">Judul Achievement</Label>
            <Input
              id="global-achievement-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nama pencapaian..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="global-achievement-desc">Deskripsi</Label>
            <Textarea
              id="global-achievement-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Ceritakan pencapaianmu..."
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="global-achievement-cat">Kategori</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || 'Personal')}>
                <SelectTrigger id="global-achievement-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="global-achievement-date">Tanggal</Label>
              <Input
                id="global-achievement-date"
                type="date"
                value={achievementDate}
                onChange={e => setAchievementDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Achievement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
