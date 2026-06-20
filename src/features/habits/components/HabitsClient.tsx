'use client';

import { useState } from 'react';
import { HabitWithLogs } from '../types/habit.types';
import { HabitTrackerGrid } from './HabitTrackerGrid';
import { HabitFormDialog } from './HabitFormDialog';
import { HabitStatsBar } from './HabitStatsBar';
import { HabitCard } from './HabitCard';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Repeat, LayoutGrid, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FREQUENCY_LABELS: Record<string, string> = {
  all: 'Semua Frekuensi',
  daily: 'Harian',
  weekly: 'Mingguan',
};

const SORT_LABELS: Record<string, string> = {
  created: 'Terbaru',
  streak: 'Streak Aktif',
  rekor: 'Rekor Terpanjang',
  alphabetical: 'Nama A-Z',
};

interface HabitsClientProps {
  initialHabits: HabitWithLogs[];
  daysCount?: number;
}

export function HabitsClient({ initialHabits, daysCount = 14 }: HabitsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'streak' | 'rekor' | 'alphabetical'>('created');

  // Filter habits
  const filteredHabits = initialHabits.filter((habit) => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFrequency = frequencyFilter === 'all' || habit.target_frequency === frequencyFilter;
    return matchesSearch && matchesFrequency;
  });

  // Sort habits
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (sortBy === 'streak') {
      return b.stats.currentStreak - a.stats.currentStreak;
    }
    if (sortBy === 'rekor') {
      return b.stats.bestStreak - a.stats.bestStreak;
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // Default: created_at desc
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <HabitStatsBar habits={initialHabits} />

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-card p-4 rounded-2xl border border-border w-full shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari kebiasaan..."
            className="pl-9 h-9 w-full"
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

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Frequency Filter */}
          <Select
            value={frequencyFilter}
            onValueChange={(val) => setFrequencyFilter(val as 'all' | 'daily' | 'weekly')}
          >
            <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs">
              <SelectValue placeholder="Frekuensi">
                {FREQUENCY_LABELS[frequencyFilter]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Frekuensi</SelectItem>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as 'created' | 'streak' | 'rekor' | 'alphabetical')}
          >
            <SelectTrigger className="h-9 w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="Urutkan">
                {SORT_LABELS[sortBy]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="created">Terbaru</SelectItem>
              <SelectItem value="streak">Streak Aktif</SelectItem>
              <SelectItem value="rekor">Rekor Terpanjang</SelectItem>
              <SelectItem value="alphabetical">Nama A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Segmented View Switcher */}
          <div className="flex bg-muted/65 p-0.5 rounded-xl border border-border/60 shrink-0">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'card'
                  ? "bg-background text-foreground shadow-xs border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'grid'
                  ? "bg-background text-foreground shadow-xs border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Tabel Linimasa"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Linimasa</span>
            </button>
          </div>

          <div className="h-4 border-l border-border/50 hidden sm:block mx-1" />

          {/* Add Habit Dialog */}
          <HabitFormDialog />
        </div>
      </div>

      {/* Filter summary */}
      {(searchQuery || frequencyFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Menampilkan <span className="font-bold text-foreground">{sortedHabits.length}</span> dari{' '}
            <span className="font-bold text-foreground">{initialHabits.length}</span> kebiasaan
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setFrequencyFilter('all');
            }}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Bersihkan Filter
          </button>
        </div>
      )}

      {/* Habits Content */}
      {sortedHabits.length === 0 ? (
        <EmptyState
          icon={<Repeat className="w-6 h-6" />}
          title={initialHabits.length === 0 ? "Belum Ada Kebiasaan" : "Tidak ada kebiasaan"}
          description={
            initialHabits.length === 0
              ? "Mulai bangun konsistensi dengan membuat kebiasaan pertamamu hari ini."
              : "Tidak ada kebiasaan yang sesuai dengan kriteria filter pencarian Anda."
          }
          action={initialHabits.length === 0 ? <HabitFormDialog /> : undefined}
        />
      ) : viewMode === 'card' ? (
        /* Card Grid View (Premium layout) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      ) : (
        /* Grid Timeline Spreadsheet View */
        <Card className="glow-card rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Pelacakan Harian (14 Hari Terakhir)
            </h3>
            <HabitTrackerGrid habits={sortedHabits} daysCount={daysCount} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
