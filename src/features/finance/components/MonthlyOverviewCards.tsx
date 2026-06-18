import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlySummary } from '../types/finance.types';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

interface MonthlyOverviewCardsProps {
  summary: MonthlySummary;
}

export function MonthlyOverviewCards({ summary }: MonthlyOverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalIncome)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(summary.totalExpense)}
          </div>
        </CardContent>
      </Card>

      <Card className={summary.netBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Bersih</CardTitle>
          <Wallet className={`h-4 w-4 ${summary.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            {formatCurrency(summary.netBalance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
