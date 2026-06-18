import { Metadata } from 'next';
import { financeService } from '@/features/finance/services/finance.service';
import { TransactionList } from '@/features/finance/components/TransactionList';
import { TransactionFormDialog } from '@/features/finance/components/TransactionFormDialog';
import { MonthlyOverviewCards } from '@/features/finance/components/MonthlyOverviewCards';
import { ExpenseBreakdown } from '@/features/finance/components/ExpenseBreakdown';
import { WalletCards } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MonthNavigator } from '@/features/finance/components/MonthNavigator';

interface FinancePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'Keuangan | Hilmi OS',
  description: 'Lacak pemasukan, pengeluaran, dan saldo bulanan Anda',
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
  const today = new Date();
  
  // Parse month and year from query params or fallback to current
  const queryMonth = parseInt(params.month as string);
  const queryYear = parseInt(params.year as string);
  
  const currentYear = !isNaN(queryYear) ? queryYear : today.getFullYear();
  const currentMonth = !isNaN(queryMonth) && queryMonth >= 1 && queryMonth <= 12 
    ? queryMonth 
    : today.getMonth() + 1;

  const { transactions, summary } = await financeService.getMonthlySummary(currentYear, currentMonth);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <WalletCards className="w-8 h-8 text-primary" />
            Keuangan
          </h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <MonthNavigator currentMonth={currentMonth} currentYear={currentYear} />
          <TransactionFormDialog />
        </div>
      </div>

      <MonthlyOverviewCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Transaksi Bulan Ini</h3>
          </div>
          <TransactionList transactions={transactions} />
        </div>
        
        <div className="space-y-4">
          <ExpenseBreakdown transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
