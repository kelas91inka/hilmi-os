'use client';

import { useState } from 'react';
import { NoteTag } from '../types/note.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addNoteTagAction, removeNoteTagAction } from '../actions/note.actions';

interface NoteTagManagerProps {
  noteId: string;
  initialTags: NoteTag[];
}

export function NoteTagManager({ noteId, initialTags }: NoteTagManagerProps) {
  const [tags, setTags] = useState<NoteTag[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTag.trim().toLowerCase();
    if (!cleanTag) return;

    // Check for duplicate locally
    if (tags.some(t => t.tag === cleanTag)) {
      setNewTag('');
      setOpen(false);
      return;
    }

    setIsSubmitting(true);

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const tempTagObj: NoteTag = {
      id: tempId,
      note_id: noteId,
      tag: cleanTag
    };
    
    setTags(prev => [...prev, tempTagObj]);
    setNewTag('');
    setOpen(false);

    const res = await addNoteTagAction(noteId, cleanTag);
    if (res.success && res.data) {
      setTags(prev => prev.map(t => t.id === tempId ? (res.data as NoteTag) : t));
    } else {
      // Revert if failed
      setTags(prev => prev.filter(t => t.id !== tempId));
    }
    setIsSubmitting(false);
  };

  const handleRemoveTag = async (tagName: string) => {
    // Optimistic Update
    const removedTag = tags.find(t => t.tag === tagName);
    setTags(prev => prev.filter(t => t.tag !== tagName));

    if (removedTag && !removedTag.id.startsWith('temp-')) {
      const res = await removeNoteTagAction(noteId, tagName);
      if (!res.success) {
        // Revert
        setTags(prev => [...prev, removedTag]);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span 
          key={tag.id} 
          className="inline-flex items-center gap-1 bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full text-xs font-semibold dark:bg-primary/10 group"
        >
          #{tag.tag}
          <button
            onClick={() => handleRemoveTag(tag.tag)}
            className="text-muted-foreground/60 hover:text-destructive transition-colors ml-0.5"
            title={`Hapus #${tag.tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button variant="outline" size="sm" className="h-6 text-xs px-2 bg-transparent border-dashed">
            <Plus className="w-3 h-3 mr-1" /> Tag
          </Button>
        } />
        <PopoverContent className="p-3 w-48" align="start">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <Input
              placeholder="Nama tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-8 text-xs"
              autoFocus
              disabled={isSubmitting}
            />
            <Button type="submit" size="sm" className="h-8 px-2 text-xs" disabled={isSubmitting}>
              Tambah
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
