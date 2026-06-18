export type SearchResultType = 'task' | 'project' | 'goal' | 'note' | 'diary' | 'blog' | 'finance' | 'habit';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  created_at: string;
}
