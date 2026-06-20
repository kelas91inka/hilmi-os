import { Metadata } from 'next';
import { financeService } from '@/features/finance/services/finance.service';
import { FinanceClient } from '@/features/finance/components/FinanceClient';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';
import { WalletCards } from 'lucide-react';

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
    <div className="flex-1 space-y-6 max-w-5xl mx-auto">
      <PageContextSetter context="Manajemen Keuangan" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <WalletCards className="w-7 h-7 text-primary" />
            Keuangan
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Lacak pemasukan, pengeluaran, saldo bersih, dan sebaran transaksi bulanan Anda secara praktis.
          </p>
        </div>
      </div>

      <FinanceClient
        initialTransactions={transactions}
        summary={summary}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
