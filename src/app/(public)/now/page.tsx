import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { FolderKanban, Target, BookOpen, ArrowLeft, Calendar } from 'lucide-react';
import { getDateLocale, translations, type Language } from '@/lib/i18n';
import { getLanguageServer } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.muhlim.my.id';
  const title = lang === 'en' ? 'Now | Hilmi OS' : 'Sekarang | Hilmi OS';
  const description = lang === 'en'
    ? 'What Muhammad Hilmi Mu\'afa is currently working on.'
    : 'Apa yang sedang dikerjakan Muhammad Hilmi Mu\'afa sekarang.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/now`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/now`,
      type: 'website',
    },
  };
}

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

export default async function NowPage() {
  const { activeProjects, activeGoals, recentPosts } = await getNowData();
  const lang = await getLanguageServer();
  const t = translations[lang];
  const dateLocale = getDateLocale(lang);

  const updatedAt = format(new Date(), "d MMMM yyyy", { locale: dateLocale });

  const GOAL_TYPE: Record<string, Record<Language, string>> = {
    mingguan: { id: 'Mingguan', en: 'Weekly' },
    bulanan: { id: 'Bulanan', en: 'Monthly' },
    tahunan: { id: 'Tahunan', en: 'Yearly' },
    lifetime: { id: 'Lifetime', en: 'Lifetime' },
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24 space-y-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t.now.back}
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {t.now.title}
        </h1>
        <p className="text-muted-foreground">
          {t.now.subtitle} <span className="font-medium text-foreground">{updatedAt}</span>.
        </p>
        <p className="text-sm text-muted-foreground italic">
          {t.now.inspired}{' '}
          <a href="https://nownownow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            nownownow.com
          </a>
        </p>
      </div>

      {/* Location / Context */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.now.where}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {lang === 'en' ? translations.en.now.whereDesc : translations.id.now.whereDesc}
        </p>
      </section>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-500" />
            {t.now.building}
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
            {t.now.activeGoals}
          </h2>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl border bg-card space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                    {GOAL_TYPE[goal.goal_type ?? '']?.[lang] || goal.goal_type}
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
            {t.now.recentWriting}
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
                    {format(new Date(post.published_at), 'd MMM yyyy', { locale: dateLocale })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="pt-6 border-t space-y-3">
        <h2 className="text-xl font-bold">{t.now.contact}</h2>
        <p className="text-muted-foreground">
          {t.now.contactDesc}{' '}
          <a href="mailto:hilmi@muhlim.my.id" className="text-primary hover:underline font-medium">
            {t.now.emailBtn}
          </a>{' '}
          atau cek halaman{' '}
          <Link href="/about" className="text-primary hover:underline font-medium">
            {t.now.aboutBtn}
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
