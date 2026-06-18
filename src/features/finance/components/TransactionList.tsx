'use client';

import { Transaction } from '../types/finance.types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowDownRight, ArrowUpRight, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
        <Receipt className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Transaksi</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">Tidak ada transaksi yang tercatat pada bulan ini. Catat pemasukan atau pengeluaran pertamamu!</p>
        <TransactionFormDialog />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      <div className="flex flex-col">
        {transactions.map((tx, idx) => {
          const isIncome = tx.type === 'income';
          return (
            <div 
              key={tx.id} 
              className={`flex items-center justify-between p-4 ${idx !== transactions.length - 1 ? 'border-b' : ''} hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium">{tx.description || tx.category || 'Transaksi Tanpa Judul'}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(parseISO(tx.transaction_date), 'dd MMM yyyy', { locale: id })}</span>
                    {tx.category && (
                      <>
                        <span>•</span>
                        <span>{tx.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => setEditingId(tx.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                    onClick={() => confirmDelete(tx)}
                    disabled={deletingId === tx.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <TransactionFormDialog 
                open={editingId === tx.id}
                onOpenChange={(open) => {
                  if (!open) setEditingId(null);
                }}
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
