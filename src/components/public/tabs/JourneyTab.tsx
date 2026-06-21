'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, CalendarIcon } from 'lucide-react';
import { getDateLocale, translations, type Language } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      <div className="text-center py-20 text-muted-foreground">
        <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">{t.explore.journey.empty}</p>
      </div>
    );
  }

  const grouped = groupByYear(events);

  return (
    <div className="max-w-[680px] mx-auto space-y-12">
      {grouped.map(([year, yearEvents]) => (
        <div key={year} className="space-y-4">
          {/* Year label */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight text-foreground">{year}</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Events for this year */}
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />

            <div className="space-y-4">
              {yearEvents.map((ev) => (
                <div key={ev.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[1.125rem] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-primary bg-background" />

                  <div
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md cursor-pointer transition-all duration-300 ml-2 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                        {ev.title}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">
                        {format(parseISO(ev.event_date), 'MMM yyyy', { locale: dateLocale })}
                      </span>
                    </div>
                    {ev.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Detail Dialog Popup */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              {selectedEvent && format(parseISO(selectedEvent.event_date), 'd MMMM yyyy', { locale: dateLocale })}
            </div>
            <DialogTitle className="text-xl font-bold leading-snug text-foreground">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-1">
            {selectedEvent?.description}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
