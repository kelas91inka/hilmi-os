'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Blog } from '../types/cms.types';
import { createDraftAction } from '../actions/blog.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog CMS</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Draft
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. The Future of Design"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleCreateDraft} disabled={isCreating || !newTitle.trim()} className="w-full">
                {isCreating ? 'Creating...' : 'Create Draft'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialBlogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No blog posts yet. Create a draft to get started.
                </TableCell>
              </TableRow>
            )}
            {initialBlogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>
                  {blog.published ? (
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground bg-muted/50">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {blog.published_at 
                    ? new Date(blog.published_at).toLocaleDateString() 
                    : new Date(blog.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link href={`/portal/cms/${blog.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
