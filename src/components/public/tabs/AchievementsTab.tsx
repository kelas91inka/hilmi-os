'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trophy, Calendar, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDateLocale, translations, type Language } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 text-muted-foreground"
      >
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium">{t.explore.achievements.empty}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap items-center bg-card/30 p-2 rounded-2xl border border-border/40 backdrop-blur-sm w-fit">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                id={`achievement-filter-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'relative text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 outline-none',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((ach) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
              key={ach.id}
              onClick={() => setSelectedAch(ach)}
              className="group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Hover effect gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
              
              <div className="relative z-10 p-5 flex gap-5">
                {/* Icon or image */}
                <div className="relative shrink-0">
                  {ach.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ach.image_url}
                      alt={ach.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md group-hover:shadow-primary/20 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-inner group-hover:shadow-primary/20 transition-all duration-300">
                      <Award className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                    </div>
                  )}
                  {/* Decorative badge glow */}
                  <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5">
                  {ach.category && (
                    <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary/80 mb-0.5">
                      {ach.category}
                    </span>
                  )}
                  <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {ach.title}
                  </h3>
                  {ach.achievement_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(parseISO(ach.achievement_date), 'MMM yyyy', { locale: dateLocale })}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail Dialog Popup */}
      <AnimatePresence>
        {selectedAch && (
          <Dialog open={!!selectedAch} onOpenChange={(open) => !open && setSelectedAch(null)}>
            <DialogContent className="sm:max-w-lg border-border/40 bg-card/95 backdrop-blur-md shadow-2xl p-0 overflow-hidden">
              {selectedAch.image_url ? (
                <div className="w-full aspect-video relative bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAch.image_url}
                    alt={selectedAch.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                   <Award className="w-16 h-16 text-primary/40" />
                   <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>
              )}
              
              <div className="p-6 pt-0 relative z-10 -mt-6">
                <DialogHeader>
                  <div className="flex items-center gap-2 justify-between mb-3 flex-wrap">
                    {selectedAch.category && (
                      <span className="inline-block text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                        {selectedAch.category}
                      </span>
                    )}
                    {selectedAch.achievement_date && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(selectedAch.achievement_date), 'd MMMM yyyy', { locale: dateLocale })}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-black leading-tight text-foreground">
                    {selectedAch.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedAch.description}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
