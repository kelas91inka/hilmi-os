import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { MapPin } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
}

interface Props {
  events: TimelineEvent[];
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

export function JourneyTab({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Belum ada timeline yang dipublikasikan.</p>
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

                  <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all ml-2">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm leading-snug">{ev.title}</h3>
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        {format(parseISO(ev.event_date), 'MMM yyyy', { locale: localeId })}
                      </span>
                    </div>
                    {ev.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{ev.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
