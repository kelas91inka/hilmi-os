import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ExploreClient } from '@/components/public/ExploreClient';
import { getLanguageServer } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageServer();
  return {
    title: lang === 'en' ? 'Explore — Muhlim' : 'Jelajahi — Muhlim',
    description: lang === 'en' 
      ? 'Explore content, journey, and achievements of Muhammad Hilmi Mu\'afa.'
      : 'Jelajahi konten, perjalanan, dan pencapaian Muhammad Hilmi Mu\'afa.',
  };
}

async function getExploreData() {
  const supabase = await createClient();

  const [postsRes, timelineRes, achievementsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, post_type, title, slug, body, excerpt, cover_image, published_at, featured, reading_time, like_count, comment_count, project_id')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50),

    supabase
      .from('timeline_events')
      .select('id, title, description, event_date')
      .order('event_date', { ascending: false }),

    supabase
      .from('achievements')
      .select('id, title, description, category, achievement_date, image_url')
      .order('achievement_date', { ascending: false }),
  ]);

  return {
    posts: postsRes.data || [],
    timeline: timelineRes.data || [],
    achievements: achievementsRes.data || [],
  };
}

export default async function ExplorePage() {
  const { posts, timeline, achievements } = await getExploreData();
  const lang = await getLanguageServer();

  return (
    <div className="min-h-screen">
      <ExploreClient 
        posts={posts} 
        timeline={timeline} 
        achievements={achievements} 
        lang={lang}
      />
    </div>
  );
}
