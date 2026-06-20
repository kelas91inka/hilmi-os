'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { likePost } from '@/features/feed/actions/like.action';
import { cn } from '@/lib/utils';

function getFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'mhlm_fp';
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, fp);
  }
  return fp;
}

function getLikedKey(postId: string) {
  return `mhlm_liked_${postId}`;
}

interface Props {
  postId: string;
  initialCount: number;
}

export function LikeButton({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(!!localStorage.getItem(getLikedKey(postId)));
  }, [postId]);

  async function handleLike() {
    if (loading || liked) return;
    setLoading(true);

    // Optimistic update
    setLiked(true);
    setCount((c) => c + 1);
    localStorage.setItem(getLikedKey(postId), '1');

    try {
      const fp = getFingerprint();
      const result = await likePost(postId, fp);
      if (result.status === 'already_liked') {
        // rollback
        setLiked(false);
        setCount((c) => Math.max(c - 1, 0));
        localStorage.removeItem(getLikedKey(postId));
      }
    } catch {
      // rollback on error
      setLiked(false);
      setCount((c) => Math.max(c - 1, 0));
      localStorage.removeItem(getLikedKey(postId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      id={`like-btn-${postId}`}
      onClick={handleLike}
      disabled={loading}
      aria-label="Like post"
      className={cn(
        'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-colors',
        liked
          ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950'
          : 'text-muted-foreground hover:text-rose-500 hover:bg-muted'
      )}
    >
      <Heart
        className={cn('w-3.5 h-3.5 transition-transform', liked && 'fill-current scale-110')}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
