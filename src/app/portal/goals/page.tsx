import { Metadata } from 'next';
import { goalService } from '@/features/goals/services/goal.service';
import { GoalsClient } from '@/features/goals/components/GoalsClient';

export const metadata: Metadata = {
  title: 'Tujuan | Hilmi OS',
  description: 'Kelola tujuan jangka panjang dan pantau progress Anda',
};

export default async function GoalsPage() {
  const goals = await goalService.getGoals();

  return <GoalsClient goals={goals} />;
}
