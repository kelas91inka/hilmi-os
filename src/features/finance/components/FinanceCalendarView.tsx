'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '../types/finance.types';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TransactionFormDialog } from './TransactionFormDialog';
import { deleteTransactionAction } from '../actions/finance.actions';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
  X
} from 'lucide-react';

interface FinanceCalendarViewProps {
  transactions: Transaction[];
  month: number; // 1-12
  year: number;
}

export function FinanceCalendarView({ transactions, month, year }: FinanceCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Generate calendar days for the given month and year
  const days = useMemo(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    const gridStart = startOfWeek(start, { weekStartsOn: 1 }); // Start week on Monday
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month, year]);

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      const dateStr = tx.transaction_date.split('T')[0];
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(tx);
    });
    return map;
  }, [transactions]);

  // Date format helper
  const formatDate = (date: Date) => format(date, 'EEEE, d MMMM yyyy', { locale: localeId });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    const absVal = Math.abs(amount);
    if (absVal >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}jt`;
    }
    if (absVal >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  // Get selected day transactions
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayTransactions = selectedDateStr ? transactionsByDate[selectedDateStr] || [] : [];

  const handleExecuteDelete = async () => {
    if (deletingTx) {
      await deleteTransactionAction(deletingTx.id);
      setDeletingTx(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header / Days of the week */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-1 px-1">
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
        <span>Min</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTxList = transactionsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, new Date(year, month - 1));
          const isTodayDate = isToday(day);

          // Compute daily summary
          let dailyIncome = 0;
          let dailyExpense = 0;
          dayTxList.forEach((t) => {
            const amt = Number(t.amount);
            if (t.type === 'income') dailyIncome += amt;
            else dailyExpense += amt;
          });
          const dailyNet = dailyIncome - dailyExpense;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "min-h-[85px] sm:min-h-[100px] border rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                !isCurrentMonth ? "opacity-35 hover:opacity-50" : "",
                isTodayDate ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
                dayTxList.length > 0
                  ? dailyNet > 0
                    ? "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/25 dark:border-emerald-500/15"
                    : dailyNet < 0
                    ? "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/25 dark:border-rose-500/15"
                    : "bg-muted/40 hover:bg-muted/60 border-border"
                  : "bg-card hover:bg-muted/30 border-border"
              )}
            >
              {/* Day Number */}
              <div className="flex justify-between items-center">
                <span className={cn(
                  "text-xs font-bold leading-none font-mono",
                  isTodayDate ? "text-primary" : "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {dayTxList.length > 0 && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-muted/60 border border-border/40 text-muted-foreground">
                    {dayTxList.length} tx
                  </span>
                )}
              </div>

              {/* Day Balance Indicator */}
              {dayTxList.length > 0 && (
                <div className="mt-auto space-y-1">
                  {dailyIncome > 0 && (
                    <div className="flex items-center justify-end text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono-num leading-none">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                      <span>+{formatCompactCurrency(dailyIncome)}</span>
                    </div>
                  )}
                  {dailyExpense > 0 && (
                    <div className="flex items-center justify-end text-[9px] font-bold text-rose-600 dark:text-rose-400 font-mono-num leading-none">
                      <TrendingDown className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                      <span>-{formatCompactCurrency(dailyExpense)}</span>
                    </div>
                  )}
                  <div className={cn(
                    "text-[10px] font-extrabold font-mono-num text-right border-t border-border/20 pt-1 leading-none mt-1",
                    dailyNet > 0 ? "text-emerald-700 dark:text-emerald-300" : dailyNet < 0 ? "text-rose-700 dark:text-rose-300" : "text-muted-foreground"
                  )}>
                    {dailyNet > 0 ? '+' : ''}{formatCompactCurrency(dailyNet)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Transaction Detail Dialog */}
      <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-primary" />
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>

          {selectedDate && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 border rounded-2xl p-3 text-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Tanggal</span>
                <h4 className="text-sm font-bold text-foreground mt-0.5">{formatDate(selectedDate)}</h4>
              </div>

              {/* Transactions List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {dayTransactions.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">Tidak ada transaksi di hari ini.</p>
                ) : (
                  dayTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border/80 hover:bg-muted/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                            isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{tx.description || tx.category || 'Tanpa Judul'}</p>
                            {tx.category && (
                              <span className="text-[9px] px-1 py-0.1 bg-muted rounded border border-border mt-0.5 inline-block text-muted-foreground">
                                {tx.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                          <span className={cn(
                            "font-bold font-mono-num text-xs",
                            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                          )}>
                            {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                          </span>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => setEditingTxId(tx.id)}
                              className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTx(tx)}
                              className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Edit dialog */}
                        <TransactionFormDialog
                          open={editingTxId === tx.id}
                          onOpenChange={(open) => !open && setEditingTxId(null)}
                          initialData={{
                            id: tx.id,
                            type: tx.type as 'income' | 'expense',
                            amount: tx.amount,
                            category: tx.category,
                            description: tx.description,
                            transaction_date: tx.transaction_date,
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add transaction for selected date */}
              <div className="flex justify-end pt-2 border-t">
                <TransactionFormDialog
                  initialData={{
                    type: 'expense',
                    amount: 0,
                    transaction_date: selectedDateStr,
                  } as any}
                  trigger={
                    <Button size="sm" className="rounded-xl text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Transaksi
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deletingTx !== null}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleExecuteDelete}
        title="Hapus Transaksi"
        description={`Apakah Anda yakin ingin menghapus transaksi "${deletingTx?.description || deletingTx?.category || 'Untitled'}" senilai ${deletingTx ? formatCurrency(deletingTx.amount) : '0'}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
