'use client';

import { useMemo } from 'react';
import { Transaction } from '../types/finance.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  if (expenses.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Rincian Pengeluaran
        </CardTitle>
        <CardDescription>Berdasarkan kategori pengeluaran bulan ini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdown.map((item, i) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
              <span className="font-semibold">{formatCurrency(item.amount)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-orange-500' : 'bg-slate-400'}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{item.percent.toFixed(1)}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
