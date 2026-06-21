'use client';

import { useState } from 'react';
import { PostCard, type Post } from '@/components/public/PostCard';
import { cn } from '@/lib/utils';
import { translations, type Language } from '@/lib/i18n';

type FilterType = 'all' | 'text' | 'thread' | 'image' | 'video' | 'article' | 'project_update' | 'mixed';

interface Props {
  posts: Post[];
  lang: Language;
}

export function FeedTab({ posts, lang }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const t = translations[lang];

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: t.explore.feed.all },
    { id: 'article', label: t.explore.feed.article },
    { id: 'thread', label: t.explore.feed.thread },
    { id: 'text', label: t.explore.feed.text },
    { id: 'image', label: t.explore.feed.image },
    { id: 'video', label: t.explore.feed.video },
    { id: 'project_update', label: t.explore.feed.projectUpdate },
  ];

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.post_type === filter);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            id={`feed-filter-${id}`}
            onClick={() => setFilter(id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
              filter === id
                ? 'bg-foreground text-background border-foreground'
                : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {t.explore.feed.empty}
        </div>
      ) : (
        <div className="max-w-[680px] mx-auto space-y-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
