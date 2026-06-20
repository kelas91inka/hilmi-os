'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPostDraftAction, deletePostAction } from '../actions/posts.actions';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Plus, Edit, BookOpen, Calendar, ArrowRight, Trash2, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface Post {
  id: string;
  post_type: string;
  title: string | null;
  slug: string;
  body: string | null;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
}

const POST_TYPES = [
  { value: 'article', label: 'Artikel' },
  { value: 'thread', label: 'Thread' },
  { value: 'image', label: 'Galeri Foto' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Catatan Teks' },
  { value: 'project_update', label: 'Update Proyek' },
  { value: 'mixed', label: 'Mixed Media' },
];

const TYPE_LABELS: Record<string, string> = {
  article: 'Artikel',
  thread: 'Thread',
  image: 'Galeri Foto',
  video: 'Video',
  text: 'Catatan Teks',
  project_update: 'Update Proyek',
  mixed: 'Mixed Media',
};

export function PostsManager({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('article');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const handleCreateDraft = async () => {
    setError(null);
    setIsCreating(true);
    const result = await createPostDraftAction(newTitle, newType);
    setIsCreating(false);
    
    if (!result.success || !result.data) {
      setError(result.error || 'Gagal membuat draf');
    } else {
      setIsOpen(false);
      router.push(`/portal/cms/${result.data.id}`);
    }
  };

  const confirmDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!postToDelete) return;
    const result = await deletePostAction(postToDelete.id);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setDeleteConfirmOpen(false);
      setPostToDelete(null);
      router.refresh();
    } else {
      setDeleteConfirmOpen(false);
      alert(result.error || 'Gagal menghapus post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.post_type === activeTab;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/65 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-primary" />
            Pengelola Konten & Post
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buat, sunting, dan kelola seluruh jenis post (Artikel, Thread, Galeri, dll).
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button onClick={() => { setNewTitle(''); setNewType('article'); setError(null); setIsOpen(true); }} className="rounded-xl font-semibold gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Tulis Post Baru
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Post Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="post-type">Jenis Post</Label>
                <Select value={newType} onValueChange={(val) => setNewType(val || 'article')}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih jenis post" />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-title">Judul (Opsional untuk beberapa tipe)</Label>
                <Input
                  id="post-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={newType === 'thread' || newType === 'text' ? 'e.g. Catatan Harian (Opsional)' : 'e.g. Judul Artikel Penting'}
                  className="text-xs"
                />
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">{error}</p>}
              
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} disabled={isCreating}>Batal</Button>
                <Button onClick={handleCreateDraft} disabled={isCreating} className="gap-1.5">
                  {isCreating && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  {isCreating ? 'Membuat...' : 'Buat Draf'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          Semua ({posts.length})
        </button>
        {POST_TYPES.map((type) => {
          const count = posts.filter((p) => p.post_type === type.value).length;
          return (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
                activeTab === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {type.label}
              <span className={cn(
                'text-[10px] px-1 rounded-full shrink-0',
                activeTab === type.value ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-card/45 backdrop-blur-xs">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada post di kategori ini.</p>
          <p className="text-xs text-muted-foreground/75 mt-1">Buat draf post pertama Anda dengan tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="glow-card relative flex flex-col rounded-2xl border dark:border-slate-800 bg-card hover:border-primary/25 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Cover Image if any */}
              {post.cover_image && (
                <div className="h-40 w-full bg-muted/20 relative overflow-hidden border-b border-border/50 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image}
                    alt={post.title ?? 'Cover'}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {format(parseISO(post.published_at || post.created_at), 'dd MMM yyyy', { locale: localeId })}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-primary">{TYPE_LABELS[post.post_type] || post.post_type}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {post.featured && (
                        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-none text-[9px] scale-90">
                          Featured
                        </Badge>
                      )}
                      {post.published ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none text-[9px] scale-90">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground bg-muted/40 text-[9px] border-border/50 shadow-none scale-90">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {post.title || <span className="italic text-muted-foreground/60">(Tanpa Judul)</span>}
                  </h3>

                  {post.excerpt ? (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">{post.excerpt}</p>
                  ) : post.body ? (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">{post.body.replace(/<[^>]*>/g, '')}</p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/50 leading-relaxed mb-4">Tidak ada ringkasan post.</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      {post.comment_count || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => confirmDelete(post)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Link href={`/portal/cms/${post.id}`}>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Post"
        description={`Apakah Anda yakin ingin menghapus post "${postToDelete?.title || 'Untitled'}" beserta seluruh medianya?`}
      />
    </div>
  );
}
