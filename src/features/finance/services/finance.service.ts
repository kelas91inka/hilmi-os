import { financeRepository } from '../repositories/finance.repository';
import { transactionSchema } from '../validators/finance.schema';
import { MonthlySummary, Transaction } from '../types/finance.types';

export const financeService = {
  async getRecentTransactions(limit: number = 50) {
    return financeRepository.getTransactions(limit);
  },

  async getMonthlySummary(year: number, month: number): Promise<{ transactions: Transaction[], summary: MonthlySummary }> {
    const transactions = await financeRepository.getTransactionsByMonth(year, month);
    
    const summary = transactions.reduce(
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

    return { transactions, summary };
  },

  async createTransaction(data: unknown) {
    const validated = transactionSchema.parse(data);
    return financeRepository.createTransaction(validated);
  },

  async deleteTransaction(id: string) {
    return financeRepository.deleteTransaction(id);
  },

  async updateTransaction(id: string, data: unknown) {
    const validated = transactionSchema.partial().parse(data);
    return financeRepository.updateTransaction(id, validated);
  }
};
