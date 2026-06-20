import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Award, CalendarDays, Image as ImageIcon, Settings } from 'lucide-react';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';

export const metadata: Metadata = {
  title: 'CMS | Hilmi OS',
};

async function getCMSStats() {
  const supabase = await createClient();
  const [blogs, achievements, timeline, gallery] = await Promise.all([
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('achievements').select('id', { count: 'exact', head: true }),
    supabase.from('timeline_events').select('id', { count: 'exact', head: true }),
    supabase.from('gallery').select('id', { count: 'exact', head: true }),
  ]);
  return {
    blogs: blogs.count ?? 0,
    achievements: achievements.count ?? 0,
    timeline: timeline.count ?? 0,
    gallery: gallery.count ?? 0,
  };
}

const CMS_SECTIONS = [
  {
    href: '/portal/cms/blog',
    icon: BookOpen,
    title: 'Blog',
    description: 'Tulis, edit, dan publikasikan artikel blog untuk konsumsi publik.',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/5 dark:border-blue-500/10',
    statKey: 'blogs' as const,
    statLabel: 'artikel',
  },
  {
    href: '/portal/cms/achievements',
    icon: Award,
    title: 'Pencapaian',
    description: 'Kelola daftar pencapaian, sertifikasi, dan penghargaan Anda.',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-500/5 dark:border-yellow-500/10',
    statKey: 'achievements' as const,
    statLabel: 'pencapaian',
  },
  {
    href: '/portal/cms/timeline',
    icon: CalendarDays,
    title: 'Timeline',
    description: 'Kelola linimasa perjalanan karir, pendidikan, dan event penting.',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/5 dark:border-purple-500/10',
    statKey: 'timeline' as const,
    statLabel: 'event',
  },
  {
    href: '/portal/cms/gallery',
    icon: ImageIcon,
    title: 'Galeri',
    description: 'Kelola koleksi foto, karya visual, dan dokumentasi gambar publik.',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10',
    statKey: 'gallery' as const,
    statLabel: 'foto',
  },
];

export default async function CMSHubPage() {
  const stats = await getCMSStats();

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto py-2 md:py-4">
      <PageContextSetter context="Manajemen CMS Hub" />
      
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/65 backdrop-blur-xs p-6 rounded-2xl border glow-card">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-primary animate-spin-slow" />
            Content Management Hub
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kelola konten publik situs web Anda secara instan dan tanpa menyentuh kode database.
          </p>
        </div>
      </div>

      {/* Grid Menu Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CMS_SECTIONS.map(({ href, icon: Icon, title, description, color, statKey, statLabel }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 p-6 rounded-2xl border bg-card/45 backdrop-blur-xs glow-card hover:border-primary/25 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <p className="text-3xl font-extrabold font-mono-num text-foreground">
                {stats[statKey]}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">{statLabel}</span>
              </p>
            </div>
            
            <div className="space-y-1.5 mt-2">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
