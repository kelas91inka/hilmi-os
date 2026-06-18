import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { TimelineCMS } from '@/features/cms/components/TimelineCMS';

export const metadata: Metadata = {
  title: 'Timeline CMS | Hilmi OS',
};

async function getTimelineEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('timeline_events')
    .select('*')
    .order('event_date', { ascending: false });
  return data || [];
}

export default async function TimelineCMSPage() {
  const items = await getTimelineEvents();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <TimelineCMS initialItems={items} />
    </div>
  );
}
