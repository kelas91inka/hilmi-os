'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  achievement_date?: string | null;
  image_url?: string | null;
}

interface Props {
  achievements: Achievement[];
}

export function AchievementsTab({ achievements }: Props) {
  const categories = ['Semua', ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean) as string[]))];
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filtered =
    activeCategory === 'Semua'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  if (achievements.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Belum ada pencapaian yang dipublikasikan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`achievement-filter-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                activeCategory === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((ach) => (
          <div
            key={ach.id}
            className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all"
          >
            {/* Icon or image */}
            {ach.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ach.image_url}
                alt={ach.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-primary/40" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start gap-2 justify-between">
                <h3 className="font-semibold text-sm leading-snug">{ach.title}</h3>
                {ach.achievement_date && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(parseISO(ach.achievement_date), 'MMM yyyy', { locale: localeId })}
                  </span>
                )}
              </div>
              {ach.category && (
                <span className="inline-block text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {ach.category}
                </span>
              )}
              {ach.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ach.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
