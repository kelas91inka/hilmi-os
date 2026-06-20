'use server';

import { createClient } from '@/lib/supabase/server';

export async function likePost(
  postId: string,
  fingerprint: string
): Promise<{ status: 'liked' | 'already_liked' | 'error' }> {
  if (!postId || !fingerprint) return { status: 'error' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, fingerprint });

  if (error) {
    // Unique constraint violation = already liked
    if (error.code === '23505') {
      return { status: 'already_liked' };
    }
    return { status: 'error' };
  }

  return { status: 'liked' };
}
