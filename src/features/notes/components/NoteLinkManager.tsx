'use client';

import { useState, useEffect } from 'react';
import { NoteLink } from '../types/note.types';
import { Button } from '@/components/ui/button';
import { Plus, X, Link as LinkIcon, FolderKanban, Target, CheckSquare } from 'lucide-react';
import { linkNoteAction, unlinkNoteAction } from '../actions/note-links.actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { createClient } from '@/lib/supabase/client';

interface NoteLinkManagerProps {
  noteId: string;
  initialLinks: NoteLink[];
}

interface LinkOption {
  id: string;
  title: string;
  type: 'project' | 'goal' | 'task';
}

export function NoteLinkManager({ noteId, initialLinks }: NoteLinkManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const [options, setOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && options.length === 0) {
      loadOptions();
    }
  }, [open]);

  const loadOptions = async () => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      const [projects, goals, tasks] = await Promise.all([
        supabase.from('projects').select('id, title').neq('status', 'archived').order('updated_at', { ascending: false }).limit(15),
        supabase.from('goals').select('id, title').eq('status', 'active').order('updated_at', { ascending: false }).limit(15),
        supabase.from('tasks').select('id, title').neq('status', 'selesai').order('updated_at', { ascending: false }).limit(20)
      ]);

      const allOptions: LinkOption[] = [
        ...(projects.data || []).map(p => ({ ...p, type: 'project' as const })),
        ...(goals.data || []).map(g => ({ ...g, type: 'goal' as const })),
        ...(tasks.data || []).map(t => ({ ...t, type: 'task' as const }))
      ];
      
      setOptions(allOptions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (option: LinkOption) => {
    // Prevent duplicates
    if (links.some(l => l.linked_type === option.type && l.linked_id === option.id)) {
      return;
    }
    
    setOpen(false);
    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setLinks(prev => [...prev, {
      id: tempId,
      note_id: noteId,
      linked_type: option.type,
      linked_id: option.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

    const res = await linkNoteAction(noteId, option.type, option.id);
    if (!res.success) {
      // Revert if failed
      setLinks(prev => prev.filter(l => l.id !== tempId));
    } else {
      // Update with real ID
      setLinks(prev => prev.map(l => l.id === tempId ? { ...l, id: res.data?.id || tempId } : l));
    }
  };

  const handleUnlink = async (linkId: string) => {
    // Optimistic
    const linkToRemove = links.find(l => l.id === linkId);
    setLinks(prev => prev.filter(l => l.id !== linkId));
    
    if (!linkId.startsWith('temp-')) {
      const res = await unlinkNoteAction(linkId, noteId);
      if (!res.success && linkToRemove) {
        // Revert
        setLinks(prev => [...prev, linkToRemove]);
      }
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'project': return <FolderKanban className="w-3 h-3 text-blue-500" />;
      case 'goal': return <Target className="w-3 h-3 text-purple-500" />;
      case 'task': return <CheckSquare className="w-3 h-3 text-green-500" />;
      default: return <LinkIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <div key={link.id} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-xs group">
          {getIcon(link.linked_type)}
          <span className="capitalize">{link.linked_type} Link</span>
          <button 
            onClick={() => handleUnlink(link.id)}
            className="text-muted-foreground/60 hover:text-destructive transition-colors ml-1"
            title="Hapus Koneksi"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button variant="outline" size="sm" className="h-6 text-xs px-2 bg-transparent border-dashed">
            <Plus className="w-3 h-3 mr-1" /> Link
          </Button>
        } />
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput placeholder="Search project, goal, or task..." />
            <CommandList>
              <CommandEmpty>{loading ? 'Loading...' : 'No results found.'}</CommandEmpty>
              <CommandGroup heading="Projects">
                {options
                  .filter(o => o.type === 'project' && !links.some(l => l.linked_type === 'project' && l.linked_id === o.id))
                  .map(o => (
                    <CommandItem key={o.id} onSelect={() => handleLink(o)}>
                      <FolderKanban className="w-4 h-4 mr-2 text-blue-500" />
                      {o.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Goals">
                {options
                  .filter(o => o.type === 'goal' && !links.some(l => l.linked_type === 'goal' && l.linked_id === o.id))
                  .map(o => (
                    <CommandItem key={o.id} onSelect={() => handleLink(o)}>
                      <Target className="w-4 h-4 mr-2 text-purple-500" />
                      {o.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Tasks">
                {options
                  .filter(o => o.type === 'task' && !links.some(l => l.linked_type === 'task' && l.linked_id === o.id))
                  .map(o => (
                    <CommandItem key={o.id} onSelect={() => handleLink(o)}>
                      <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                      <span className="truncate">{o.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
