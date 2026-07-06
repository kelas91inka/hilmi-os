'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WalletCards, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  topCategory?: { name: string; amount: number } | null;
}

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}rb`;
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export function FinanceInsightWidget() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const res = await fetch(`/api/finance/summary?year=${year}&month=${month}`);
        if (!res.ok) throw new Error('Gagal memuat data keuangan');
        const data = await res.json();
        setSummary(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const isPositive = (summary?.netBalance ?? 0) >= 0;

  return (
    <div className="glow-card rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <WalletCards className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Keuangan Bulan Ini</p>
          </div>
        </div>
        <Link
          href="/portal/finance"
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
        </div>
      ) : error ? (
        <p className="text-xs text-muted-foreground text-center py-3">{error}</p>
      ) : summary ? (
        <div className="space-y-3">
          {/* Net Balance */}
          <div className="text-center">
            <div className={cn(
              'font-mono-num text-2xl font-bold',
              isPositive ? 'text-emerald-500' : 'text-red-500'
            )}>
              {isPositive ? '+' : ''}{formatRupiah(summary.netBalance)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Saldo Bersih</p>
          </div>

          {/* Income vs Expense */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] text-muted-foreground font-medium">Pemasukan</span>
              </div>
              <div className="font-mono-num text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(summary.totalIncome)}
              </div>
            </div>
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-[9px] text-muted-foreground font-medium">Pengeluaran</span>
              </div>
              <div className="font-mono-num text-sm font-bold text-red-600 dark:text-red-400">
                {formatRupiah(summary.totalExpense)}
              </div>
            </div>
          </div>

          {/* Spending bar */}
          {summary.totalIncome > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Pengeluaran vs Pemasukan</span>
                <span className="font-mono-num">{Math.min(100, Math.round((summary.totalExpense / summary.totalIncome) * 100))}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn('h-1.5 rounded-full transition-all duration-700', isPositive ? 'bg-emerald-500' : 'bg-red-500')}
                  style={{ width: `${Math.min(100, (summary.totalExpense / Math.max(summary.totalIncome, 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Top category */}
          {summary.topCategory && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Pengeluaran terbesar</span>
              <span className="font-semibold capitalize truncate max-w-[100px]">
                {summary.topCategory.name}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
