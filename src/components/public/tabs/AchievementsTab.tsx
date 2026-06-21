'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDateLocale, translations, type Language } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  lang?: Language;
}

export function AchievementsTab({ achievements, lang = 'id' }: Props) {
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);
  const t = translations[lang];
  const dateLocale = getDateLocale(lang);

  const categories = [
    t.explore.feed.all,
    ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean) as string[]))
  ];
  const [activeCategory, setActiveCategory] = useState(t.explore.feed.all);

  const filtered =
    activeCategory === t.explore.feed.all
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  if (achievements.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">{t.explore.achievements.empty}</p>
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
            onClick={() => setSelectedAch(ach)}
            className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md cursor-pointer transition-all group animate-in fade-in-30"
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
                <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
                  {ach.title}
                </h3>
                {ach.achievement_date && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(parseISO(ach.achievement_date), 'MMM yyyy', { locale: dateLocale })}
                  </span>
                )}
              </div>
              {ach.category && (
                <span className="inline-block text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {ach.category}
                </span>
              )}
              {ach.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {ach.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Dialog Popup */}
      <Dialog open={!!selectedAch} onOpenChange={(open) => !open && setSelectedAch(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedAch?.image_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAch.image_url}
                alt={selectedAch.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <DialogHeader>
            <div className="flex items-center gap-1.5 justify-between mb-1 flex-wrap">
              {selectedAch?.category && (
                <span className="inline-block text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                  {selectedAch.category}
                </span>
              )}
              {selectedAch?.achievement_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(parseISO(selectedAch.achievement_date), 'd MMMM yyyy', { locale: dateLocale })}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-bold leading-snug text-foreground">
              {selectedAch?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-1">
            {selectedAch?.description}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
