import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  FolderKanban,
  ExternalLink,
  Mail,
  MessageCircle,
  BookOpen,
  Code2,
  Network,
  Server,
  Zap,
  Link2,
} from 'lucide-react';

const Github = Link2;
const Linkedin = Link2;
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Muhlim — Muhammad Hilmi Mu\'afa',
  description:
    'Personal platform Muhammad Hilmi Mu\'afa — Student, Builder, System Administrator. Proyek, tulisan, dan perjalanan belajar teknologi.',
  openGraph: {
    title: 'Muhlim — Muhammad Hilmi Mu\'afa',
    description: 'Building systems that solve real problems.',
    url: 'https://muhlim.my.id',
  },
};

async function getHomeData() {
  const supabase = await createClient();

  const [projectsRes, postsRes, profileRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, description, status, cover_image, featured')
      .eq('visibility', 'public')
      .or('featured.eq.true,status.eq.active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('posts')
      .select('id, post_type, title, slug, excerpt, body, cover_image, published_at, featured, reading_time')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(4),

    supabase
      .from('profile_settings')
      .select('key, value'),
  ]);

  const profileMap: Record<string, string> = {};
  for (const row of (profileRes.data || [])) {
    profileMap[row.key] = row.value ?? '';
  }

  return {
    featuredProjects: projectsRes.data || [],
    recentPosts: postsRes.data || [],
    profile: profileMap,
  };
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  paused: 'bg-muted text-muted-foreground',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  archived: 'bg-muted text-muted-foreground',
};
const STATUS_LABELS: Record<string, string> = {
  planning: 'Perencanaan',
  active: 'Aktif',
  paused: 'Dijeda',
  completed: 'Selesai',
  archived: 'Diarsipkan',
};

const SKILL_CATEGORIES = [
  {
    icon: Network,
    label: 'Network & Infrastructure',
    items: ['Cisco Networking', 'MikroTik', 'Linux Administration', 'Network Security'],
  },
  {
    icon: Code2,
    label: 'Web Development',
    items: ['Next.js', 'TypeScript', 'React', 'Supabase', 'PostgreSQL'],
  },
  {
    icon: Server,
    label: 'Tools & Platforms',
    items: ['Git', 'Docker', 'Vercel', 'Cloudinary', 'TailwindCSS'],
  },
];

export default async function HomePage() {
  const { featuredProjects, recentPosts, profile } = await getHomeData();

  const featuredPost = recentPosts.find((p) => p.featured);
  const latestPosts = recentPosts.filter((p) => !p.featured).slice(0, 3);

  const contactLinks = [
    { href: `mailto:${profile.email || 'hilmi@muhlim.my.id'}`, icon: Mail, label: 'Email', value: profile.email || 'hilmi@muhlim.my.id' },
    { href: profile.github || 'https://github.com/hilmimuafa', icon: Github, label: 'GitHub', value: 'hilmimuafa' },
    { href: profile.linkedin || 'https://linkedin.com/in/hilmimuafa', icon: Linkedin, label: 'LinkedIn', value: 'hilmimuafa' },
  ];
  if (profile.whatsapp) {
    contactLinks.push({ href: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`, icon: MessageCircle, label: 'WhatsApp', value: profile.whatsapp });
  }

  return (
    <div className="flex flex-col">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-3xl mx-auto text-center space-y-8 relative">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 text-xs border border-border/60 rounded-full px-4 py-1.5 text-muted-foreground bg-background/80 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tersedia untuk kolaborasi
          </div>

          {/* Name */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Muhammad{' '}
              <span className="text-primary">Hilmi</span>{' '}
              Mu&apos;afa
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium tracking-wide">
              {profile.tagline || 'Student · Builder · System Administrator'}
            </p>
          </div>

          {/* Personal statement */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {profile.personal_statement || 'Building systems that solve real problems. Exploring technology, education, and innovation.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-semibold hover:opacity-85 transition-opacity"
            >
              Explore My Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ─── ABOUT MUHLIM ─────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="container max-w-4xl mx-auto space-y-12">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Tentang Saya</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">About Muhlim</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Bio + Education */}
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-base">
                {profile.bio || 'Network engineer dan web developer yang percaya bahwa teknologi harus membuat hidup lebih mudah. Membangun sistem yang elegan, cepat, dan bermakna.'}
              </p>
              {profile.current_focus && (
                <p className="text-muted-foreground leading-relaxed text-base">
                  {profile.current_focus}
                </p>
              )}
              {/* Education */}
              {profile.education && (
                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Pendidikan</p>
                  <p className="text-sm font-medium">{profile.education}</p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              {SKILL_CATEGORIES.map(({ icon: Icon, label, items }) => (
                <div key={label} className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          {profile.tech_stack && (
            <div className="pt-6 border-t border-border/40">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.tech_stack.split(',').map((tech) => (
                  <span
                    key={tech.trim()}
                    className="text-sm border border-border/60 bg-card text-muted-foreground px-3 py-1 rounded-full"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="py-20 px-4 bg-muted/20 border-y border-border/40">
          <div className="container max-w-4xl mx-auto space-y-10">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">Proyek</p>
                <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
              </div>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group block rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all overflow-hidden"
                >
                  {project.cover_image ? (
                    <div className="aspect-video overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/8 to-muted flex items-center justify-center">
                      <FolderKanban className="w-8 h-8 text-primary/20" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status || 'planning'] || 'bg-muted text-muted-foreground'}`}>
                        {STATUS_LABELS[project.status || 'planning'] || project.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary pt-1">
                      Lihat Detail <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── LATEST POSTS / FEATURED STORY ───────────────── */}
      {(featuredPost || latestPosts.length > 0) && (
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto space-y-10">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">Konten</p>
                <h2 className="text-3xl font-bold tracking-tight">Latest Posts</h2>
              </div>
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {/* Featured Story */}
              {featuredPost && (
                <Link
                  href={featuredPost.slug ? `/posts/${featuredPost.slug}` : '/explore'}
                  className="group block rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all overflow-hidden"
                >
                  {featuredPost.cover_image && (
                    <div className="aspect-[21/9] overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredPost.cover_image}
                        alt={featuredPost.title || 'Featured post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Featured Story
                      </span>
                      {featuredPost.reading_time && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {featuredPost.reading_time} min baca
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{featuredPost.excerpt}</p>
                    )}
                  </div>
                </Link>
              )}

              {/* Latest 3 posts */}
              {latestPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {latestPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={post.slug ? `/posts/${post.slug}` : '/explore'}
                      className="group block rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all p-4 space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="capitalize bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {post.post_type}
                        </span>
                        {post.published_at && (
                          <span>{format(parseISO(post.published_at), 'd MMM yyyy', { locale: localeId })}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title || post.body?.slice(0, 80) || 'Post'}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── QUICK STATS ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/20 border-y border-border/40">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '2+', label: 'Tahun Belajar Tech' },
              { value: '10+', label: 'Proyek Dibangun' },
              { value: '5+', label: 'Kompetisi Diikuti' },
              { value: '∞', label: 'Semangat Belajar' },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────────── */}
      <section id="contact" className="py-24 px-4">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Kontak</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Mari Berkolaborasi</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Saya terbuka untuk proyek, diskusi, atau sekadar berbagi ilmu. Jangan ragu untuk menghubungi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {contactLinks.map(({ href, icon: Icon, label, value }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2.5 border border-border/60 bg-card hover:bg-muted hover:border-border rounded-xl px-5 py-3 text-sm font-medium transition-all group"
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
