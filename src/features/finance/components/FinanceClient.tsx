'use client';

import { useState, useMemo } from 'react';
import { Transaction, MonthlySummary } from '../types/finance.types';
import { TransactionList } from './TransactionList';
import { ExpenseBreakdown } from './ExpenseBreakdown';
import { MonthlyOverviewCards } from './MonthlyOverviewCards';
import { MonthNavigator } from './MonthNavigator';
import { TransactionFormDialog } from './TransactionFormDialog';
import { FinanceCalendarView } from "./FinanceCalendarView";
import { Search, X, List, CalendarRange, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPE_LABELS: Record<string, string> = {
  all: 'Semua Tipe',
  income: 'Pemasukan',
  expense: 'Pengeluaran',
};

const SORT_LABELS: Record<string, string> = {
  date_desc: 'Terbaru',
  date_asc: 'Terlama',
  amount_desc: 'Nominal Terbesar',
  amount_asc: 'Nominal Terkecil',
};

interface FinanceClientProps {
  initialTransactions: Transaction[];
  summary: MonthlySummary;
  currentMonth: number;
  currentYear: number;
}

export function FinanceClient({
  initialTransactions,
  summary,
  currentMonth,
  currentYear,
}: FinanceClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Extract unique categories from current month's transactions
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    initialTransactions.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [initialTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      const matchesSearch =
        (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [initialTransactions, searchQuery, typeFilter, categoryFilter]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const amountA = Number(a.amount);
      const amountB = Number(b.amount);

      if (sortBy === 'date_desc') {
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      if (sortBy === 'amount_desc') {
        return amountB - amountA;
      }
      if (sortBy === 'amount_asc') {
        return amountA - amountB;
      }
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Dynamic summary based on filtered transactions (only if filters are active, otherwise use page summary)
  const isFiltered = searchQuery !== '' || typeFilter !== 'all' || categoryFilter !== 'all';
  const displaySummary = useMemo(() => {
    if (!isFiltered) return summary;

    return filteredTransactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount);
        if (tx.type === 'income') {
          acc.totalIncome += amount;
          acc.netBalance += amount;
        } else {
          acc.totalExpense += amount;
          acc.netBalance -= amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, netBalance: 0 }
    );
  }, [filteredTransactions, summary, isFiltered]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <MonthlyOverviewCards summary={displaySummary} />

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row gap-3 justify-between items-stretch xl:items-center bg-card p-4 rounded-2xl border border-border w-full shadow-sm">
        
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <MonthNavigator currentMonth={currentMonth} currentYear={currentYear} />
        </div>

        {/* Filters and Search and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari deskripsi..."
              className="pl-9 h-9 w-full rounded-xl"
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

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(val: 'all' | 'income' | 'expense' | null) => setTypeFilter(val || 'all')}>
            <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs">
              <SelectValue placeholder="Tipe">{TYPE_LABELS[typeFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(val: string | null) => setCategoryFilter(val || 'all')}>
            <SelectTrigger className="h-9 w-[140px] rounded-xl text-xs">
              <SelectValue placeholder="Kategori">
                {categoryFilter === 'all' ? 'Semua Kategori' : categoryFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={sortBy} onValueChange={(val: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | null) => setSortBy(val || 'date_desc')}>
            <SelectTrigger className="h-9 w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="Urutkan">{SORT_LABELS[sortBy]}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="date_desc">Terbaru</SelectItem>
              <SelectItem value="date_asc">Terlama</SelectItem>
              <SelectItem value="amount_desc">Nominal Terbesar</SelectItem>
              <SelectItem value="amount_asc">Nominal Terkecil</SelectItem>
            </SelectContent>
          </Select>

          {/* Segmented View Switcher */}
          <div className="flex bg-muted/65 p-0.5 rounded-xl border border-border/60 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'list'
                  ? "bg-background text-foreground shadow-xs border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Daftar"
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'calendar'
                  ? "bg-background text-foreground shadow-xs border border-border/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Tampilan Kalender"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
          </div>

          <div className="h-4 border-l border-border/50 hidden sm:block mx-1" />

          {/* Add Transaction Dialog */}
          <TransactionFormDialog />
        </div>
      </div>

      {/* Filter summary */}
      {isFiltered && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Menampilkan <span className="font-bold text-foreground">{sortedTransactions.length}</span> dari{' '}
            <span className="font-bold text-foreground">{initialTransactions.length}</span> transaksi bulan ini
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setCategoryFilter('all');
            }}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Bersihkan Filter
          </button>
        </div>
      )}

      {/* Finance Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2 px-1">
              <Wallet className="w-4.5 h-4.5 text-primary" />
              Daftar Transaksi
            </h3>
            <TransactionList transactions={sortedTransactions} />
          </div>

          <div className="space-y-4">
            <ExpenseBreakdown transactions={sortedTransactions} />
          </div>
        </div>
      ) : (
        /* Calendar View Mode */
        <FinanceCalendarView
          transactions={sortedTransactions}
          month={currentMonth}
          year={currentYear}
        />
      )}
    </div>
  );
}
