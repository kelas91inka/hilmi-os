'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

// helper slug generator
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ─── Posts Actions ────────────────────────────────────────────────────

export async function createPostDraftAction(title: string, postType: string) {
  try {
    const supabase = await createClient();
    const baseSlug = title.trim() ? generateSlug(title) : `post-${Date.now()}`;
    let slug = baseSlug;
    
    // Check slug collision
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim() || null,
        slug,
        post_type: postType,
        published: false,
        body: '',
        excerpt: '',
        featured: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/portal/cms');
    revalidatePath('/explore');
    return { success: true, data: post };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal membuat draf post';
    console.error('[createPostDraftAction error]:', error);
    return { success: false, error: errorMessage };
  }
}

export async function updatePostAction(
  id: string,
  postData: {
    title?: string | null;
    slug?: string;
    body?: string | null;
    excerpt?: string | null;
    cover_image?: string | null;
    reading_time?: number | null;
    project_id?: string | null;
    published?: boolean;
    featured?: boolean;
  },
  mediaList: Array<{
    media_type: 'image' | 'video' | 'embed';
    url: string;
    caption?: string | null;
    sort_order?: number;
  }> = []
) {
  try {
    const supabase = await createClient();

    // Verify slug uniqueness if changed
    if (postData.slug) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', postData.slug)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Slug sudah digunakan oleh post lain.' };
      }
    }

    // Set published_at if publishing, or reset if unpublishing
    const { data: current } = await supabase
      .from('posts')
      .select('published, published_at')
      .eq('id', id)
      .single();

    const finalPostData: Database['public']['Tables']['posts']['Update'] = { ...postData };
    if (postData.published !== undefined) {
      if (postData.published && !current?.published_at) {
        finalPostData.published_at = new Date().toISOString();
      } else if (!postData.published) {
        finalPostData.published_at = null;
      }
    }

    // Update Post
    const { error: postError } = await supabase
      .from('posts')
      .update(finalPostData)
      .eq('id', id);

    if (postError) throw postError;

    // Delete old post_media
    const { error: deleteMediaError } = await supabase
      .from('post_media')
      .delete()
      .eq('post_id', id);

    if (deleteMediaError) throw deleteMediaError;

    // Insert new post_media if any
    if (mediaList.length > 0) {
      const mediaToInsert = mediaList.map((m, idx) => ({
        post_id: id,
        media_type: m.media_type,
        url: m.url,
        caption: m.caption || null,
        sort_order: m.sort_order ?? idx,
      }));

      const { error: insertMediaError } = await supabase
        .from('post_media')
        .insert(mediaToInsert);

      if (insertMediaError) throw insertMediaError;
    }

    revalidatePath('/portal/cms');
    revalidatePath('/explore');
    revalidatePath(`/posts/${postData.slug || ''}`);
    revalidatePath('/blog');
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan post';
    console.error('[updatePostAction error]:', error);
    return { success: false, error: errorMessage };
  }
}

export async function deletePostAction(id: string) {
  try {
    const supabase = await createClient();
    
    // Get slug first to revalidate path
    const { data: post } = await supabase
      .from('posts')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/portal/cms');
    revalidatePath('/explore');
    if (post?.slug) {
      revalidatePath(`/posts/${post.slug}`);
    }
    revalidatePath('/blog');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus post';
    console.error('[deletePostAction error]:', error);
    return { success: false, error: errorMessage };
  }
}

// ─── Profile Settings Actions ─────────────────────────────────────────

export async function updateProfileSettingsAction(settings: Record<string, string>) {
  try {
    const supabase = await createClient();

    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    const { error } = await supabase
      .from('profile_settings')
      .upsert(upsertData, { onConflict: 'key' });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/explore');
    revalidatePath('/portal/cms');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan pengaturan profil';
    console.error('[updateProfileSettingsAction error]:', error);
    return { success: false, error: errorMessage };
  }
}

// ─── Comment Moderation Actions ───────────────────────────────────────

export async function updateCommentStatusAction(id: string, status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient();

    // Fetch the post_id first to revalidate the post page
    const { data: comment } = await supabase
      .from('post_comments')
      .select('post_id')
      .eq('id', id)
      .single();

    let postSlug = '';
    if (comment?.post_id) {
      const { data: post } = await supabase
        .from('posts')
        .select('slug')
        .eq('id', comment.post_id)
        .single();
      if (post?.slug) {
        postSlug = post.slug;
      }
    }

    const { error } = await supabase
      .from('post_comments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/portal/cms');
    if (postSlug) {
      revalidatePath(`/posts/${postSlug}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah status komentar';
    console.error('[updateCommentStatusAction error]:', error);
    return { success: false, error: errorMessage };
  }
}

export async function deleteCommentAction(id: string) {
  try {
    const supabase = await createClient();

    // Fetch the post_id first to revalidate the post page
    const { data: comment } = await supabase
      .from('post_comments')
      .select('post_id')
      .eq('id', id)
      .single();

    let postSlug = '';
    if (comment?.post_id) {
      const { data: post } = await supabase
        .from('posts')
        .select('slug')
        .eq('id', comment.post_id)
        .single();
      if (post?.slug) {
        postSlug = post.slug;
      }
    }

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/portal/cms');
    if (postSlug) {
      revalidatePath(`/posts/${postSlug}`);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus komentar';
    console.error('[deleteCommentAction error]:', error);
    return { success: false, error: errorMessage };
  }
}
