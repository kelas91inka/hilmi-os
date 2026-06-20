'use client';

import Link from 'next/link';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BookOpen, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { LikeButton } from '@/components/public/LikeButton';
import { BookmarkButton } from '@/components/public/BookmarkButton';
import { ShareButton } from '@/components/public/ShareButton';
import { cn } from '@/lib/utils';

export interface Post {
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

const POST_TYPE_LABELS: Record<string, string> = {
  text: 'Catatan',
  thread: 'Thread',
  image: 'Foto',
  video: 'Video',
  article: 'Artikel',
  project_update: 'Project Update',
  mixed: 'Post',
};

const POST_TYPE_COLORS: Record<string, string> = {
  text: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  thread: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  image: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  video: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  article: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  project_update: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  mixed: 'bg-muted text-muted-foreground',
};

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  const href = post.slug ? `/posts/${post.slug}` : null;
  const typeLabel = POST_TYPE_LABELS[post.post_type] ?? post.post_type;
  const typeColor = POST_TYPE_COLORS[post.post_type] ?? POST_TYPE_COLORS.mixed;
  const title = post.title ?? null;
  const preview = post.excerpt ?? (post.body ? post.body.slice(0, 200) : null);

  const timeAgo = post.published_at
    ? formatDistanceToNow(parseISO(post.published_at), { addSuffix: true, locale: localeId })
    : null;
  const fullDate = post.published_at
    ? format(parseISO(post.published_at), 'd MMMM yyyy', { locale: localeId })
    : null;

  return (
    <article className="rounded-2xl border border-border/60 bg-card hover:border-border transition-colors overflow-hidden">
      {/* Cover image (for image, article, project_update with cover) */}
      {post.cover_image && (post.post_type === 'image' || post.post_type === 'article' || post.cover_image) && (
        <div className={cn('overflow-hidden bg-muted', post.post_type === 'image' ? 'aspect-[4/3]' : 'aspect-[16/9]')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={title ?? 'Post image'}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', typeColor)}>
            {typeLabel}
          </span>
          {post.featured && (
            <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {timeAgo && (
            <span className="text-xs text-muted-foreground" title={fullDate ?? undefined}>
              {timeAgo}
            </span>
          )}
          {post.reading_time && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <BookOpen className="w-3 h-3" />
              {post.reading_time} min
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          {title && (
            href ? (
              <Link href={href} className="block group">
                <h2 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {title}
                </h2>
              </Link>
            ) : (
              <h2 className="font-semibold text-base leading-snug line-clamp-2">{title}</h2>
            )
          )}
          {preview && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {preview}
              {(post.body?.length ?? 0) > 200 && post.body === preview && '…'}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1">
            <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />

            {href && (
              <Link
                href={`${href}#comments`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {post.comment_count ?? 0}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            <BookmarkButton postId={post.id} />
            {href && (
              <ShareButton
                url={`https://muhlim.my.id/posts/${post.slug}`}
                title={title ?? 'Post dari Muhlim'}
              />
            )}
            {href && (
              <Link
                href={href}
                className="text-xs text-primary font-medium hover:underline px-2 py-1.5 ml-1"
              >
                Baca →
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
