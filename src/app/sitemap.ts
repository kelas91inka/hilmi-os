import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.muhlim.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('published', true);

  // Fetch public projects
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('visibility', 'public');

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const projectUrls = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updated_at || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const staticUrls = [
    '',
    '/about',
    '/explore',
    '/projects',
    '/blog',
    '/gallery',
    '/now',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticUrls, ...projectUrls, ...postUrls];
}
