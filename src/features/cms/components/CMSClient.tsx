'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PostsManager } from './PostsManager';
import { TimelineCMS } from './TimelineCMS';
import { AchievementCMS } from './AchievementCMS';
import { ProfileSettings } from './ProfileSettings';
import { CommentModeration } from './CommentModeration';
import { BookOpen, CalendarDays, Award, User, MessageSquare, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CMSClientProps {
  posts: any[];
  timeline: any[];
  achievements: any[];
  profileSettings: Record<string, string>;
  comments: any[];
}

export function CMSClient({
  posts,
  timeline,
  achievements,
  profileSettings,
  comments,
}: CMSClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('posts');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['posts', 'journey', 'achievements', 'profile', 'comments'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const tabs = [
    {
      id: 'posts',
      label: 'Posts & Galeri',
      icon: BookOpen,
      count: posts.length,
    },
    {
      id: 'journey',
      label: 'Journey (Timeline)',
      icon: CalendarDays,
      count: timeline.length,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      count: achievements.length,
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User,
    },
    {
      id: 'comments',
      label: 'Comments Moderation',
      icon: MessageSquare,
      count: comments.filter((c) => c.status === 'pending').length,
      badgeColor: 'bg-amber-500 text-amber-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-border/60 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold',
                      tab.badgeColor || 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tab Component */}
      <div className="min-h-[500px]">
        {activeTab === 'posts' && <PostsManager initialPosts={posts} />}
        {activeTab === 'journey' && <TimelineCMS initialItems={timeline} />}
        {activeTab === 'achievements' && <AchievementCMS initialItems={achievements} />}
        {activeTab === 'profile' && <ProfileSettings initialSettings={profileSettings} />}
        {activeTab === 'comments' && <CommentModeration initialComments={comments} />}
      </div>
    </div>
  );
}
