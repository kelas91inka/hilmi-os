'use client';

import { useState, useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Plus, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createTimelineEventAction,
  updateTimelineEventAction,
  deleteTimelineEventAction,
} from '../actions/content.actions';
import { useRouter } from 'next/navigation';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
}

interface TimelineFormData {
  title: string;
  description: string;
  event_date: string;
}

const emptyForm: TimelineFormData = { title: '', description: '', event_date: '' };

interface TimelineFormProps {
  initialData?: TimelineFormData & { id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

function TimelineForm({ initialData, onSuccess, onCancel }: TimelineFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = initialData?.id
        ? await updateTimelineEventAction(initialData.id, formData)
        : await createTimelineEventAction(formData);

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
        <Label htmlFor="tl-title">Judul *</Label>
        <Input id="tl-title" name="title" defaultValue={data.title} required placeholder="e.g. Mulai Kuliah Teknik Informatika" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tl-description">Deskripsi</Label>
        <Textarea id="tl-description" name="description" defaultValue={data.description} placeholder="Ceritakan momen ini..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tl-date">Tanggal</Label>
        <Input id="tl-date" name="event_date" type="date" defaultValue={data.event_date} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : initialData?.id ? 'Simpan Perubahan' : 'Tambah Event'}
        </Button>
      </div>
    </form>
  );
}

export function TimelineCMS({ initialItems }: { initialItems: TimelineEvent[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineEvent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TimelineEvent | null>(null);

  const confirmDelete = (item: TimelineEvent) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const result = await deleteTimelineEventAction(itemToDelete.id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(result.error || 'Gagal menghapus');
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  // Sort by date descending for display
  const sorted = [...items].sort((a, b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Timeline Perjalanan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} event terdaftar</p>
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
              <DialogTitle>{editingItem ? 'Edit Event' : 'Tambah Event Timeline'}</DialogTitle>
            </DialogHeader>
            <TimelineForm
              initialData={editingItem ? {
                id: editingItem.id,
                title: editingItem.title,
                description: editingItem.description || '',
                event_date: editingItem.event_date || '',
              } : undefined}
              onSuccess={handleSuccess}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada event timeline. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-12">
            {sorted.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-12 w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border dark:border-slate-800 bg-card hover:border-primary/30 dark:hover:bg-slate-900/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    {item.event_date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {format(parseISO(item.event_date), 'MMMM yyyy', { locale: localeId })}
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
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Event Timeline"
        description={`Apakah Anda yakin ingin menghapus event "${itemToDelete?.title || 'Untitled'}"?`}
      />
    </div>
  );
}
