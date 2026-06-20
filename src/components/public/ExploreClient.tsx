'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FeedTab } from '@/components/public/tabs/FeedTab';
import { JourneyTab } from '@/components/public/tabs/JourneyTab';
import { AchievementsTab } from '@/components/public/tabs/AchievementsTab';
import { cn } from '@/lib/utils';
import { Rss, MapPin, Trophy } from 'lucide-react';

type Tab = 'feed' | 'journey' | 'achievements';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'journey', label: 'Journey', icon: MapPin },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

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
}

export function ExploreClient({ posts, timeline, achievements }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground text-sm">
          Konten, perjalanan, dan pencapaian yang membentuk saya.
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
        {activeTab === 'feed' && <FeedTab posts={posts} />}
        {activeTab === 'journey' && <JourneyTab events={timeline} />}
        {activeTab === 'achievements' && <AchievementsTab achievements={achievements} />}
      </div>
    </div>
  );
}
