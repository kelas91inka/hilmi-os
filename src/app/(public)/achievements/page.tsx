import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { Calendar, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pencapaian | Hilmi OS',
  description: 'Pencapaian dan tonggak perjalanan Muhammad Hilmi Mu\'afa.',
};

async function getAchievements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .order('achievement_date', { ascending: false });
  return data || [];
}

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-24 space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Pencapaian</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Tonggak Perjalanan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Momen-momen penting yang membentuk perjalanan saya dalam dunia teknologi.
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-24">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada pencapaian yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement: any) => (
            <div
              key={achievement.id}
              className="flex gap-5 p-5 rounded-2xl border bg-card hover:shadow-sm transition-all"
            >
              {achievement.image_url ? (
                <img
                  src={achievement.image_url}
                  alt={achievement.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-7 h-7 text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base">{achievement.title}</h3>
                    {achievement.category && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                        {achievement.category}
                      </span>
                    )}
                  </div>
                  {achievement.achievement_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(achievement.achievement_date), 'MMM yyyy', { locale: id })}
                    </span>
                  )}
                </div>
                {achievement.description && (
                  <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
