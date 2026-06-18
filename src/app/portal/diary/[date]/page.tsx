import { diaryService } from '@/features/diary/services/diary.service';
import { DiaryEditor } from '@/features/diary/components/DiaryEditor';
import { Metadata } from 'next';

interface DiaryEntryPageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: DiaryEntryPageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Diary - ${date} | Hilmi OS`,
  };
}

export default async function DiaryEntryPage({ params }: DiaryEntryPageProps) {
  const { date } = await params;
  
  let entry = null;
  try {
    entry = await diaryService.getEntryByDate(date);
  } catch (error) {
    console.error('Error loading diary entry:', error);
  }

  // It's okay if entry is null, the DiaryEditor will treat it as a new draft

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto h-full">
        <DiaryEditor entryDate={date} initialEntry={entry} />
      </div>
    </div>
  );
}
