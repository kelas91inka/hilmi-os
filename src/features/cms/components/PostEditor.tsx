'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteEditor } from '@/features/notes/components/NoteEditor';
import { ImageUploader } from '@/components/shared/image-uploader';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import { updatePostAction, deletePostAction } from '../actions/posts.actions';
import { ArrowLeft, Save, Trash2, ExternalLink, Trash, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
}

interface PostMediaItem {
  id?: string;
  media_type: 'image' | 'video' | 'embed';
  url: string;
  caption: string | null;
  sort_order: number;
}

interface Post {
  id: string;
  post_type: string;
  title: string | null;
  slug: string | null;
  body: string | null;
  excerpt: string | null;
  cover_image: string | null;
  reading_time: number | null;
  project_id: string | null;
  published: boolean | null;
  featured: boolean | null;
  published_at: string | null;
  post_media?: PostMediaItem[];
}

interface PostEditorProps {
  post: Post;
  projects: Project[];
}

function formatPublishDate(dateStr: string | null) {
  if (!dateStr) return 'now';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'now';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function PostEditor({ post, projects }: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(post.title || '');
  const [slug, setSlug] = useState(post.slug || '');
  const [body, setBody] = useState(post.body || '');
  const [excerpt, setExcerpt] = useState(post.excerpt || '');
  const [coverImage, setCoverImage] = useState(post.cover_image || '');
  const [readingTime, setReadingTime] = useState<string>(post.reading_time?.toString() || '');
  const [projectId, setProjectId] = useState<string>(post.project_id || 'none');
  const [published, setPublished] = useState(!!post.published);
  const [featured, setFeatured] = useState(!!post.featured);

  // Post Media Attachments
  const [mediaList, setMediaList] = useState<PostMediaItem[]>(
    post.post_media ? [...post.post_media].sort((a, b) => a.sort_order - b.sort_order) : []
  );

  const handleSave = () => {
    setError(null);
    setSuccessMsg(null);

    const postData = {
      title: title.trim() || null,
      slug: slug.trim(),
      body: body.trim() || null,
      excerpt: excerpt.trim() || null,
      cover_image: coverImage || null,
      reading_time: readingTime ? parseInt(readingTime, 10) : null,
      project_id: projectId === 'none' ? null : projectId,
      published,
      featured,
    };

    startTransition(async () => {
      const result = await updatePostAction(
        post.id,
        postData,
        mediaList.map((m, index) => ({
          media_type: m.media_type,
          url: m.url,
          caption: m.caption || null,
          sort_order: index,
        }))
      );

      if (!result.success) {
        setError(result.error || 'Gagal menyimpan post');
      } else {
        setSuccessMsg('Post berhasil disimpan!');
        router.refresh();
      }
    });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const result = await deletePostAction(post.id);
    if (!result.success) {
      setError(result.error || 'Gagal menghapus post');
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    } else {
      router.push('/portal/cms');
    }
  };

  const addMediaItem = (type: 'image' | 'video' | 'embed') => {
    setMediaList((prev) => [
      ...prev,
      {
        media_type: type,
        url: '',
        caption: '',
        sort_order: prev.length,
      },
    ]);
  };

  const updateMediaItem = <K extends keyof PostMediaItem>(index: number, key: K, value: PostMediaItem[K]) => {
    setMediaList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const removeMediaItem = (index: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const isArticle = post.post_type === 'article';
  const hasCoverImage = ['article', 'image', 'video', 'mixed'].includes(post.post_type);
  const showProjectSelector = ['project_update', 'mixed', 'article'].includes(post.post_type);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/65 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div className="flex items-center gap-3">
          <Link href="/portal/cms">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight">Edit Post ({post.post_type})</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {post.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {post.published && (
            <Link href={`/posts/${post.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Lihat Publik
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={isDeleting || isPending}
            className="rounded-xl h-9 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Hapus
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="rounded-xl h-9 text-xs font-semibold gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border text-xs leading-relaxed bg-destructive/10 text-destructive border-destructive/20">
          {error}
        </div>
      )}

      {/* Main editor columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-4">
            
            {/* Title field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul post..."
                className="text-sm font-semibold h-11"
              />
            </div>

            {/* Custom inputs per type */}
            {isArticle ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Konten Artikel (Markdown/HTML)</Label>
                <div className="rounded-xl border bg-background overflow-hidden">
                  <NoteEditor
                    content={body}
                    onChange={setBody}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="body" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Isi Catatan / Deskripsi</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ketik konten di sini..."
                  rows={8}
                  className="text-xs leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Section: Post Media (Attachments) */}
          <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Media Lampiran</h3>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => addMediaItem('image')}
                  className="h-7 text-[10px] rounded-lg px-2"
                >
                  + Gambar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => addMediaItem('video')}
                  className="h-7 text-[10px] rounded-lg px-2"
                >
                  + Video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => addMediaItem('embed')}
                  className="h-7 text-[10px] rounded-lg px-2"
                >
                  + Embed
                </Button>
              </div>
            </div>

            {mediaList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">Belum ada media terlampir.</p>
            ) : (
              <div className="space-y-4">
                {mediaList.map((media, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-background/50 relative">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize text-[10px] font-semibold">
                          {media.media_type} #{idx + 1}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMediaItem(idx)}
                          className="h-6 w-6 rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Image/File Uploader vs URL */}
                      {media.media_type === 'image' ? (
                        <ImageUploader
                          value={media.url}
                          onChange={(url) => updateMediaItem(idx, 'url', url)}
                          placeholder="Pilih berkas atau isi URL gambar..."
                        />
                      ) : (
                        <div className="space-y-1">
                          <Label className="text-[10px]">URL Media</Label>
                          <Input
                            value={media.url}
                            onChange={(e) => updateMediaItem(idx, 'url', e.target.value)}
                            placeholder="https://..."
                            className="text-xs h-8"
                          />
                        </div>
                      )}

                      <div className="space-y-1 mt-1">
                        <Label className="text-[10px]">Keterangan Media (Caption)</Label>
                        <Input
                          value={media.caption || ''}
                          onChange={(e) => updateMediaItem(idx, 'caption', e.target.value)}
                          placeholder="e.g. Dokumentasi kegiatan..."
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Metadata */}
        <div className="space-y-6">
          <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-6">
            
            {/* Publishing Settings */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm border-b pb-2">Status & Visibilitas</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="cursor-pointer text-xs font-semibold text-muted-foreground uppercase">Publish Publik</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer text-xs font-semibold text-muted-foreground uppercase">Tampilkan di Utama (Featured)</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                {published
                  ? `Published on ${formatPublishDate(post.published_at)}`
                  : 'Saat ini disimpan sebagai Draf (hanya Anda yang dapat melihat)'}
              </div>
            </div>

            {/* General Meta */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-bold text-sm border-b pb-2">Meta Metadata</h3>
              
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-semibold text-muted-foreground uppercase">Slug URL (Unique)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              {isArticle && (
                <div className="space-y-2">
                  <Label htmlFor="readingTime" className="text-xs font-semibold text-muted-foreground uppercase">Waktu Baca (Menit)</Label>
                  <Input
                    id="readingTime"
                    type="number"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs"
                  />
                </div>
              )}

              {showProjectSelector && (
                <div className="space-y-2">
                  <Label htmlFor="project" className="text-xs font-semibold text-muted-foreground uppercase">Hubungkan ke Proyek</Label>
                  <Select value={projectId} onValueChange={(val) => setProjectId(val ?? 'none')}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Pilih proyek..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">Tidak ada proyek</SelectItem>
                      {projects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id} className="text-xs">
                          {proj.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {hasCoverImage && (
                <div className="space-y-2">
                  <ImageUploader
                    label="Gambar Sampul (Cover)"
                    value={coverImage}
                    onChange={setCoverImage}
                    placeholder="Masukkan URL atau unggah cover..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-xs font-semibold text-muted-foreground uppercase">Kutipan / Ringkasan Singkat</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Tulis ringkasan singkat untuk list preview..."
                  className="text-xs resize-none"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Hapus Post"
        description={`Apakah Anda yakin ingin menghapus post "${post.title || 'Untitled'}" secara permanen? Seluruh data lampiran dan isinya akan hilang.`}
      />
    </div>
  );
}
