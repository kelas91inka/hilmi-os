'use client';

/**
 * GlobalCmsPostDialog
 * A lightweight dialog for creating or editing a CMS post via AI pre-fill.
 * For new posts: calls createPostDraftAction + updatePostAction (to set body).
 * Opened by GlobalModalContainer for action types 'create_cms_post' | 'edit_cms_post'.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Newspaper, Loader2, Save, ExternalLink } from 'lucide-react';
import { createPostDraftAction, updatePostAction } from '@/features/cms/actions/posts.actions';

interface GlobalCmsPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    post_id: string | null;
    title: string;
    body: string;
    post_type: string;
  };
  onSuccess: () => void;
}

const POST_TYPES = [
  { value: 'article', label: '📰 Artikel' },
  { value: 'thread', label: '🧵 Thread' },
  { value: 'text', label: '📝 Teks' },
  { value: 'image', label: '🖼️ Gambar' },
  { value: 'video', label: '🎬 Video' },
  { value: 'project_update', label: '🔧 Update Project' },
];

export function GlobalCmsPostDialog({ open, onOpenChange, initialData, onSuccess }: GlobalCmsPostDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [body, setBody] = useState(initialData.body);
  const [postType, setPostType] = useState(initialData.post_type || 'article');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Judul post tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (initialData.post_id) {
        // Edit existing post
        const result = await updatePostAction(initialData.post_id, {
          title: title.trim(),
          body: body.trim() || null,
        }, []);
        if (!result.success) throw new Error(result.error);
        onSuccess();
        onOpenChange(false);
      } else {
        // Create new draft post
        const createResult = await createPostDraftAction(title.trim(), postType);
        if (!createResult.success || !createResult.data) throw new Error(createResult.error);
        const postId = createResult.data.id;
        // Set body if provided
        if (body.trim()) {
          await updatePostAction(postId, { body: body.trim() }, []);
        }
        setCreatedPostId(postId);
        onSuccess();
        // Optionally open editor
        router.push(`/portal/cms?post_id=${postId}`);
        onOpenChange(false);
      }
    } catch (e: any) {
      setError(e.message || 'Gagal membuat post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            {initialData.post_id ? 'Edit Post CMS' : 'Buat Post CMS Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="global-cms-type">Tipe Post</Label>
            <Select value={postType} onValueChange={(val) => setPostType(val || 'article')}>
              <SelectTrigger id="global-cms-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="global-cms-title">Judul</Label>
            <Input
              id="global-cms-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Judul post..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="global-cms-body">Konten / Body</Label>
            <Textarea
              id="global-cms-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={7}
              placeholder="Isi post... (bisa diedit lebih lanjut di editor penuh)"
              className="resize-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Post akan dibuat sebagai <strong>Draft</strong>. Kamu bisa edit dan publish dari halaman CMS.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
