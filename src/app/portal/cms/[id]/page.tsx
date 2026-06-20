import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostEditor } from '@/features/cms/components/PostEditor';

export const metadata: Metadata = {
  title: 'Edit Post | Hilmi OS',
};

async function getPostData(id: string) {
  const supabase = await createClient();

  const [postRes, projectsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('*, post_media(*)')
      .eq('id', id)
      .single(),

    supabase
      .from('projects')
      .select('id, title')
      .order('title', { ascending: true }),
  ]);

  if (postRes.error) {
    console.error('Error fetching post:', postRes.error);
    return { post: null, projects: [] };
  }

  return {
    post: postRes.data,
    projects: projectsRes.data || [],
  };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { post, projects } = await getPostData(id);

  if (!post) {
    notFound();
  }

  const typedPost = {
    ...post,
    post_media: (post.post_media || []).map((m) => ({
      ...m,
      media_type: m.media_type as 'image' | 'video' | 'embed',
      sort_order: m.sort_order ?? 0,
    })),
  };

  return (
    <div className="flex-1 bg-muted/10 min-h-screen">
      <PostEditor post={typedPost} projects={projects} />
    </div>
  );
}
