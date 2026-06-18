import { createClient } from '@/lib/supabase/server';
import { Transaction } from '../types/finance.types';
import { TransactionFormData } from '../validators/finance.schema';

export const financeRepository = {
  async getTransactions(limit?: number): Promise<Transaction[]> {
    const supabase = await createClient();
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  },

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    const supabase = await createClient();
    
    // Create date strings for >= startOfMonth and < endOfMonth
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  },

  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: newTx, error } = await supabase
      .from('finance_transactions')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return newTx as Transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    const supabase = await createClient();
    const { data: updatedTx, error } = await supabase
      .from('finance_transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedTx as Transaction;
  }
};
