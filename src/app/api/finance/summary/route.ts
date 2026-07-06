import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const today = new Date();
    const year = parseInt(searchParams.get('year') || String(today.getFullYear()));
    const month = parseInt(searchParams.get('month') || String(today.getMonth() + 1));

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('finance_transactions')
      .select('type, amount, category')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate);

    if (error) throw error;

    const transactions = data || [];
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    // Top expense category
    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (t.category) byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    return Response.json({
      totalIncome,
      totalExpense,
      netBalance,
      topCategory: topEntry ? { name: topEntry[0], amount: topEntry[1] } : null,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
