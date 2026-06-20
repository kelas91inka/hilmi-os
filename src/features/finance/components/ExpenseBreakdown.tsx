'use client';

import { useMemo } from 'react';
import { Transaction } from '../types/finance.types';
import { PieChart } from 'lucide-react';

interface ExpenseBreakdownProps {
  transactions: Transaction[];
}

export function ExpenseBreakdown({ transactions }: ExpenseBreakdownProps) {
  const expenses = transactions.filter(t => t.type === 'expense');

  const breakdown = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    expenses.forEach(tx => {
      const cat = tx.category || 'Lainnya';
      data[cat] = (data[cat] || 0) + tx.amount;
      total += tx.amount;
    });

    return Object.entries(data)
      .map(([name, amount]) => ({ name, amount, percent: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getBarColor = (index: number) => {
    const colors = [
      'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
      'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)]',
      'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
      'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]',
    ];
    return colors[index % colors.length];
  };

  if (expenses.length === 0) return null;

  return (
    <div className="bg-card p-5 rounded-2xl border glow-card space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Rincian Pengeluaran
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Berdasarkan kategori pengeluaran bulan ini</p>
      </div>

      <div className="space-y-4">
        {breakdown.map((item, i) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="font-mono-num font-bold text-foreground">{formatCurrency(item.amount)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(i)}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono-num">
              <span>{item.percent.toFixed(1)}% dari total pengeluaran</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

