'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createTaskAction } from '@/features/tasks/actions/task.actions';
import { createNoteAction } from '@/features/notes/actions/note.actions';
import { createGoalAction } from '@/features/goals/actions/goal.actions';
import { upsertDiaryEntryAction } from '@/features/diary/actions/diary.actions';
import { TASK_PRIORITY, TaskPriority } from '@/features/tasks/types/task.types';
import type { GoalType } from '@/features/goals/types/goal.types';
import {
  CheckSquare, BookOpen, X, Zap, Target, BookHeart,
  Calendar, ChevronDown, Loader2,
} from 'lucide-react';

type CaptureMode = 'task' | 'note' | 'goal' | 'diary';

interface QuickCaptureModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const [mode, setMode] = useState<CaptureMode>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TASK_PRIORITY.NORMAL);
  const [dueDate, setDueDate] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('bulanan');
  const [goalCategory, setGoalCategory] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setPriority(TASK_PRIORITY.NORMAL);
      setDueDate('');
      setGoalType('bulanan');
      setGoalCategory('');
      setSuccess(false);
      setError(null);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);

    startTransition(async () => {
      if (mode === 'task') {
        const result = await createTaskAction({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status: 'belum_dimulai',
          due_date: dueDate || null,
          project_id: null,
          goal_id: null,
          tags: [],
        });
        if (result.success) {
          setSuccess(true);
          setTimeout(onClose, 800);
        } else {
          setError(result.error || 'Gagal membuat tugas');
        }
      } else if (mode === 'goal') {
        const result = await createGoalAction({
          title: title.trim(),
          description: description.trim() || null,
          goal_type: goalType,
          status: 'active',
          target_date: dueDate || null,
          progress: 0,
          category: goalCategory.trim() || null,
        });
        if (result.success) {
          setSuccess(true);
          setTimeout(onClose, 800);
        } else {
          setError(result.error || 'Gagal membuat tujuan');
        }
      } else if (mode === 'diary') {
        const result = await upsertDiaryEntryAction({
          title: title.trim(),
          content: description.trim() || '',
          entry_date: new Date().toISOString().split('T')[0],
          mood: 'neutral',
        });
        if (result.success) {
          setSuccess(true);
          setTimeout(onClose, 800);
        } else {
          setError(result.error || 'Gagal membuat jurnal');
        }
      } else {
        const result = await createNoteAction({
          title: title.trim(),
          content: description.trim() || '',
          excerpt: description.trim().slice(0, 200) || null,
          is_favorite: false,
        });
        if (result.success) {
          setSuccess(true);
          setTimeout(onClose, 800);
        } else {
          setError(result.error || 'Gagal membuat catatan');
        }
      }
    });
  };

  const PRIORITY_OPTS = [
    { value: TASK_PRIORITY.RENDAH, label: 'Rendah', color: 'text-muted-foreground' },
    { value: TASK_PRIORITY.NORMAL, label: 'Normal', color: 'text-blue-500' },
    { value: TASK_PRIORITY.TINGGI, label: 'Tinggi', color: 'text-orange-500' },
    { value: TASK_PRIORITY.KRITIS, label: 'Kritis', color: 'text-red-500' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-sm">Quick Capture</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 px-5 pt-4">
          <button
            onClick={() => setMode('task')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'task'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tugas
          </button>
          <button
            onClick={() => setMode('note')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'note'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Catatan
          </button>
          <button
            onClick={() => setMode('goal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'goal'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Tujuan
          </button>
          <button
            onClick={() => setMode('diary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === 'diary'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BookHeart className="w-3.5 h-3.5" />
            Jurnal
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-3">
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder={mode === 'task' ? 'Apa yang perlu dikerjakan?' : mode === 'goal' ? 'Apa tujuan yang ingin dicapai?' : mode === 'diary' ? 'Judul jurnal hari ini...' : 'Judul catatan...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-muted/50 border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
              required
            />
          </div>

          <div>
            <textarea
              placeholder={mode === 'task' ? 'Deskripsi (opsional)...' : mode === 'goal' ? 'Mengapa tujuan ini penting?' : mode === 'diary' ? 'Tulis isi jurnal hari ini...' : 'Isi catatan...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm bg-muted/50 border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Task-only fields */}
          {mode === 'task' && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs bg-muted/50 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                >
                  {PRIORITY_OPTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Calendar className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs bg-muted/50 border rounded-lg pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* Goal-only fields */}
          {mode === 'goal' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as GoalType)}
                    className="w-full text-xs bg-muted/50 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                  >
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                    <option value="tahunan">Tahunan</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <Calendar className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Target tanggal"
                    className="w-full text-xs bg-muted/50 border rounded-lg pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Kategori (opsional)... Misal: Finansial, Karir"
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full text-xs bg-muted/50 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <p className="text-xs text-green-600 bg-green-500/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
              ✓ {mode === 'task' ? 'Tugas berhasil dibuat!' : mode === 'goal' ? 'Tujuan berhasil dibuat!' : 'Catatan berhasil dibuat!'}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !title.trim() || success}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Simpan {mode === 'task' ? 'Tugas' : mode === 'goal' ? 'Tujuan' : 'Catatan'}
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Tekan <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> untuk tutup
          </p>
        </form>
      </div>
    </div>
  );
}
