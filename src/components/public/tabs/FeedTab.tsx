'use client';

import { useState } from 'react';
import { PostCard, type Post } from '@/components/public/PostCard';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'text' | 'thread' | 'image' | 'video' | 'article' | 'project_update' | 'mixed';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'article', label: 'Artikel' },
  { id: 'thread', label: 'Thread' },
  { id: 'text', label: 'Catatan' },
  { id: 'image', label: 'Foto' },
  { id: 'video', label: 'Video' },
  { id: 'project_update', label: 'Project Update' },
];

interface Props {
  posts: Post[];
}

export function FeedTab({ posts }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');

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
          Belum ada konten di kategori ini.
        </div>
      ) : (
        <div className="max-w-[680px] mx-auto space-y-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
