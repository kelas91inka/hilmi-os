'use client';

import { Transaction } from '../types/finance.types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowDownRight, ArrowUpRight, Trash2, Receipt } from 'lucide-react';
import { deleteTransactionAction } from '../actions/finance.actions';
import { useState } from 'react';
import { TransactionFormDialog } from './TransactionFormDialog';
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const confirmDelete = (tx: Transaction) => {
    setTransactionToDelete(tx);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (transactionToDelete) {
      setDeletingId(transactionToDelete.id);
      await deleteTransactionAction(transactionToDelete.id);
      setDeletingId(null);
      setDeleteConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card glow-card">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">Belum Ada Transaksi</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
          Tidak ada transaksi bulan ini. Catat pemasukan atau pengeluaran pertamamu!
        </p>
        <TransactionFormDialog />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card glow-card overflow-hidden">
      <div className="flex flex-col divide-y divide-border/50">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {isIncome
                    ? <ArrowUpRight className="w-4.5 h-4.5" />
                    : <ArrowDownRight className="w-4.5 h-4.5" />}
                </div>

                {/* Description + date + category */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.description || tx.category || 'Transaksi Tanpa Judul'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono-num">
                      {format(parseISO(tx.transaction_date), 'dd MMM yyyy', { locale: id })}
                    </span>
                    {tx.category && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        {tx.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount + actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <span className={`font-mono-num text-sm font-bold ${
                  isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                }`}>
                  {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                    onClick={() => setEditingId(tx.id)}
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    onClick={() => confirmDelete(tx)}
                    disabled={deletingId === tx.id}
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <TransactionFormDialog
                open={editingId === tx.id}
                onOpenChange={(open) => { if (!open) setEditingId(null); }}
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
        })}
      </div>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Transaksi"
        description={`Apakah Anda yakin ingin menghapus transaksi "${transactionToDelete?.description || transactionToDelete?.category || 'Untitled'}" senilai ${transactionToDelete ? formatCurrency(transactionToDelete.amount) : '0'}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
