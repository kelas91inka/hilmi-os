export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteLinkedType = 'project' | 'goal' | 'task' | 'diary' | 'blog';

export interface NoteLink {
  id: string;
  note_id: string;
  linked_type: NoteLinkedType;
  linked_id: string;
  created_at: string;
  updated_at: string;
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag: string;
}

export interface NoteWithDetails extends Note {
  tags: NoteTag[];
  links: NoteLink[];
}
