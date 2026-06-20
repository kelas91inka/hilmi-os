'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

function getBookmarkKey(postId: string) {
  return `mhlm_bookmark_${postId}`;
}

interface Props {
  postId: string;
}

export function BookmarkButton({ postId }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(!!localStorage.getItem(getBookmarkKey(postId)));
  }, [postId]);

  function toggle() {
    if (saved) {
      localStorage.removeItem(getBookmarkKey(postId));
      setSaved(false);
    } else {
      localStorage.setItem(getBookmarkKey(postId), '1');
      setSaved(true);
    }
  }

  return (
    <button
      id={`bookmark-btn-${postId}`}
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark post'}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        saved
          ? 'text-primary hover:bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
    </button>
  );
}
