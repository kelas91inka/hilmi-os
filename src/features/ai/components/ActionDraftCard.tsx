'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIContext } from '../contexts/AIContext';
import { 
  Calendar, 
  Check, 
  X, 
  Tag, 
  AlertCircle, 
  Coins, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  FileText,
  FolderKanban,
  Trophy,
  Newspaper
} from 'lucide-react';
import { confirmActionAction } from '../actions/ai.actions';

interface ActionDraftCardProps {
  toolCallId: string;
  type: 'create_task' | 'update_task' | 'create_goal' | 'update_goal' | 'create_diary_entry' | 'create_finance_transaction' | 'update_task_status' | 'create_note' | 'create_project' | 'update_project' | 'create_achievement' | 'create_cms_post' | 'edit_cms_post' | 'publish_post' | 'delete_task';
  draft: any;
  onConfirmSuccess: (toolCallId: string, message: string) => void;
  onCancel: (toolCallId: string) => void;
  isFloating?: boolean;
}

export function ActionDraftCard({
  toolCallId,
  type,
  draft: rawDraft,
  onConfirmSuccess,
  onCancel,
  isFloating = false,
}: ActionDraftCardProps) {
  const draft = rawDraft || {};
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { setIsOpen: setAIOpen } = useAIContext();

  // Module navigation map
  const MODULE_ROUTES: Record<string, string> = {
    create_task: '/portal/tasks',
    update_task: '/portal/tasks',
    create_goal: '/portal/goals',
    update_goal: '/portal/goals',
    create_diary_entry: '/portal/diary',
    create_finance_transaction: '/portal/finance',
    update_task_status: '/portal/tasks',
    create_note: '/portal/notes',
    create_project: '/portal/projects',
    update_project: '/portal/projects',
    create_achievement: '/portal/cms',
    create_cms_post: '/portal/cms',
    delete_task: '/portal/tasks',
  };

  const MODULE_LABELS: Record<string, string> = {
    create_task: 'Tasks',
    update_task: 'Tasks',
    create_goal: 'Goals',
    update_goal: 'Goals',
    create_diary_entry: 'Diary',
    create_finance_transaction: 'Finance',
    update_task_status: 'Tasks',
    create_note: 'Notes',
    create_project: 'Projects',
    update_project: 'Projects',
    create_achievement: 'CMS',
    create_cms_post: 'CMS Posts',
    delete_task: 'Tasks',
  };

  const handleConfirm = async () => {
    setIsPending(true);
    setErrorMsg(null);
    try {
      const res = await confirmActionAction(type, draft);
      if (res.success) {
        let msg = 'Aksi berhasil dieksekusi.';
        if (type === 'create_task') msg = `✅ Task "${draft.title}" berhasil dibuat.`;
        if (type === 'update_task') msg = `✅ Task berhasil diperbarui.`;
        if (type === 'create_goal') msg = `✅ Goal "${draft.title}" berhasil dibuat.`;
        if (type === 'update_goal') msg = `✅ Goal berhasil diperbarui.`;
        if (type === 'create_diary_entry') msg = `✅ Entri jurnal berhasil dibuat.`;
        if (type === 'create_finance_transaction') {
          const typeStr = draft.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
          msg = `✅ ${typeStr} sebesar Rp ${Number(draft.amount).toLocaleString('id-ID')} berhasil dicatat.`;
        }
        if (type === 'update_task_status') msg = `✅ Status task berhasil diubah menjadi "${draft.status}".`;
        if (type === 'create_note') msg = `✅ Note "${draft.title}" berhasil dibuat.`;
        if (type === 'create_project') msg = `✅ Project "${draft.title}" berhasil dibuat.`;
        if (type === 'update_project') msg = `✅ Project berhasil diperbarui.`;
        if (type === 'create_achievement') msg = `✅ Achievement "${draft.title}" berhasil dicatat.`;
        if (type === 'create_cms_post') msg = `✅ Post "${draft.title}" berhasil dibuat.`;
        if (type === 'edit_cms_post') msg = `✅ Post berhasil diperbarui.`;
        if (type === 'publish_post') msg = `✅ Post berhasil dipublikasikan.`;
        if (type === 'delete_task') msg = `✅ Task berhasil dihapus.`;
        
        onConfirmSuccess(toolCallId, msg);
        
        // Navigate to the relevant module after a short delay, with prefill data
        const route = MODULE_ROUTES[type];
        if (route) {
          setTimeout(() => {
            if (isFloating) {
              setAIOpen(false);
            }
            // Encode draft data as URL param for module page to prefill forms
            try {
              const prefill = encodeURIComponent(JSON.stringify({ type, ...draft }));
              router.push(`${route}?ai_prefill=${prefill}`);
            } catch {
              router.push(route);
            }
          }, 800);
        }
      } else {
        setErrorMsg('error' in res ? res.error : 'Gagal mengeksekusi aksi.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsPending(false);
    }
  };

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="border border-border/80 bg-card rounded-2xl p-4 my-3 shadow-md max-w-md w-full relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary" />
      
      <div className="flex items-start gap-3 mt-1">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            {type === 'create_task' && <Briefcase className="w-5 h-5" />}
            {type === 'update_task' && <Briefcase className="w-5 h-5" />}
            {type === 'create_goal' && <Tag className="w-5 h-5" />}
            {type === 'update_goal' && <Tag className="w-5 h-5" />}
            {type === 'create_diary_entry' && <BookOpen className="w-5 h-5" />}
            {type === 'create_finance_transaction' && <Coins className="w-5 h-5" />}
            {type === 'update_task_status' && <AlertCircle className="w-5 h-5" />}
            {type === 'create_note' && <FileText className="w-5 h-5" />}
            {type === 'create_project' && <FolderKanban className="w-5 h-5" />}
            {type === 'update_project' && <FolderKanban className="w-5 h-5" />}
            {type === 'create_achievement' && <Trophy className="w-5 h-5" />}
            {type === 'create_cms_post' && <Newspaper className="w-5 h-5" />}
            {type === 'edit_cms_post' && <FileText className="w-5 h-5" />}
            {type === 'publish_post' && <Newspaper className="w-5 h-5" />}
            {type === 'delete_task' && <AlertCircle className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <h4 className="font-semibold text-sm text-foreground leading-snug">
              {type === 'create_task' && 'Konfirmasi Task Baru'}
              {type === 'update_task' && 'Konfirmasi Update Task'}
              {type === 'create_goal' && 'Konfirmasi Goal Baru'}
              {type === 'update_goal' && 'Konfirmasi Update Goal'}
              {type === 'create_diary_entry' && 'Konfirmasi Entri Jurnal'}
              {type === 'create_finance_transaction' && 'Konfirmasi Transaksi Keuangan'}
              {type === 'update_task_status' && 'Konfirmasi Update Status Task'}
              {type === 'create_note' && 'Konfirmasi Note Baru'}
              {type === 'create_project' && 'Konfirmasi Project Baru'}
              {type === 'update_project' && 'Konfirmasi Update Project'}
              {type === 'create_achievement' && 'Konfirmasi Achievement Baru'}
              {type === 'create_cms_post' && 'Konfirmasi Post Baru'}
              {type === 'edit_cms_post' && 'Konfirmasi Edit Post'}
              {type === 'publish_post' && 'Konfirmasi Publish Post'}
              {type === 'delete_task' && '⚠️ Konfirmasi Hapus Task'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">Tinjau draf aksi di bawah ini sebelum menyimpan.</p>
          </div>

          {/* Draft Details */}
          <div className="bg-muted/40 rounded-xl p-3 text-xs space-y-2 border border-border/40">
            {type === 'create_task' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Judul Task:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.description && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Deskripsi:</span>
                    <span className="text-foreground break-words">{draft.description}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                  {draft.priority && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Prioritas:</span>
                      <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4 font-semibold border-primary/25 text-primary bg-primary/5">
                        {draft.priority}
                      </Badge>
                    </div>
                  )}
                  {draft.due_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary/70" />
                      <span>Batas: {draft.due_date}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'create_goal' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Nama Goal:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.description && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Deskripsi:</span>
                    <span className="text-foreground break-words">{draft.description}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                  {draft.goal_type && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Tipe:</span>
                      <Badge variant="secondary" className="capitalize text-[10px] py-0 px-1.5 h-4">
                        {draft.goal_type}
                      </Badge>
                    </div>
                  )}
                  {draft.category && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Kategori:</span>
                      <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">
                        {draft.category}
                      </Badge>
                    </div>
                  )}
                  {draft.target_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target: {draft.target_date}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'create_diary_entry' && (
              <>
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Mood hari ini:</span>
                  <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">
                    {draft.mood || 'neutral'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Isi Refleksi:</span>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed break-words">{draft.content}</p>
                </div>
              </>
            )}

            {type === 'create_finance_transaction' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jenis Transaksi:</span>
                  <Badge 
                    className={`capitalize text-[10px] py-0 px-1.5 h-4 font-semibold ${
                      draft.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' 
                        : 'bg-destructive/10 text-destructive border-destructive/25'
                    }`}
                    variant="outline"
                  >
                    {draft.type === 'income' ? (
                      <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Pemasukan</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> Pengeluaran</span>
                    )}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between py-1 border-y border-border/40 my-1">
                  <span className="text-muted-foreground">Jumlah:</span>
                  <span className={`text-base font-bold ${draft.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    {formatRupiah(Number(draft.amount))}
                  </span>
                </div>
                {draft.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kategori:</span>
                    <span className="font-medium text-foreground capitalize">{draft.category}</span>
                  </div>
                )}
                {draft.description && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">Keterangan:</span>
                    <span className="text-foreground break-words">{draft.description}</span>
                  </div>
                )}
                {draft.transaction_date && (
                  <div className="flex justify-between text-muted-foreground pt-0.5">
                    <span>Tanggal:</span>
                    <span>{draft.transaction_date}</span>
                  </div>
                )}
              </>
            )}

            {type === 'update_task_status' && (
              <>
                <div>
                  <span className="text-muted-foreground">Task ID:</span>
                  <code className="text-[10px] block truncate font-mono bg-muted p-1 rounded mt-0.5 border text-muted-foreground">{draft.task_id}</code>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Status Baru:</span>
                  <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4 font-semibold text-primary border-primary/20 bg-primary/5">
                    {draft.status.replace('_', ' ')}
                  </Badge>
                </div>
              </>
            )}

            {type === 'create_note' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Judul Note:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.content && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Isi:</span>
                    <span className="text-foreground break-words line-clamp-3">{draft.content}</span>
                  </div>
                )}
                {draft.is_favorite && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-xs">Favorit</span>
                  </div>
                )}
              </>
            )}

            {type === 'create_project' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Nama Project:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.description && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Deskripsi:</span>
                    <span className="text-foreground break-words">{draft.description}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                  {draft.status && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">
                        {draft.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  {draft.start_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{draft.start_date} — {draft.end_date || '...'}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'create_achievement' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Pencapaian:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.description && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Deskripsi:</span>
                    <span className="text-foreground break-words">{draft.description}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                  {draft.category && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Kategori:</span>
                      <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">
                        {draft.category}
                      </Badge>
                    </div>
                  )}
                  {draft.achievement_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{draft.achievement_date}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'create_cms_post' && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Judul Post:</span>
                  <span className="font-semibold text-foreground break-words">{draft.title}</span>
                </div>
                {draft.body && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Konten:</span>
                    <span className="text-foreground break-words line-clamp-3">{draft.body}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-muted-foreground">Tipe:</span>
                  <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4 font-semibold">
                    {draft.post_type?.replace('_', ' ')}
                  </Badge>
                </div>
              </>
            )}

            {type === 'edit_cms_post' && (
              <>
                <div>
                  <span className="text-muted-foreground">Post ID:</span>
                  <code className="text-[10px] block truncate font-mono bg-muted p-1 rounded mt-0.5 border text-muted-foreground">{draft.post_id}</code>
                </div>
                {draft.title && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Judul Baru:</span>
                    <span className="font-semibold text-foreground break-words">{draft.title}</span>
                  </div>
                )}
                {draft.body && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Konten Baru:</span>
                    <span className="text-foreground break-words line-clamp-3">{draft.body}</span>
                  </div>
                )}
                {draft.post_type && (
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-muted-foreground">Tipe:</span>
                    <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 h-4">
                      {draft.post_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {type === 'publish_post' && (
              <>
                <div>
                  <span className="text-muted-foreground">Post ID:</span>
                  <code className="text-[10px] block truncate font-mono bg-muted p-1 rounded mt-0.5 border text-muted-foreground">{draft.post_id}</code>
                </div>
                <div className="flex items-center gap-2 pt-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Post akan dipublikasikan</span>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <p className="text-[11px] text-destructive font-medium bg-destructive/5 p-2 rounded-lg border border-destructive/10">
              ⚠️ {errorMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              size="sm"
              className="flex-1 h-9 rounded-xl text-xs gap-1 font-semibold shadow-sm"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Simpan Aksi
            </Button>
            <Button
              onClick={() => onCancel(toolCallId)}
              disabled={isPending}
              size="sm"
              variant="outline"
              className="h-9 rounded-xl text-xs gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Batalkan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
