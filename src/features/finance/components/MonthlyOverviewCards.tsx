import { MonthlySummary } from '../types/finance.types';
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyOverviewCardsProps {
  summary: MonthlySummary;
}

export function MonthlyOverviewCards({ summary }: MonthlyOverviewCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Income */}
      <div className="glow-card rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Pemasukan</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
        </div>
        <div className="font-mono-num text-xl font-bold text-emerald-700 dark:text-emerald-300 leading-tight">
          {formatCurrency(summary.totalIncome)}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Bulan ini</span>
        </div>
      </div>

      {/* Expense */}
      <div className="glow-card rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Pengeluaran</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
        </div>
        <div className="font-mono-num text-xl font-bold text-rose-700 dark:text-rose-300 leading-tight">
          {formatCurrency(summary.totalExpense)}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <TrendingDown className="h-3 w-3 text-rose-500" />
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Bulan ini</span>
        </div>
      </div>

      {/* Net Balance */}
      <div className={cn(
        'glow-card rounded-2xl border p-5',
        isPositive
          ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-card to-card'
          : 'border-rose-500/20 bg-gradient-to-br from-rose-500/8 via-card to-card'
      )}>
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            'text-xs font-bold uppercase tracking-widest',
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            Saldo Bersih
          </span>
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center',
            isPositive ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          )}>
            <Wallet className={cn('h-4 w-4', isPositive ? 'text-emerald-500' : 'text-rose-500')} />
          </div>
        </div>
        <div className={cn(
          'font-mono-num text-xl font-bold leading-tight',
          isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
        )}>
          {isPositive ? '+' : ''}{formatCurrency(summary.netBalance)}
        </div>
        <div className="mt-1.5">
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
            isPositive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          )}>
            {isPositive ? 'Surplus' : 'Defisit'}
          </span>
        </div>
      </div>
    </div>
  );
}
