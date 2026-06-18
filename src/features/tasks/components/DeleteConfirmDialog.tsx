'use client';

import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Hapus Tugas',
  description = 'Tindakan ini tidak dapat dibatalkan. Tugas akan dihapus secara permanen.',
}: DeleteConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isPending) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" />
      <div className="relative w-full max-w-sm bg-card border rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-2 duration-200">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>

        <h3 className="text-base font-semibold text-center mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            id="confirm-delete-btn"
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
            ) : (
              <><Trash2 className="w-4 h-4" /> Hapus</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
