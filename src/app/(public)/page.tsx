import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, ExternalLink, BookOpen, FolderKanban, Trophy, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

async function getLandingData() {
  const supabase = await createClient();

  const [projectsRes, blogsRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, description, status, cover_image, featured')
      .eq('visibility', 'public')
      .eq('featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),

    supabase
      .from('blogs')
      .select('id, title, slug, excerpt, published_at, cover_image')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3),
  ]);

  return {
    featuredProjects: projectsRes.data || [],
    recentPosts: blogsRes.data || [],
  };
}

export default async function LandingPage() {
  const { featuredProjects, recentPosts } = await getLandingData();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 text-xs border rounded-full px-4 py-1.5 text-muted-foreground bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Tersedia untuk kolaborasi
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Muhammad{' '}
            <span className="text-primary">Hilmi</span>
            <br />
            Mu&apos;afa
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Technology enthusiast, network engineer, dan web developer yang membangun sistem
            digital premium. Ini adalah personal operating system dan portfolio saya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Lihat Proyek
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Tentang Saya
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto pt-8 border-t border-border/40">
            <div className="text-center">
              <div className="text-2xl font-bold">4+</div>
              <div className="text-xs text-muted-foreground">Tahun Belajar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {featuredProjects.length > 0 ? `${featuredProjects.length}+` : '10+'}
              </div>
              <div className="text-xs text-muted-foreground">Proyek</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-xs text-muted-foreground">Semangat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-20 px-4">
          <div className="container max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Proyek Unggulan</h2>
                <p className="text-muted-foreground mt-1">Yang sedang saya bangun</p>
              </div>
              <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
                Semua Proyek <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group block rounded-2xl border bg-card hover:shadow-md transition-all overflow-hidden"
                >
                  {project.cover_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <FolderKanban className="w-10 h-10 text-primary/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                      Lihat Detail <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="py-20 px-4 bg-muted/30">
          <div className="container max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Tulisan Terbaru</h2>
                <p className="text-muted-foreground mt-1">Pemikiran dan catatan saya</p>
              </div>
              <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1">
                Semua Tulisan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border bg-card hover:shadow-md transition-all p-5"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <BookOpen className="w-3 h-3" />
                    {post.published_at
                      ? format(parseISO(post.published_at), 'd MMMM yyyy', { locale: id })
                      : 'Baru'}
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Mari Berkolaborasi
          </h2>
          <p className="text-muted-foreground text-lg">
            Saya terbuka untuk proyek, diskusi, atau sekadar berbagi ilmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hilmi@muhlim.my.id"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Kirim Email
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
