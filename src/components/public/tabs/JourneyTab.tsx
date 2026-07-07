'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, CalendarIcon } from 'lucide-react';
import { getDateLocale, translations, type Language } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
}

interface Props {
  events: TimelineEvent[];
  lang?: Language;
}

// Group events by year
function groupByYear(events: TimelineEvent[]) {
  const grouped: Record<string, TimelineEvent[]> = {};
  for (const ev of events) {
    const year = new Date(ev.event_date).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(ev);
  }
  return Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a));
}

export function JourneyTab({ events, lang = 'id' }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const t = translations[lang];
  const dateLocale = getDateLocale(lang);

  if (events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 text-muted-foreground"
      >
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium">{t.explore.journey.empty}</p>
      </motion.div>
    );
  }

  const grouped = groupByYear(events);

  return (
    <div className="max-w-4xl mx-auto space-y-20 pb-10">
      {grouped.map(([year, yearEvents], yearIndex) => (
        <div key={year} className="relative">
          
          {/* Year label - Centered on Desktop, Left on Mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex items-center md:justify-center gap-4 relative z-20 mb-10"
          >
            <div className="hidden md:block flex-1 h-px bg-gradient-to-l from-border/80 to-transparent" />
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 bg-background px-6 py-2 rounded-full border border-border/40 shadow-sm backdrop-blur-sm">
              {year}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
          </motion.div>

          {/* Timeline Container */}
          <div className="relative">
            {/* The Vertical Line */}
            <div className="absolute left-[23px] md:left-1/2 md:-translate-x-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-border/50 to-transparent rounded-full" />

            <div className="space-y-12 md:space-y-16">
              {yearEvents.map((ev, i) => {
                const isEven = i % 2 === 0;
                // Animation direction: slide from right if odd (desktop), left if even (desktop)
                // On mobile, always slide from left to right slightly
                const slideX = isEven ? -30 : 30;

                return (
                  <motion.div 
                    key={ev.id} 
                    initial={{ opacity: 0, x: slideX, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                    className="relative flex items-center w-full group/timeline"
                  >
                    {/* The Dot */}
                    <div className="absolute left-[23px] md:left-1/2 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-background bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] z-10 group-hover/timeline:scale-125 transition-transform duration-300" />

                    {/* Card Container */}
                    <div className={cn(
                      "w-[calc(100%-4rem)] ml-16 md:w-1/2 md:ml-0",
                      isEven ? "md:pr-12 lg:pr-16" : "md:pl-12 lg:pl-16 md:ml-auto"
                    )}>
                      {/* Connection Line (Desktop Only) */}
                      <div className={cn(
                        "hidden md:block absolute top-1/2 -translate-y-1/2 h-px bg-border/60 w-8 lg:w-12 transition-colors duration-300 group-hover/timeline:bg-primary/40",
                        isEven ? "right-1/2 mr-3 lg:mr-4" : "left-1/2 ml-3 lg:ml-4"
                      )} />

                      <div
                        onClick={() => setSelectedEvent(ev)}
                        className={cn(
                          "p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md hover:bg-card/80 hover:border-primary/30 hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden group/card",
                          // Hover translation logic: move slightly up and towards the center line
                          isEven ? "md:hover:-translate-x-1 hover:-translate-y-1" : "md:hover:translate-x-1 hover:-translate-y-1"
                        )}
                      >
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-0" />
                        
                        <div className="relative z-10">
                          <div className={cn(
                            "flex flex-col gap-2 mb-3",
                            "md:flex-col lg:flex-row lg:items-start lg:justify-between" // Responsive header alignment
                          )}>
                            <h3 className="font-bold text-lg leading-tight group-hover/card:text-primary transition-colors">
                              {ev.title}
                            </h3>
                            <span className="inline-flex w-fit items-center text-[11px] sm:text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider bg-muted/60 px-3 py-1.5 rounded-full group-hover/card:bg-primary/10 group-hover/card:text-primary transition-colors whitespace-nowrap">
                              {format(parseISO(ev.event_date), 'MMM yyyy', { locale: dateLocale })}
                            </span>
                          </div>
                          
                          {ev.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Detail Dialog Popup */}
      <AnimatePresence>
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="sm:max-w-lg border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary/80 mb-3 bg-primary/10 w-fit px-3 py-1.5 rounded-full border border-primary/20">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(parseISO(selectedEvent.event_date), 'd MMMM yyyy', { locale: dateLocale })}
                </div>
                <DialogTitle className="text-2xl font-black leading-tight text-foreground">
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedEvent.description}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
