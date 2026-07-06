'use client';

/**
 * GlobalModalContainer — Portal-based v4
 *
 * FINAL FIX: Menggunakan AIActionModal (React createPortal) bukan @base-ui Dialog.
 * @base-ui Dialog memerlukan prior user click untuk membuka secara programmatic,
 * yang tidak sesuai dengan kebutuhan AI-triggered forms.
 *
 * AIActionModal selalu bekerja karena render langsung ke document.body via portal.
 */

import { useEffect, useState } from 'react';
import { useGlobalModal } from '../contexts/GlobalModalContext';
import { AIActionModal } from './AIActionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { confirmActionAction } from '../actions/ai.actions';
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TASK_PRIORITIES = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'normal', label: 'Normal' },
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'kritis', label: 'Kritis' },
];

const TASK_STATUSES = [
  { value: 'belum_dimulai', label: 'Belum Dimulai' },
  { value: 'sedang_dikerjakan', label: 'Sedang Dikerjakan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditunda', label: 'Ditunda' },
];

const GOAL_TYPES = [
  { value: 'mingguan', label: 'Mingguan' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'tahunan', label: 'Tahunan' },
  { value: 'lifetime', label: 'Seumur Hidup' },
];

const TX_CATEGORIES = [
  'Salary', 'Food & Dining', 'Transportation', 'Housing', 'Utilities',
  'Entertainment', 'Shopping', 'Health', 'Education', 'Other',
];

const MOODS = [
  { value: 'happy', label: '😊 Senang' },
  { value: 'neutral', label: '😐 Netral' },
  { value: 'sad', label: '😢 Sedih' },
  { value: 'productive', label: '⚡ Produktif' },
  { value: 'stressed', label: '😰 Stres' },
  { value: 'tired', label: '😴 Lelah' },
  { value: 'sick', label: '🤒 Sakit' },
];

