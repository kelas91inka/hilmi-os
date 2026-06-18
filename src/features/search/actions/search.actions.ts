'use server';

import { createClient } from '@/lib/supabase/server';
import { SearchResult } from '../types/search.types';

export async function performGlobalSearchAction(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const searchStr = `%${query.trim()}%`;
  
  const [
    { data: tasks },
    { data: projects },
    { data: goals },
    { data: notes },
    { data: blogs }
  ] = await Promise.all([
    supabase.from('tasks').select('id, title, description, created_at').or(`title.ilike.${searchStr},description.ilike.${searchStr}`).limit(5),
    supabase.from('projects').select('id, title, description, created_at').or(`title.ilike.${searchStr},description.ilike.${searchStr}`).limit(5),
    supabase.from('goals').select('id, title, description, created_at').or(`title.ilike.${searchStr},description.ilike.${searchStr}`).limit(5),
    supabase.from('notes').select('id, title, content, created_at').or(`title.ilike.${searchStr},content.ilike.${searchStr}`).limit(5),
    supabase.from('blogs').select('id, title, excerpt, created_at').or(`title.ilike.${searchStr},excerpt.ilike.${searchStr}`).limit(5),
  ]);

  const results: SearchResult[] = [];

  tasks?.forEach(t => results.push({ id: t.id, type: 'task', title: t.title, description: t.description || '', url: '/portal/tasks', created_at: t.created_at }));
  projects?.forEach(p => results.push({ id: p.id, type: 'project', title: p.title, description: p.description || '', url: `/portal/projects/${p.id}`, created_at: p.created_at }));
  goals?.forEach(g => results.push({ id: g.id, type: 'goal', title: g.title, description: g.description || '', url: `/portal/goals/${g.id}`, created_at: g.created_at }));
  notes?.forEach(n => results.push({ id: n.id, type: 'note', title: n.title, description: (n.content || '').substring(0, 100), url: `/portal/notes/${n.id}`, created_at: n.created_at }));
  blogs?.forEach(b => results.push({ id: b.id, type: 'blog', title: b.title, description: b.excerpt || '', url: `/portal/cms/${b.id}`, created_at: b.created_at }));

  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
