import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CMSClient } from '@/features/cms/components/CMSClient';
import { PageContextSetter } from '@/features/ai/components/PageContextSetter';
import { Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Unified CMS | Hilmi OS',
};

async function getCMSData() {
  const supabase = await createClient();

  const [postsRes, timelineRes, achievementsRes, profileRes, commentsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('timeline_events')
      .select('*')
      .order('event_date', { ascending: false }),

    supabase
      .from('achievements')
      .select('*')
      .order('achievement_date', { ascending: false }),

    supabase
      .from('profile_settings')
      .select('*'),

    supabase
      .from('post_comments')
      .select('*, posts(title, slug)')
      .order('created_at', { ascending: false }),
  ]);

  // Convert profile settings list into a key-value record
  const profileSettings: Record<string, string> = {};
  if (profileRes.data) {
    profileRes.data.forEach((row) => {
      profileSettings[row.key] = row.value || '';
    });
  }

  return {
    posts: postsRes.data || [],
    timeline: timelineRes.data || [],
    achievements: achievementsRes.data || [],
    profileSettings,
    comments: commentsRes.data || [],
  };
}

export default async function CMSHubPage() {
  const { posts, timeline, achievements, profileSettings, comments } = await getCMSData();

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto py-2 md:py-4">
      <PageContextSetter context="Manajemen CMS Hub" />
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/65 backdrop-blur-xs p-6 rounded-2xl border glow-card">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-primary animate-spin-slow" />
            Content Management Hub
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kelola postingan, galeri, timeline perjalanan, pencapaian, komentar, dan info profil publik Anda.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <CMSClient
        posts={posts}
        timeline={timeline}
        achievements={achievements}
        profileSettings={profileSettings}
        comments={comments}
      />
    </div>
  );
}
