import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Award, CalendarDays, Image as ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CMS | Hilmi OS',
};

async function getCMSStats() {
  const supabase = await createClient();
  const [blogs, achievements, timeline] = await Promise.all([
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('achievements').select('id', { count: 'exact', head: true }),
    supabase.from('timeline_events').select('id', { count: 'exact', head: true }),
  ]);
  return {
    blogs: blogs.count ?? 0,
    achievements: achievements.count ?? 0,
    timeline: timeline.count ?? 0,
  };
}

const CMS_SECTIONS = [
  {
    href: '/portal/cms/blog',
    icon: BookOpen,
    title: 'Blog',
    description: 'Tulis, edit, dan publikasikan artikel blog.',
    color: 'bg-blue-500/10 text-blue-600',
    statKey: 'blogs' as const,
    statLabel: 'artikel',
  },
  {
    href: '/portal/cms/achievements',
    icon: Award,
    title: 'Pencapaian',
    description: 'Kelola daftar pencapaian dan penghargaan.',
    color: 'bg-yellow-500/10 text-yellow-600',
    statKey: 'achievements' as const,
    statLabel: 'pencapaian',
  },
  {
    href: '/portal/cms/timeline',
    icon: CalendarDays,
    title: 'Timeline',
    description: 'Kelola perjalanan kronologis.',
    color: 'bg-purple-500/10 text-purple-600',
    statKey: 'timeline' as const,
    statLabel: 'event',
  },
];

export default async function CMSHubPage() {
  const stats = await getCMSStats();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Content Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola seluruh konten publik tanpa menyentuh database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CMS_SECTIONS.map(({ href, icon: Icon, title, description, color, statKey, statLabel }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 p-6 rounded-2xl border bg-card hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-base group-hover:text-primary transition-colors">{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
            <p className="text-2xl font-bold mt-auto">
              {stats[statKey]}
              <span className="text-sm font-normal text-muted-foreground ml-1">{statLabel}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

