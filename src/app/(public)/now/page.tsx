import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FolderKanban, Target, BookOpen, ArrowLeft, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sekarang | Hilmi OS',
  description: 'Apa yang sedang dikerjakan Muhammad Hilmi Mu\'afa sekarang.',
};

async function getNowData() {
  const supabase = await createClient();
  const [projectsRes, goalsRes, blogsRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, description, status')
      .eq('status', 'active')
      .eq('visibility', 'public')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('goals')
      .select('id, title, goal_type, status, progress')
      .eq('status', 'active')
      .order('target_date', { ascending: true })
      .limit(5),
    supabase
      .from('blogs')
      .select('id, title, slug, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3),
  ]);
  return {
    activeProjects: projectsRes.data || [],
    activeGoals: goalsRes.data || [],
    recentPosts: blogsRes.data || [],
  };
}

const GOAL_TYPE: Record<string, string> = {
  mingguan: 'Mingguan', bulanan: 'Bulanan', tahunan: 'Tahunan', lifetime: 'Lifetime',
};

export default async function NowPage() {
  const { activeProjects, activeGoals, recentPosts } = await getNowData();
  const updatedAt = format(new Date(), "d MMMM yyyy", { locale: id });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24 space-y-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Sekarang
        </h1>
        <p className="text-muted-foreground">
          Halaman ini menampilkan apa yang sedang saya fokuskan saat ini.
          Diperbarui: <span className="font-medium text-foreground">{updatedAt}</span>.
        </p>
        <p className="text-sm text-muted-foreground italic">
          Terinspirasi dari{' '}
          <a href="https://nownownow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            nownownow.com
          </a>
        </p>
      </div>

      {/* Location / Context */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">📍 Di Mana</h2>
        <p className="text-muted-foreground leading-relaxed">
          Sedang berada di Indonesia, fokus pada pengembangan diri sebagai
          network engineer dan web developer. Aktif belajar, membangun proyek,
          dan mendokumentasikan perjalanan.
        </p>
      </section>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-500" />
            Sedang Dibangun
          </h2>
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-sm">{project.title}</h3>
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Tujuan Aktif
          </h2>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl border bg-card space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                    {GOAL_TYPE[goal.goal_type ?? ''] ?? goal.goal_type}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${goal.progress ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{goal.progress ?? 0}%</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Writing */}
      {recentPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            Tulisan Terbaru
          </h2>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
              >
                <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </span>
                {post.published_at && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-4 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.published_at), 'd MMM yyyy', { locale: id })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="pt-6 border-t space-y-3">
        <h2 className="text-xl font-bold">✉️ Kontak</h2>
        <p className="text-muted-foreground">
          Ingin berkolaborasi atau sekadar ngobrol?{' '}
          <a href="mailto:hilmi@muhlim.my.id" className="text-primary hover:underline font-medium">
            Kirim email
          </a>{' '}
          atau cek halaman{' '}
          <Link href="/about" className="text-primary hover:underline font-medium">
            Tentang
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
