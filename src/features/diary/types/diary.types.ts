export type Mood = 'happy' | 'neutral' | 'sad' | 'productive' | 'stressed' | 'tired' | 'sick';

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  mood: Mood | null;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export type DiaryLinkedType = 'project' | 'goal' | 'task' | 'note' | 'blog';

export interface DiaryLink {
  id: string;
  diary_id: string;
  linked_type: DiaryLinkedType;
  linked_id: string;
}

export interface DiaryEntryWithDetails extends DiaryEntry {
  links: DiaryLink[];
}
