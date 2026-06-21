'use client';

import { useCallback, useEffect, useState, ElementType } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FeedTab } from '@/components/public/tabs/FeedTab';
import { JourneyTab } from '@/components/public/tabs/JourneyTab';
import { AchievementsTab } from '@/components/public/tabs/AchievementsTab';
import { cn } from '@/lib/utils';
import { Rss, MapPin, Trophy } from 'lucide-react';
import { translations, type Language } from '@/lib/i18n';

type Tab = 'feed' | 'journey' | 'achievements';

interface Post {
  id: string;
  post_type: string;
  title?: string | null;
  slug?: string | null;
  body?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  featured?: boolean | null;
  reading_time?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
  project_id?: string | null;
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  achievement_date?: string | null;
  image_url?: string | null;
}

interface Props {
  posts: Post[];
  timeline: TimelineEvent[];
  achievements: Achievement[];
  lang: Language;
}

export function ExploreClient({ posts, timeline, achievements, lang }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const t = translations[lang];

  const TABS: { id: Tab; label: string; icon: ElementType }[] = [
    { id: 'feed', label: t.explore.tabs.feed, icon: Rss },
    { id: 'journey', label: t.explore.tabs.journey, icon: MapPin },
    { id: 'achievements', label: t.explore.tabs.achievements, icon: Trophy },
  ];

  const rawTab = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    rawTab && TABS.some((t) => t.id === rawTab) ? rawTab : 'feed'
  );

  const switchTab = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Sync from URL if user navigates back/forward
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null;
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t.explore.title}</h1>
        <p className="text-muted-foreground text-sm">
          {t.explore.subtitle}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-border/60 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`explore-tab-${id}`}
            onClick={() => switchTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative',
              activeTab === id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'feed' && <FeedTab posts={posts} lang={lang} />}
        {activeTab === 'journey' && <JourneyTab events={timeline} lang={lang} />}
        {activeTab === 'achievements' && <AchievementsTab achievements={achievements} lang={lang} />}
      </div>
    </div>
  );
}
