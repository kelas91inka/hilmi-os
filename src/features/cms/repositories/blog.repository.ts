import { createClient } from '@/lib/supabase/server';
import { type Database } from '@/lib/supabase/database.types';
import { Blog } from '../types/cms.types';
import { BlogFormData } from '../validators/cms.schema';

export const blogRepository = {
  async getBlogs(): Promise<Blog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Blog[];
  },

  async getPublishedBlogs(): Promise<Blog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data as Blog[];
  },

  async getBlogById(id: string): Promise<Blog | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Blog;
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Blog;
  },

  async createBlog(data: Database['public']['Tables']['blogs']['Insert']): Promise<Blog> {
    const supabase = await createClient();
    
    // In CMS domain, owner creates blogs. 
    // Usually no user_id in blogs table if it's single owner and no auth tie needed, 
    // but let's check schema_init.sql:
    // CREATE TABLE public.blogs ( id UUID, title TEXT, slug TEXT, excerpt TEXT, content TEXT, cover_image TEXT, published BOOLEAN, published_at TIMESTAMP, ... )
    // No user_id column in blogs!

    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newBlog as Blog;
  },

  async updateBlog(id: string, data: Partial<BlogFormData> & { published_at?: string | null }): Promise<Blog> {
    const supabase = await createClient();
    
    const { data: updated, error } = await supabase
      .from('blogs')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated as Blog;
  },

  async deleteBlog(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
