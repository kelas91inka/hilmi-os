'use client';

import { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
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
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from '../actions/content.actions';
import { useRouter } from 'next/navigation';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import { ImageUploader } from '@/components/shared/image-uploader';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
  created_at: string;
}

interface GalleryFormData {
  title: string;
  image_url: string;
  description: string;
}

const emptyForm: GalleryFormData = {
  title: '',
  image_url: '',
  description: '',
};

interface GalleryFormProps {
  initialData?: GalleryFormData & { id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

function GalleryForm({ initialData, onSuccess, onCancel }: GalleryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!imageUrl.trim()) {
      setError('Gambar wajib diunggah atau diinput via URL.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    // Append the imageUrl state because it changes outside standard inputs
    formData.set('image_url', imageUrl);

    startTransition(async () => {
      const result = initialData?.id
        ? await updateGalleryItemAction(initialData.id, formData)
        : await createGalleryItemAction(formData);

      if (!result.success) {
        setError(result.error || 'Terjadi kesalahan saat menyimpan data');
      } else {
        onSuccess();
      }
    });
  };

  const data = initialData ?? emptyForm;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="gal-title">Judul Foto *</Label>
        <Input 
          id="gal-title" 
          name="title" 
          defaultValue={data.title} 
          required 
          placeholder="e.g. Workshop Desain UI/UX" 
        />
      </div>

      <div className="space-y-2">
        <ImageUploader
          label="Media Gambar *"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gal-description">Deskripsi Singkat</Label>
        <Textarea 
          id="gal-description" 
          name="description" 
          defaultValue={data.description} 
          placeholder="Ceritakan tentang momen/foto ini..." 
          rows={3} 
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 leading-relaxed">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>Batal</Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          {isPending && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          {isPending ? 'Menyimpan...' : initialData?.id ? 'Simpan Perubahan' : 'Tambah Foto'}
        </Button>
      </div>
    </form>
  );
}

export function GalleryCMS({ initialItems }: { initialItems: GalleryItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    
    startTransition(async () => {
      const result = await deleteGalleryItemAction(itemToDelete.id);
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        setDeleteConfirmOpen(false);
        setError(result.error || 'Gagal menghapus item galeri.');
      }
    });
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    router.refresh();
    // Re-fetch local state
    // In Next.js client component router.refresh updates RSC props, but local state needs sync:
    // So we can let the page do a full router refresh or we can reload path
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div className="flex items-center gap-3">
          <Link href="/portal/cms">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5.5 h-5.5 text-primary" />
              Kelola Galeri Publik
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{items.length} foto/visual terdaftar</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="rounded-xl font-semibold gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Tambah Foto
            </Button>
          } />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</DialogTitle>
            </DialogHeader>
            <GalleryForm
              initialData={editingItem ? {
                id: editingItem.id,
                title: editingItem.title,
                image_url: editingItem.image_url,
                description: editingItem.description || '',
              } : undefined}
              onSuccess={handleSuccess}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 leading-relaxed">
          {error}
        </p>
      )}

      {/* Grid List */}
      {items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-card/45 backdrop-blur-xs">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada foto di galeri.</p>
          <p className="text-xs text-muted-foreground/75 mt-1">Unggah visual pertama Anda menggunakan tombol Tambah Foto di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="glow-card relative flex flex-col rounded-2xl border dark:border-slate-800 bg-card hover:border-primary/25 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Image Preview Container */}
              <div className="h-44 w-full bg-muted/20 relative overflow-hidden border-b border-border/50 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                />
              </div>

              {/* Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-1">{item.title}</h3>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/50 leading-relaxed">Tidak ada deskripsi</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => {
                      setEditingItem(item);
                      setIsDialogOpen(true);
                    }}
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => confirmDelete(item)}
                    disabled={isPending}
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Foto Galeri"
        description={`Apakah Anda yakin ingin menghapus foto "${itemToDelete?.title || 'Tanpa Judul'}" dari galeri publik?`}
      />
    </div>
  );
}
