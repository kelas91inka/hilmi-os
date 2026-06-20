'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, X, Command, ChevronRight, Clock, CheckSquare, FolderKanban, Target, BookOpen, Wallet, Flame, BookHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type SearchResult = {
  id: string;
  type: 'task' | 'project' | 'goal' | 'note' | 'habit' | 'transaction' | 'diary';
  title: string;
  subtitle: string;
  href: string;
};

type FilterTab = 'all' | 'task' | 'project' | 'goal' | 'note' | 'habit' | 'transaction' | 'diary';

const FILTER_TABS: { key: FilterTab; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'Semua', icon: Command },
  { key: 'task', label: 'Tugas', icon: CheckSquare },
  { key: 'project', label: 'Proyek', icon: FolderKanban },
  { key: 'goal', label: 'Tujuan', icon: Target },
  { key: 'note', label: 'Catatan', icon: BookOpen },
  { key: 'diary', label: 'Jurnal', icon: BookHeart },
  { key: 'habit', label: 'Kebiasaan', icon: Flame },
  { key: 'transaction', label: 'Keuangan', icon: Wallet },
];


const TYPE_LABEL: Record<SearchResult['type'], string> = {
  task: 'Tugas',
  project: 'Proyek',
  goal: 'Tujuan',
  note: 'Catatan',
  habit: 'Kebiasaan',
  transaction: 'Keuangan',
  diary: 'Jurnal',
};

const TYPE_COLOR: Record<SearchResult['type'], string> = {
  task: 'text-blue-500 bg-blue-500/10',
  project: 'text-violet-500 bg-violet-500/10',
  goal: 'text-amber-500 bg-amber-500/10',
  note: 'text-emerald-500 bg-emerald-500/10',
  habit: 'text-orange-500 bg-orange-500/10',
  transaction: 'text-teal-500 bg-teal-500/10',
  diary: 'text-rose-500 bg-rose-500/10',
};

const MOOD_LABELS: Record<string, string> = {
  happy: '😄 Bahagia',
  productive: '🚀 Produktif',
  neutral: '😐 Netral',
  tired: '🥱 Lelah',
  stressed: '🤯 Stres',
  sad: '😔 Sedih',
  sick: '🤒 Sakit',
};

const RECENT_KEY = 'hilmios_spotlight_history';

