import { Metadata } from 'next';
import { diaryService } from '@/features/diary/services/diary.service';
import { DiaryCalendar } from '@/features/diary/components/DiaryCalendar';
import { BookHeart, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Jurnal | Hilmi OS',
  description: 'Refleksi harian dan pelacakan suasana hati',
};

export default async function DiaryPage() {
  const entries = await diaryService.getEntries();
  const todayDateString = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookHeart className="w-8 h-8 text-primary" />
            Jurnal Harian
          </h2>
          <p className="text-muted-foreground mt-1">
            Catat suasana hati dan refleksi harian Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/portal/diary/${todayDateString}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tulis Hari Ini
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <DiaryCalendar entries={entries} />
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Entri Terbaru</h3>
          {entries.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card text-muted-foreground">
              Belum ada entri. Mulai menulis hari ini!
            </div>
          ) : (
            <div className="grid gap-4">
              {entries.slice(0, 10).map((entry) => (
                <Card
                  key={entry.id} 
                  className="group hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <Link href={`/portal/diary/${entry.entry_date}`} className="flex flex-col p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {format(parseISO(entry.entry_date), 'EEEE, d MMMM yyyy', { locale: id })}
                    </h4>
                    {entry.mood && (
                      <span className="text-lg" title={entry.mood}>
                        {entry.mood === 'happy' && '😄'}
                        {entry.mood === 'productive' && '🚀'}
                        {entry.mood === 'neutral' && '😐'}
                        {entry.mood === 'tired' && '🥱'}
                        {entry.mood === 'stressed' && '🤯'}
                        {entry.mood === 'sad' && '😔'}
                        {entry.mood === 'sick' && '🤒'}
                      </span>
                    )}
                  </div>
                  {entry.title && <p className="text-sm font-semibold text-foreground mb-1">{entry.title}</p>}
                  <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {entry.content?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || 'Belum ada konten...'}
                  </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
