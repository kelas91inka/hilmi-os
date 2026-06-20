'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const BANNED_WORDS = ['spam', 'scam', 'judi', 'bokep', 'xxx'];

function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

export async function submitComment(
  postId: string,
  body: string,
  displayName: string,
  fingerprint: string
): Promise<{ status: 'success' | 'error' | 'banned'; message?: string }> {
  if (!postId || !body?.trim()) {
    return { status: 'error', message: 'Komentar tidak boleh kosong.' };
  }

  const trimmedBody = body.trim();
  if (trimmedBody.length < 2) {
    return { status: 'error', message: 'Komentar terlalu pendek.' };
  }
  if (trimmedBody.length > 1000) {
    return { status: 'error', message: 'Komentar terlalu panjang (max 1000 karakter).' };
  }

  if (containsBannedWords(trimmedBody)) {
    return { status: 'banned', message: 'Komentar mengandung kata yang tidak diperbolehkan.' };
  }

  const trimmedName = displayName?.trim() || 'Anonymous';

  const supabase = await createClient();

  // Basic rate limit: max 5 comments per fingerprint per hour
  if (fingerprint) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('fingerprint', fingerprint)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= 5) {
      return { status: 'error', message: 'Terlalu banyak komentar. Coba lagi nanti.' };
    }
  }

  const { error } = await supabase.from('post_comments').insert({
    post_id: postId,
    display_name: trimmedName,
    body: trimmedBody,
    status: 'pending',
    fingerprint: fingerprint || null,
  });

  if (error) {
    return { status: 'error', message: 'Gagal mengirim komentar. Coba lagi.' };
  }

  revalidatePath(`/posts/[slug]`, 'page');
  return { status: 'success' };
}

export async function getApprovedComments(postId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('post_comments')
    .select('id, display_name, body, created_at')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });
  return data || [];
}
