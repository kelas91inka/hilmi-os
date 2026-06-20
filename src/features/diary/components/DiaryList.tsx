'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookHeart, ChevronRight } from 'lucide-react';
import { DiaryEntry } from '../types/diary.types';
import { EmptyState } from '@/components/shared/empty-state';

interface DiaryListProps {
  entries: DiaryEntry[];
  todayDateString: string;
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😄',
  productive: '🚀',
  neutral: '😐',
  tired: '🥱',
  stressed: '🤯',
  sad: '😔',
  sick: '🤒',
};

const MOOD_LABELS: Record<string, string> = {
  happy: 'Bahagia',
  productive: 'Produktif',
  neutral: 'Netral',
  tired: 'Lelah',
  stressed: 'Stres',
  sad: 'Sedih',
  sick: 'Sakit',
};

const getMoodCardStyle = (mood: string | null) => {
  switch (mood) {
    case 'happy':
      return 'hover:border-amber-400/40 border-amber-500/10 shadow-sm shadow-amber-500/5 dark:border-amber-500/20';
    case 'productive':
      return 'hover:border-indigo-400/40 border-indigo-500/10 shadow-sm shadow-indigo-500/5 dark:border-indigo-500/20';
    case 'neutral':
      return 'hover:border-slate-300 dark:hover:border-slate-800 border-border';
    case 'tired':
      return 'hover:border-teal-400/40 border-teal-500/10 shadow-sm shadow-teal-500/5 dark:border-teal-500/20';
    case 'stressed':
    case 'sad':
    case 'sick':
      return 'hover:border-red-400/40 border-red-500/10 shadow-sm shadow-red-500/5 dark:border-red-500/20';
    default:
      return 'hover:border-border border-border';
  }
};

export function DiaryList({ entries, todayDateString }: DiaryListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">Entri Jurnal</h3>
      
      {entries.length === 0 ? (
        <EmptyState
          icon={<BookHeart className="w-6 h-6" />}
          title="Tidak ada entri"
          description="Tidak ada entri jurnal yang sesuai dengan filter pencarian atau kategori Anda."
        />
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => {
            const cardStyle = getMoodCardStyle(entry.mood);
            const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood] : '📝';
            const moodLabel = entry.mood ? MOOD_LABELS[entry.mood] : 'Jurnal';
            
            return (
              <Card
                key={entry.id} 
                className={`glow-card group rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-card/60 backdrop-blur-sm ${cardStyle}`}
              >
                <Link href={`/portal/diary/${entry.entry_date}`} className="flex flex-col p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0" title={moodLabel}>
                        {moodEmoji}
                      </span>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {format(parseISO(entry.entry_date), 'EEEE, d MMMM yyyy', { locale: id })}
                      </h4>
                    </div>
                    {entry.mood && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                        {moodLabel}
                      </span>
                    )}
                  </div>
                  
                  {entry.title && (
                    <p className="text-sm font-bold text-foreground mb-1 mt-1 pl-7">
                      {entry.title}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-7 mt-0.5 pr-4 relative">
                    {entry.content?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || 'Belum ada isi catatan...'}
                  </div>
                  
                  <div className="flex items-center text-[10px] text-primary/70 font-semibold group-hover:text-primary transition-colors mt-3 pl-7 gap-1">
                    Baca & Edit Jurnal 
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
