'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateCommentStatusAction, deleteCommentAction } from '../actions/posts.actions';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { MessageSquare, Check, X, Trash2, Calendar, User, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface Comment {
  id: string;
  post_id: string;
  display_name: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  posts?: {
    title: string | null;
    slug: string;
  } | null;
}

interface CommentModerationProps {
  initialComments: Comment[];
}

export function CommentModeration({ initialComments }: CommentModerationProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await updateCommentStatusAction(id, status);
      if (result.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
        router.refresh();
      } else {
        alert(result.error || 'Gagal merubah status komentar');
      }
    });
  };

  const confirmDelete = (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!commentToDelete) return;
    const result = await deleteCommentAction(commentToDelete.id);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
      router.refresh();
    } else {
      setDeleteConfirmOpen(false);
      alert(result.error || 'Gagal menghapus komentar');
    }
  };

  const filteredComments = comments.filter((c) => c.status === activeTab);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/65 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5.5 h-5.5 text-primary" />
            Moderasi Komentar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Setujui atau tolak komentar dari pengunjung publik pada post Anda.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border rounded-xl overflow-hidden bg-muted/40 p-1 shrink-0 self-stretch sm:self-auto">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => {
            const count = comments.filter((c) => c.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize relative flex items-center gap-1.5',
                  activeTab === tab
                    ? 'bg-background text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'pending' ? 'Tertunda' : tab === 'approved' ? 'Disetujui' : 'Ditolak'}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full shrink-0',
                    tab === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                    tab === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-destructive/10 text-destructive'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment List */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-card/45 backdrop-blur-xs">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada komentar di tab ini.</p>
          <p className="text-xs text-muted-foreground/75 mt-1">Komentar pengunjung akan masuk ke tab Tertunda terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="glow-card relative flex flex-col gap-4 p-5 rounded-2xl border dark:border-slate-800 bg-card/45 backdrop-blur-xs hover:border-primary/25 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 text-foreground font-bold">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {comment.display_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(comment.created_at), 'd MMMM yyyy HH:mm', { locale: localeId })}
                    </span>
                  </div>
                  
                  {comment.posts && (
                    <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                      <span>Post:</span>
                      <a
                        href={`/posts/${comment.posts.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {comment.posts.title || `Post (${comment.posts.slug})`}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {comment.status !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(comment.id, 'approved')}
                      disabled={isPending}
                      className="h-8 rounded-lg text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-600 border-emerald-500/20 gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Setujui
                    </Button>
                  )}
                  
                  {comment.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(comment.id, 'rejected')}
                      disabled={isPending}
                      className="h-8 rounded-lg text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-600 border-amber-500/20 gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Tolak
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(comment)}
                    disabled={isPending}
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-foreground bg-muted/30 p-3.5 rounded-xl border border-border/50">
                {comment.body}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Komentar"
        description={`Apakah Anda yakin ingin menghapus komentar dari "${commentToDelete?.display_name || 'Anonymous'}" secara permanen?`}
      />
    </div>
  );
}
