import { getDashboardData } from '@/features/dashboard/repositories/dashboard.repository';
import { CommandCenter } from '@/features/dashboard/components/CommandCenter';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageContextSetter context="Dashboard Utama" />
      <CommandCenter data={data} />
    </>
  );
}
