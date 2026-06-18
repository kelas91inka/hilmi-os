import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Timeline | Hilmi OS',
  description: 'Perjalanan kronologis Muhammad Hilmi Mu\'afa dalam dunia teknologi.',
};

async function getTimeline() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('timeline_events')
    .select('*')
    .order('event_date', { ascending: false });
  return data || [];
}

export default async function TimelinePage() {
  const events = await getTimeline();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24 space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Timeline</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Perjalanan Saya</h1>
        <p className="text-lg text-muted-foreground">
          Kronologi momen-momen penting dalam perjalanan saya di dunia teknologi.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada timeline yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-8 pl-12">
            {events.map((event: any, i: number) => (
              <div key={event.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-12 w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                
                <div className="p-5 rounded-2xl border bg-card hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-base">{event.title}</h3>
                    {event.event_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(event.event_date), 'MMMM yyyy', { locale: id })}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
