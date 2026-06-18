'use client';

import { useState, useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Plus, Edit2, Trash2, Award, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createAchievementAction,
  updateAchievementAction,
  deleteAchievementAction,
} from '../actions/content.actions';
import { useRouter } from 'next/navigation';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  achievement_date: string | null;
  image_url: string | null;
  created_at: string;
}

interface AchievementFormData {
  title: string;
  description: string;
  category: string;
  achievement_date: string;
  image_url: string;
}

const emptyForm: AchievementFormData = {
  title: '',
  description: '',
  category: '',
  achievement_date: '',
  image_url: '',
};

interface AchievementFormProps {
  initialData?: AchievementFormData & { id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

function AchievementForm({ initialData, onSuccess, onCancel }: AchievementFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = initialData?.id
        ? await updateAchievementAction(initialData.id, formData)
        : await createAchievementAction(formData);

      if (!result.success) {
        setError(result.error || 'Terjadi kesalahan');
      } else {
        onSuccess();
      }
    });
  };

  const data = initialData ?? emptyForm;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ach-title">Judul *</Label>
        <Input id="ach-title" name="title" defaultValue={data.title} required placeholder="e.g. Juara 1 Hackathon" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ach-description">Deskripsi</Label>
        <Textarea id="ach-description" name="description" defaultValue={data.description} placeholder="Ceritakan pencapaian ini..." rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ach-category">Kategori</Label>
          <Input id="ach-category" name="category" defaultValue={data.category} placeholder="e.g. Kompetisi" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ach-date">Tanggal</Label>
          <Input id="ach-date" name="achievement_date" type="date" defaultValue={data.achievement_date} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ach-image">URL Gambar</Label>
        <Input id="ach-image" name="image_url" defaultValue={data.image_url} placeholder="https://..." />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : initialData?.id ? 'Simpan Perubahan' : 'Tambah Pencapaian'}
        </Button>
      </div>
    </form>
  );
}

export function AchievementCMS({ initialItems }: { initialItems: Achievement[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Achievement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = (item: Achievement) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const result = await deleteAchievementAction(itemToDelete.id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      setDeleteConfirmOpen(false);
      setError(result.error || 'Gagal menghapus pencapaian.');
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Pencapaian</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} pencapaian terdaftar</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          } />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Pencapaian' : 'Tambah Pencapaian'}</DialogTitle>
            </DialogHeader>
            <AchievementForm
              initialData={editingItem ? {
                id: editingItem.id,
                title: editingItem.title,
                description: editingItem.description || '',
                category: editingItem.category || '',
                achievement_date: editingItem.achievement_date || '',
                image_url: editingItem.image_url || '',
              } : undefined}
              onSuccess={handleSuccess}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
          <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada pencapaian. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border dark:border-slate-800 bg-card hover:border-primary/30 dark:hover:bg-slate-900/50 transition-colors group">
              {item.image_url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.category && (
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {item.achievement_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(item.achievement_date), 'dd MMMM yyyy', { locale: localeId })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 sm:shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto mt-2 sm:mt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingItem(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDelete(item)}
                  disabled={isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Pencapaian"
        description={`Apakah Anda yakin ingin menghapus pencapaian "${itemToDelete?.title || 'Untitled'}"?`}
      />
    </div>
  );
}
