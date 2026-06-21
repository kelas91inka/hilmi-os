import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  FolderKanban,
  Globe,
} from 'lucide-react';
import { getStatusLabel, getDateLocale, translations } from '@/lib/i18n';
import { getLanguageServer } from '@/lib/i18n-server';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200',
  active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200',
  paused: 'bg-muted text-muted-foreground border-border',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200',
  archived: 'bg-muted text-muted-foreground border-border',
};

async function getPublicProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, project_timeline(*)')
    .eq('slug', slug)
    .eq('visibility', 'public')
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  const lang = await getLanguageServer();

  if (!project) {
    return { title: lang === 'en' ? 'Project Not Found | Hilmi OS' : 'Proyek Tidak Ditemukan | Hilmi OS' };
  }

  return {
    title: `${project.title} | Hilmi OS`,
    description: project.description || (lang === 'en' ? `Project details of ${project.title} by Muhammad Hilmi Mu'afa.` : `Detail proyek ${project.title} oleh Muhammad Hilmi Mu'afa.`),
    openGraph: {
      title: project.title,
      description: project.description || '',
      images: project.cover_image ? [project.cover_image] : [],
    },
  };
}

export default async function PublicProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  const lang = await getLanguageServer();
  const t = translations[lang];
  const dateLocale = getDateLocale(lang);

  if (!project) {
    notFound();
  }

  const statusLabel = getStatusLabel(project.status ?? '', lang);
  const statusColor = STATUS_COLORS[project.status ?? ''] || STATUS_COLORS.archived;

  const timeline = (project.project_timeline || []).sort(
    (a: TimelineEvent, b: TimelineEvent) =>
      new Date(a.event_date ?? 0).getTime() -
      new Date(b.event_date ?? 0).getTime()
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-24 space-y-12">
      {/* Back navigation */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t.projects.back}
      </Link>

      {/* Hero cover image */}
      {project.cover_image ? (
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[21/9] rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center border">
          <FolderKanban className="w-16 h-16 text-primary/20" />
        </div>
      )}

      {/* Title + Meta */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border ${statusColor}`}
          >
            {statusLabel}
          </span>
          <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
            <Globe className="w-3 h-3" />
            {lang === 'en' ? 'Public' : 'Publik'}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          {project.title}
        </h1>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {project.start_date && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              {format(parseISO(project.start_date), 'MMMM yyyy', { locale: dateLocale })}
              {project.end_date
                ? ` → ${format(parseISO(project.end_date), 'MMMM yyyy', { locale: dateLocale })}`
                : ` → ${t.common.now}`}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {t.common.updated}{' '}
            {format(parseISO(project.updated_at), 'dd MMM yyyy', { locale: dateLocale })}
          </span>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">{t.projects.aboutProject}</h2>
          <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
            {project.description}
          </p>
        </section>
      )}

      {/* Project Timeline */}
      {timeline.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold">{t.projects.timeline}</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6 pl-12">
              {timeline.map((event: TimelineEvent) => (
                <div key={event.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-12 w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <div className="p-5 rounded-2xl border bg-card hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      {event.event_date && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                          <CalendarIcon className="w-3 h-3" />
                          {format(parseISO(event.event_date), 'MMM yyyy', {
                            locale: dateLocale,
                          })}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {t.projects.ctaText}
        </p>
        <Link
          href="/#contact"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {t.projects.ctaButton}
        </Link>
      </div>
    </div>
  );
}
