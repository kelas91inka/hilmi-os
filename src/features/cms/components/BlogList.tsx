'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Blog } from '../types/cms.types';
import { createDraftAction } from '../actions/blog.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function BlogList({ initialBlogs }: { initialBlogs: Blog[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDraft = async () => {
    if (!newTitle.trim()) return;
    setError(null);
    setIsCreating(true);
    const result = await createDraftAction(newTitle);
    setIsCreating(false);
    if (!result.success || !result.data) {
      setError(result.error || 'Failed to create draft');
    } else {
      setIsOpen(false);
      router.push(`/portal/cms/${result.data.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/65 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-primary" />
            Artikel Blog
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tulis, sunting, dan atur penerbitan artikel blog Anda.
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button onClick={() => { setNewTitle(''); setError(null); setIsOpen(true); }} className="rounded-xl font-semibold gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Tulis Artikel
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Draf Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="post-title">Judul Artikel</Label>
                <Input 
                  id="post-title"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Masa Depan Rekayasa Perangkat Lunak"
                  className="text-xs"
                />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">{error}</p>}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} disabled={isCreating}>Batal</Button>
                <Button onClick={handleCreateDraft} disabled={isCreating || !newTitle.trim()} className="gap-1.5">
                  {isCreating && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  {isCreating ? 'Membuat...' : 'Buat Draf'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid List */}
      {initialBlogs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-card/45 backdrop-blur-xs">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada artikel.</p>
          <p className="text-xs text-muted-foreground/75 mt-1">Buat draf artikel pertama Anda dengan tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialBlogs.map((blog) => (
            <div 
              key={blog.id} 
              className="glow-card relative flex flex-col rounded-2xl border dark:border-slate-800 bg-card hover:border-primary/25 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Optional Cover Image */}
              {blog.cover_image && (
                <div className="h-40 w-full bg-muted/20 relative overflow-hidden border-b border-border/50 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={blog.cover_image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                  />
                </div>
              )}

              {/* Main content details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {format(parseISO(blog.published_at || blog.created_at), 'dd MMM yyyy', { locale: localeId })}
                      </span>
                    </div>

                    {blog.published ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none text-[10px]">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground bg-muted/40 text-[10px] border-border/50 shadow-none">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {blog.title}
                  </h3>
                  
                  {blog.excerpt ? (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">{blog.excerpt}</p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/50 leading-relaxed mb-4">Tidak ada ringkasan draf.</p>
                  )}
                </div>

                {/* Footer Edit Button */}
                <div className="flex items-center justify-end pt-3 border-t border-border/50">
                  <Link href={`/portal/cms/${blog.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Edit className="h-3.5 w-3.5" />
                      Edit Artikel
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
