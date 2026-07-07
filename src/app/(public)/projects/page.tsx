import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ExternalLink, FolderKanban } from 'lucide-react';
import { getStatusLabel, translations, type Language } from '@/lib/i18n';
import { getLanguageServer } from '@/lib/i18n-server';

interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  cover_image?: string | null;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.muhlim.my.id';
  const title = lang === 'en' ? 'Projects | Hilmi OS' : 'Proyek | Hilmi OS';
  const description = lang === 'en'
    ? 'Collection of projects built and currently being built by Muhammad Hilmi Mu\'afa.'
    : 'Koleksi proyek yang sedang dan pernah dibangun oleh Muhammad Hilmi Mu\'afa.';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/projects`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/projects`,
      type: 'website',
    },
  };
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  active: 'bg-green-500/10 text-green-700 dark:text-green-400',
  paused: 'bg-muted text-muted-foreground',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  archived: 'bg-muted text-muted-foreground',
};

async function getProjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('id, title, slug, description, status, cover_image, start_date, end_date, featured')
    .eq('visibility', 'public')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const lang = await getLanguageServer();
  const t = translations[lang];

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24 space-y-16">
      {/* Header */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">{t.projects.title}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{t.projects.subtitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {t.projects.description}
        </p>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold">{t.projects.active}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold">{t.projects.other}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} compact />
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && (
        <div className="text-center py-24">
          <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.projects.empty}</p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, lang, compact = false }: { project: Project; lang: Language; compact?: boolean }) {
  const statusColor = STATUS_COLORS[project.status ?? ''] || 'bg-muted text-muted-foreground';
  const statusLabel = getStatusLabel(project.status ?? '', lang);
  const t = translations[lang];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border bg-card hover:shadow-md transition-all overflow-hidden"
    >
      {!compact && project.cover_image ? (
        <div className="aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : !compact && (
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
          <FolderKanban className="w-12 h-12 text-primary/20" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-primary">
          {t.projects.detail} <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}
