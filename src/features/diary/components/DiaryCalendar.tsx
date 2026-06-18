'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { DiaryEntry } from '../types/diary.types';
import { parseISO } from 'date-fns';

interface DiaryCalendarProps {
  entries: DiaryEntry[];
}

export function DiaryCalendar({ entries }: DiaryCalendarProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    
    // Format to YYYY-MM-DD local time
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    router.push(`/portal/diary/${dateString}`);
  };

  const entryDates = entries.map(e => parseISO(e.entry_date));

  return (
    <div className="border rounded-lg bg-card shadow-sm inline-block p-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        modifiers={{
          hasEntry: entryDates,
        }}
        modifiersClassNames={{
          hasEntry: 'bg-primary/15 text-primary font-medium hover:bg-primary/25 rounded-md',
        }}
        className="rounded-md"
      />
    </div>
  );
}
