'use client';

import { useState, useMemo } from 'react';
import { DiaryEntry } from '../types/diary.types';
import { DiaryStatsBar } from './DiaryStatsBar';
import { DiaryCalendar } from './DiaryCalendar';
import { DiaryList } from './DiaryList';
import { Search, X, Filter, ChevronDown, Plus, Smile, Frown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DiaryClientProps {
  initialEntries: DiaryEntry[];
  todayDateString: string;
}

type TabType = 'all' | 'positive' | 'reflection';
type SortBy = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

const MOOD_LABELS: Record<string, string> = {
  happy: '😄 Bahagia',
  productive: '🚀 Produktif',
  neutral: '😐 Netral',
  tired: '🥱 Lelah',
  stressed: '🤯 Stres',
  sad: '😔 Sedih',
  sick: '🤒 Sakit',
};

const SORT_LABELS: Record<string, string> = {
  newest: 'Terbaru Ditulis',
  oldest: 'Terlama Ditulis',
  title_asc: 'Judul A-Z',
  title_desc: 'Judul Z-A',
};

export function DiaryClient({ initialEntries, todayDateString }: DiaryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Tab counts
  const allCount = initialEntries.length;
  const positiveCount = initialEntries.filter(
    (e) => e.mood === 'happy' || e.mood === 'productive'
  ).length;
  const reflectionCount = initialEntries.filter(
    (e) => e.mood && ['neutral', 'tired', 'stressed', 'sad', 'sick'].includes(e.mood)
  ).length;

  // Filter diary list
  const filteredEntries = useMemo(() => {
    let result = [...initialEntries];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.content && e.content.toLowerCase().includes(q))
      );
    }

    // 2. Tab Filter
    if (activeTab === 'positive') {
      result = result.filter((e) => e.mood === 'happy' || e.mood === 'productive');
    } else if (activeTab === 'reflection') {
      result = result.filter((e) => e.mood && ['neutral', 'tired', 'stressed', 'sad', 'sick'].includes(e.mood));
    }

    // 3. Mood Filter (from popover)
    if (selectedMood !== 'all') {
      result = result.filter((e) => e.mood === selectedMood);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.entry_date.localeCompare(a.entry_date);
      }
      if (sortBy === 'oldest') {
        return a.entry_date.localeCompare(b.entry_date);
      }
      const titleA = a.title || '';
      const titleB = b.title || '';
      if (sortBy === 'title_asc') {
        return titleA.localeCompare(titleB);
      }
      if (sortBy === 'title_desc') {
        return titleB.localeCompare(titleA);
      }
      return 0;
    });

    return result;
  }, [initialEntries, searchQuery, activeTab, selectedMood, sortBy]);

  const activeFilterCount = [
    selectedMood !== 'all',
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedMood('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <DiaryStatsBar entries={initialEntries} />

      {/* Segmented Tabs */}
      <div className="flex bg-muted/60 p-1 rounded-xl border gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <span>Semua Jurnal</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
          }`}>
            {allCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('positive')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'positive'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Smile className="w-3.5 h-3.5 text-rose-500" />
          <span>Hari Positif</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === 'positive' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
          }`}>
            {positiveCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reflection')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reflection'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Frown className="w-3.5 h-3.5 text-blue-500" />
          <span>Perlu Refleksi</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === 'reflection' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
          }`}>
            {reflectionCount}
          </span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-2xl border glow-card w-full">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kata kunci jurnal..."
            className="pl-9 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              id="diary-filter-btn"
              className={`flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl border transition-colors ${
                activeFilterCount > 0
                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Filter Lanjutan</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Reset semua
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Filter Mood */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suasana Hati</label>
                    <Select value={selectedMood} onValueChange={(val) => setSelectedMood(val || 'all')}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Semua Suasana Hati">
                          {selectedMood === 'all' ? 'Semua Suasana Hati' : MOOD_LABELS[selectedMood]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Suasana Hati</SelectItem>
                        {Object.entries(MOOD_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Sort */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urutan</label>
                    <Select value={sortBy} onValueChange={(val) => val && setSortBy(val as SortBy)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Urutkan">
                          {SORT_LABELS[sortBy]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Terbaru Ditulis</SelectItem>
                        <SelectItem value="oldest">Terlama Ditulis</SelectItem>
                        <SelectItem value="title_asc">Judul A-Z</SelectItem>
                        <SelectItem value="title_desc">Judul Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Link href={`/portal/diary/${todayDateString}`}>
            <Button className="rounded-xl h-9 bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 text-xs px-4 py-2 font-semibold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Tulis Jurnal
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <DiaryCalendar entries={initialEntries} />
        </div>
        
        <div className="md:col-span-2">
          <DiaryList entries={filteredEntries} todayDateString={todayDateString} />
        </div>
      </div>
    </div>
  );
}