export function GlobalModalContainer() {
  const { activeModal, closeModal } = useGlobalModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state — reset when modal type changes
  const [formData, setFormData] = useState<Record<string, any>>({});

  const today = new Date().toISOString().split('T')[0];
  const type = activeModal?.type ?? null;
  const draft = activeModal?.draft ?? {};

  // Sync draft into form when modal opens
  useEffect(() => {
    if (activeModal) {
      setFormData(activeModal.draft ?? {});
      setError(null);
      setSuccess(false);
    }
  }, [activeModal?.type, activeModal?.draft]);

  const update = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    if (!type) return;
    setLoading(true);
    setError(null);
    try {
      const result = await confirmActionAction(type, formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          closeModal();
          setSuccess(false);
          router.refresh();
        }, 800);
      } else {
        setError(result.error || 'Terjadi kesalahan.');
      }
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-2 justify-end pt-3 border-t border-border/50 mt-3">
      <Button variant="outline" onClick={closeModal} disabled={loading}>
        Batal
      </Button>
      <Button onClick={handleConfirm} disabled={loading || success}>
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
        ) : success ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Tersimpan!</>
        ) : (
          'Konfirmasi & Simpan'
        )}
      </Button>
    </div>
  );

  // ── Create Task ──────────────────────────────────────────────────────────────
  if (type === 'create_task') {
    return (
      <AIActionModal open title="Buat Tugas Baru" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul Tugas *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Judul tugas..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Detail tugas (opsional)..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={formData.priority || 'normal'} onValueChange={(v) => update('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => update('due_date', e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Update Task Status ───────────────────────────────────────────────────────
  if (type === 'update_task_status') {
    return (
      <AIActionModal open title="Update Status Tugas" onClose={closeModal}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Update status tugas <span className="font-medium text-foreground">{draft.task_id}</span>
          </p>
          <div className="space-y-1.5">
            <Label>Status Baru</Label>
            <Select value={formData.status || draft.status || 'belum_dimulai'} onValueChange={(v) => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Update Task ──────────────────────────────────────────────────────────────
  if (type === 'update_task') {
    return (
      <AIActionModal open title="Edit Tugas" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul Tugas</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Judul tugas..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={formData.priority || 'normal'} onValueChange={(v) => update('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status || 'belum_dimulai'} onValueChange={(v) => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Delete Task ──────────────────────────────────────────────────────────────
  if (type === 'delete_task') {
    return (
      <AIActionModal open title="Hapus Tugas" onClose={closeModal}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <p className="text-sm font-medium text-foreground bg-muted rounded-lg p-2">
            ID: {draft.task_id}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-3 border-t border-border/50 mt-3">
            <Button variant="outline" onClick={closeModal} disabled={loading}>Batal</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading || success}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
            </Button>
          </div>
        </div>
      </AIActionModal>
    );
  }

  // ── Create Goal ──────────────────────────────────────────────────────────────
  if (type === 'create_goal') {
    return (
      <AIActionModal open title="Buat Goal Baru" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul Goal *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Judul goal..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipe Goal</Label>
              <Select value={formData.goal_type || 'bulanan'} onValueChange={(v) => update('goal_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target Tanggal</Label>
              <Input
                type="date"
                value={formData.target_date || ''}
                onChange={(e) => update('target_date', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Input
              value={formData.category || ''}
              onChange={(e) => update('category', e.target.value)}
              placeholder="Karir, Kesehatan, Belajar..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Finance Transaction ────────────────────────────────────────────────
  if (type === 'create_finance_transaction') {
    return (
      <AIActionModal open title="Tambah Transaksi" onClose={closeModal}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select value={formData.type || 'expense'} onValueChange={(v) => update('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={formData.transaction_date || today}
                onChange={(e) => update('transaction_date', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Jumlah (IDR) *</Label>
            <Input
              type="number"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => update('amount', Number(e.target.value))}
              placeholder="Contoh: 150000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={formData.category || 'Other'} onValueChange={(v) => update('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TX_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Input
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Opsional..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Diary Entry ────────────────────────────────────────────────────────
  if (type === 'create_diary_entry') {
    return (
      <AIActionModal open title="Tambah Entri Jurnal" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mood</Label>
            <Select value={formData.mood || 'neutral'} onValueChange={(v) => update('mood', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Catatan *</Label>
            <Textarea
              value={formData.content || ''}
              onChange={(e) => update('content', e.target.value)}
              rows={5}
              placeholder="Tulis refleksi hari ini..."
              className="resize-none"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Note ───────────────────────────────────────────────────────────────
  if (type === 'create_note') {
    return (
      <AIActionModal open title="Buat Note Baru" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Judul note..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Konten</Label>
            <Textarea
              value={formData.content || ''}
              onChange={(e) => update('content', e.target.value)}
              rows={4}
              placeholder="Isi note..."
              className="resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Project ─────────────────────────────────────────────────────────
  if (type === 'create_project') {
    return (
      <AIActionModal open title="Buat Project Baru" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul Project *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Nama project..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Mulai</Label>
              <Input type="date" value={formData.start_date || today} onChange={(e) => update('start_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Selesai</Label>
              <Input type="date" value={formData.end_date || ''} onChange={(e) => update('end_date', e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Habit ─────────────────────────────────────────────────────────────
  if (type === 'create_habit') {
    return (
      <AIActionModal open title="Buat Habit Baru" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama Habit *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Nama habit..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Input
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Opsional..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Frekuensi</Label>
            <Select value={formData.target_frequency || 'daily'} onValueChange={(v) => update('target_frequency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Setiap Hari</SelectItem>
                <SelectItem value="weekly">Setiap Minggu</SelectItem>
                <SelectItem value="monthly">Setiap Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create Achievement ─────────────────────────────────────────────────────
  if (type === 'create_achievement') {
    return (
      <AIActionModal open title="Tambah Pencapaian" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul Pencapaian *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Apa yang berhasil dicapai?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Input
                value={formData.category || 'Personal'}
                onChange={(e) => update('category', e.target.value)}
                placeholder="Personal, Karir..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={formData.achievement_date || today}
                onChange={(e) => update('achievement_date', e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Create / Edit CMS Post ────────────────────────────────────────────────
  if (type === 'create_cms_post' || type === 'edit_cms_post') {
    return (
      <AIActionModal open title={type === 'edit_cms_post' ? 'Edit Post' : 'Buat Post Baru'} onClose={closeModal} maxWidth="max-w-lg">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Judul post..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tipe Post</Label>
            <Select value={formData.post_type || 'article'} onValueChange={(v) => update('post_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Artikel</SelectItem>
                <SelectItem value="thread">Thread</SelectItem>
                <SelectItem value="image">Image Post</SelectItem>
                <SelectItem value="video">Video Post</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Konten</Label>
            <Textarea
              value={formData.body || ''}
              onChange={(e) => update('body', e.target.value)}
              rows={5}
              placeholder="Isi konten..."
              className="resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Update Goal ──────────────────────────────────────────────────────────────
  if (type === 'update_goal') {
    return (
      <AIActionModal open title="Update Goal" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Progress (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.progress ?? ''}
              onChange={(e) => update('progress', Number(e.target.value))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── Update Project ──────────────────────────────────────────────────────────
  if (type === 'update_project') {
    return (
      <AIActionModal open title="Update Project" onClose={closeModal}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  // ── publish_post ────────────────────────────────────────────────────────────
  if (type === 'publish_post') {
    return (
      <AIActionModal open title="Publish Post" onClose={closeModal}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin mempublish post ini?
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {footer}
        </div>
      </AIActionModal>
    );
  }

  return null;
}
