import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AchievementCMS } from '@/features/cms/components/AchievementCMS';

export const metadata: Metadata = {
  title: 'Pencapaian CMS | Hilmi OS',
};

async function getAchievements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .order('achievement_date', { ascending: false });
  return data || [];
}

export default async function AchievementsCMSPage() {
  const items = await getAchievements();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <AchievementCMS initialItems={items} />
    </div>
  );
}
