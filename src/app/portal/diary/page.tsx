import { Metadata } from 'next';
import { diaryService } from '@/features/diary/services/diary.service';
import { DiaryClient } from '@/features/diary/components/DiaryClient';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';
import { BookHeart } from 'lucide-react';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Jurnal | Hilmi OS',
  description: 'Refleksi harian dan pelacakan suasana hati',
};

export default async function DiaryPage() {
  const entries = await diaryService.getEntries();
  const todayDateString = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto">
      <PageContextSetter context="Jurnal Harian" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookHeart className="w-7 h-7 text-primary" />
            Jurnal Harian
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Catat suasana hati dan refleksi harian Anda secara terorganisir.
          </p>
        </div>
      </div>

      <DiaryClient initialEntries={entries} todayDateString={todayDateString} />
    </div>
  );
}