function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimeout(() => setHistory(parsed), 0);
      }
    } catch {}
  }, []);

  const add = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory(prev => {
      const next = [query, ...prev.filter(h => h !== query)].slice(0, 8);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }, []);

  return { history, add, clear };
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { history, add, clear } = useSearchHistory();

  /* ── Keyboard shortcut Ctrl+K ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => {
          const next = !prev;
          if (next) {
            setQuery('');
            setFilter('all');
            setSelectedIndex(0);
          }
          return next;
        });
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Focus input on open ── */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ── Search Supabase ── */
  useEffect(() => {
    if (!query.trim()) {
      const t = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(t);
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const q = `%${query}%`;
        const all: SearchResult[] = [];

        const [tasks, projects, goals, notes, habits, transactions, diaries] = await Promise.all([
          supabase.from('tasks').select('id, title, status, priority').ilike('title', q).limit(5),
          supabase.from('projects').select('id, title, status').ilike('title', q).limit(5),
          supabase.from('goals').select('id, title, goal_type, progress').ilike('title', q).limit(5),
          supabase.from('notes').select('id, title, excerpt').ilike('title', q).limit(5),
          supabase.from('habits').select('id, title, target_frequency').ilike('title', q).limit(4),
          supabase.from('transactions').select('id, description, amount, type, category').ilike('description', q).limit(4),
          supabase.from('diary_entries').select('id, title, content, entry_date, mood').or(`title.ilike.${q},content.ilike.${q}`).limit(4),
        ]);

        (tasks.data || []).forEach(t => all.push({ id: t.id, type: 'task', title: t.title, subtitle: `${t.priority} · ${t.status}`, href: '/portal/tasks' }));
        (projects.data || []).forEach(p => all.push({ id: p.id, type: 'project', title: p.title, subtitle: p.status ?? 'Proyek', href: `/portal/projects/${p.id}` }));
        (goals.data || []).forEach(g => all.push({ id: g.id, type: 'goal', title: g.title, subtitle: `${g.progress ?? 0}% · ${g.goal_type ?? ''}`, href: `/portal/goals/${g.id}` }));
        (notes.data || []).forEach(n => all.push({ id: n.id, type: 'note', title: n.title, subtitle: n.excerpt || 'Catatan', href: `/portal/notes/${n.id}` }));
        (habits.data || []).forEach(h => all.push({ id: h.id, type: 'habit', title: h.title, subtitle: h.target_frequency ?? 'Kebiasaan', href: `/portal/habits/${h.id}` }));
        (transactions.data || []).forEach(tx => all.push({ id: tx.id, type: 'transaction', title: tx.description || 'Transaksi', subtitle: `${tx.type === 'income' ? '+' : '-'} Rp${Number(tx.amount).toLocaleString('id')} · ${tx.category}`, href: '/portal/finance' }));
        
        (diaries.data || []).forEach(d => {
          const displayDate = d.entry_date ? format(parseISO(d.entry_date), 'EEEE, d MMMM yyyy', { locale: localeId }) : '';
          const displayTitle = d.title || `Jurnal - ${displayDate}`;
          const cleanContent = d.content ? d.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() : '';
          const textSnippet = cleanContent.substring(0, 80);
          const moodInfo = d.mood ? MOOD_LABELS[d.mood] || d.mood : '';
          const displaySubtitle = [
            moodInfo,
            d.title ? displayDate : null,
            textSnippet
          ].filter(Boolean).join(' · ');

          all.push({
            id: d.id,
            type: 'diary',
            title: displayTitle,
            subtitle: displaySubtitle || 'Jurnal harian',
            href: `/portal/diary/${d.entry_date}`
          });
        });

        setResults(filter === 'all' ? all : all.filter(r => r.type === filter));
        setSelectedIndex(0);
      } catch (e) {
        console.error('Spotlight search error:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, filter]);

  const navigateTo = useCallback((result: SearchResult) => {
    add(result.title);
    router.push(result.href);
    setOpen(false);
  }, [add, router]);

  /* ── Keyboard navigation in results ── */
  const displayResults = filter === 'all' ? results : results.filter(r => r.type === filter);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, displayResults.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && displayResults[selectedIndex]) {
        navigateTo(displayResults[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, displayResults, selectedIndex, navigateTo]);

  if (!open) {
    return (
      <button
        id="spotlight-trigger"
        onClick={() => {
          setQuery('');
          setFilter('all');
          setSelectedIndex(0);
          setOpen(true);
        }}
        className="hidden sm:flex items-center gap-2 h-9 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 group"
        aria-label="Buka pencarian (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Cari...</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:border-primary/30 transition-colors">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>
    );
  }

  return (
    <div
      id="spotlight-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 glass" />

      {/* Panel */}
      <div className="spotlight-panel relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[75vh]">

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari tugas, proyek, tujuan, catatan, jurnal..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
          )}
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-none">
          {FILTER_TABS.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setSelectedIndex(0); }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all',
                  filter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <TabIcon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results or Recent */}
        <div className="overflow-y-auto flex-1">
          {!query.trim() ? (
            /* Recent Searches */
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Pencarian Terbaru
                </p>
                {history.length > 0 && (
                  <button onClick={clear} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    Hapus
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ketik untuk mulai mencari di seluruh Hilmi OS...
                </p>
              ) : (
                <div className="space-y-0.5">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(h)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-left"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{h}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : displayResults.length === 0 && !loading ? (
            /* No Results */
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Tidak ada hasil untuk &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Coba kata kunci yang berbeda</p>
            </div>
          ) : (
            /* Results */
            <div className="p-2">
              {displayResults.map((result, idx) => {
                const colorClass = TYPE_COLOR[result.type];
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={result.id}
                    onClick={() => navigateTo(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                      isSelected ? 'bg-primary/8 border border-primary/15' : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold', colorClass)}>
                      {TYPE_LABEL[result.type][0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md', colorClass)}>
                          {TYPE_LABEL[result.type]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mt-0.5">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 transition-colors', isSelected ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground')} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono-num">
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5">↑↓</kbd> Navigasi</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd> Buka</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5">Esc</kbd> Tutup</span>
          </div>
          {displayResults.length > 0 && (
            <span className="text-[10px] text-muted-foreground font-mono-num">{displayResults.length} hasil</span>
          )}
        </div>
      </div>
    </div>
  );
}
