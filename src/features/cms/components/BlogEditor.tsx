'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Blog } from '../types/cms.types';
import { updateBlogAction, deleteBlogAction } from '../actions/blog.actions';
import { NoteEditor } from '@/features/notes/components/NoteEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import { ImageUploader } from '@/components/shared/image-uploader';


export function BlogEditor({ blog }: { blog: Blog }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: blog.title,
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    cover_image: blog.cover_image || '',
    published: blog.published,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const result = await updateBlogAction(blog.id, formData);
    setIsSaving(false);
    if (!result.success) {
      setError(result.error || 'Gagal menyimpan draf');
    } else {
      router.refresh();
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBlogAction(blog.id);
    if (!result.success) {
      setError(result.error || 'Gagal menghapus');
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    } else {
      router.push('/portal/cms');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/portal/cms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Blog</h1>
        </div>
        <div className="flex items-center gap-2">
          {blog.published && (
            <Link href={`/blog/${blog.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(true)} disabled={isDeleting} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              className="text-lg font-semibold h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="rounded-md bg-card">
              <NoteEditor 
                content={formData.content} 
                onChange={(content) => setFormData({ ...formData, content })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Publishing</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="cursor-pointer font-medium">Published</Label>
                <Switch 
                  id="published" 
                  checked={formData.published}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, published: checked })}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.published 
                  ? `Published on ${blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'now'}` 
                  : 'Currently a draft'}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg pb-2">Meta</h3>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug" 
                  value={blog.slug} 
                  disabled 
                  className="bg-muted font-mono text-sm"
                />
              </div>

              <div className="space-y-2 pt-2">
                <ImageUploader
                  label="Cover Image"
                  value={formData.cover_image}
                  onChange={(url) => setFormData({ ...formData, cover_image: url })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea 
                  id="excerpt" 
                  value={formData.excerpt} 
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} 
                  rows={4}
                  placeholder="A short summary..."
                  className="resize-none"
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
        title="Hapus Blog" 
        description={`Apakah Anda yakin ingin menghapus blog "${blog.title}"? Draf dan semua isi konten akan hilang selamanya.`} 
      />
    </div>
  );
}
