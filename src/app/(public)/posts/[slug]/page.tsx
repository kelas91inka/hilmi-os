import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { LikeButton } from '@/components/public/LikeButton';
import { ShareButton } from '@/components/public/ShareButton';
import { BookmarkButton } from '@/components/public/BookmarkButton';
import { CommentSection } from '@/components/public/CommentSection';
import { getApprovedComments } from '@/features/feed/actions/comment.action';

const POST_TYPE_LABELS: Record<string, string> = {
  text: 'Catatan',
  thread: 'Thread',
  image: 'Foto',
  video: 'Video',
  article: 'Artikel',
  project_update: 'Project Update',
  mixed: 'Post',
};

async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('*, post_media(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Tidak Ditemukan | Muhlim' };

  const title = post.title ?? 'Post dari Muhlim';
  const description = post.excerpt ?? post.body?.slice(0, 160) ?? '';

  return {
    title: `${title} | Muhlim`,
    description,
    openGraph: {
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
      url: `https://muhlim.my.id/posts/${slug}`,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const comments = await getApprovedComments(post.id);
  const typeLabel = POST_TYPE_LABELS[post.post_type] ?? post.post_type;
  const shareUrl = `https://muhlim.my.id/posts/${slug}`;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-20">
      {/* Back nav */}
      <Link
        href="/explore?tab=feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Explore
      </Link>

      {/* Post header */}
      <article className="space-y-6">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
            {typeLabel}
          </span>
          {post.published_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(post.published_at), 'd MMMM yyyy', { locale: localeId })}
            </span>
          )}
          {post.reading_time && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {post.reading_time} min baca
            </span>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 pb-4 border-b border-border/60">
          <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />
          <BookmarkButton postId={post.id} />
          <ShareButton url={shareUrl} title={post.title ?? 'Post dari Muhlim'} />
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden bg-muted aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.title ?? 'Cover'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body content */}
        {post.body && (
          <>
            {post.post_type === 'article' ? (
              <div
                className="prose prose-zinc dark:prose-invert max-w-none text-base leading-loose
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-code:text-sm"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {post.body}
              </div>
            )}
          </>
        )}

        {/* Additional media */}
        {post.post_media && post.post_media.length > 0 && (
          <div className={`grid gap-2 ${post.post_media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.post_media.map((media: { id: string; media_type: string; url: string; caption?: string | null }) => (
              <div key={media.id} className="space-y-1">
                {media.media_type === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.caption ?? ''}
                    className="rounded-xl w-full object-cover"
                  />
                )}
                {media.media_type === 'video' && (
                  <video src={media.url} controls className="rounded-xl w-full" />
                )}
                {media.media_type === 'embed' && (
                  <iframe
                    src={media.url}
                    className="rounded-xl w-full aspect-video"
                    allowFullScreen
                  />
                )}
                {media.caption && (
                  <p className="text-xs text-muted-foreground text-center">{media.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Divider */}
      <div className="border-t border-border/60 my-10" />

      {/* Comments */}
      <section id="comments">
        <CommentSection postId={post.id} initialComments={comments} />
      </section>
    </div>
  );
}
