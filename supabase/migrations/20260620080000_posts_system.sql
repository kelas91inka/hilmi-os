-- ============================================================
-- POSTS SYSTEM MIGRATION
-- Muhlim Public Platform — Content Engine
-- ============================================================

-- 1. POSTS TABLE (Central content store)
CREATE TABLE public.posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content type
  post_type     TEXT NOT NULL DEFAULT 'text',
  -- Allowed: 'text' | 'thread' | 'image' | 'video' | 'article' | 'project_update' | 'mixed'

  -- Core content
  title         TEXT,
  slug          TEXT UNIQUE,
  body          TEXT,
  excerpt       TEXT,
  cover_image   TEXT,

  -- Article-specific
  reading_time  INTEGER,  -- estimated minutes

  -- Project relationship
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- Visibility
  published     BOOLEAN DEFAULT false,
  published_at  TIMESTAMP WITH TIME ZONE,
  featured      BOOLEAN DEFAULT false,

  -- Denormalized interaction counters (for performance)
  like_count    INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_posts_published ON public.posts(published, published_at DESC);
CREATE INDEX idx_posts_post_type ON public.posts(post_type);
CREATE INDEX idx_posts_featured ON public.posts(featured, published);
CREATE INDEX idx_posts_slug ON public.posts(slug);

-- 2. POST MEDIA TABLE (Multi-media attachments per post)
CREATE TABLE public.post_media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_type  TEXT NOT NULL,  -- 'image' | 'video' | 'embed'
  url         TEXT NOT NULL,
  caption     TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_post_media_post_id ON public.post_media(post_id, sort_order);

-- 3. POST LIKES TABLE (Anonymous, rate-limited by fingerprint)
CREATE TABLE public.post_likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,  -- Hash of IP + User-Agent (anonymous identifier)
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, fingerprint)
);

CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);

-- 4. POST COMMENTS TABLE (Anonymous-friendly, moderated)
CREATE TABLE public.post_comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id      UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',  -- Optional name input, defaults to Anonymous
  body         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',    -- 'pending' | 'approved' | 'rejected'
  fingerprint  TEXT,                               -- For spam detection
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id, status);

-- 5. PROFILE SETTINGS TABLE (CMS-driven About content)
CREATE TABLE public.profile_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,  -- e.g. 'bio', 'tagline', 'education', 'skills', 'tech_stack', 'email', 'github', 'linkedin', 'whatsapp'
  value      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON public.profile_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed default profile settings
INSERT INTO public.profile_settings (key, value) VALUES
  ('bio', 'Network engineer dan web developer yang percaya bahwa teknologi harus membuat hidup lebih mudah. Membangun sistem yang elegan, cepat, dan bermakna.'),
  ('tagline', 'Student · Builder · System Administrator'),
  ('education', 'SMK Telkom Sidoarjo — Teknik Komputer dan Jaringan'),
  ('skills', 'Cisco Networking, MikroTik, Linux Administration, Next.js, TypeScript, React, Supabase, PostgreSQL, TailwindCSS'),
  ('tech_stack', 'Next.js, TypeScript, Supabase, TailwindCSS, Cloudinary, Vercel'),
  ('email', 'hilmi@muhlim.my.id'),
  ('github', 'https://github.com/hilmimuafa'),
  ('linkedin', 'https://linkedin.com/in/hilmimuafa'),
  ('whatsapp', ''),
  ('current_focus', 'Membangun Hilmi OS — personal operating system berbasis web. Mendalami Next.js 15, network engineering, dan DevOps.'),
  ('personal_statement', 'Building systems that solve real problems. Exploring technology, education, and innovation.');

-- ============================================================
-- TRIGGERS: Sync like_count and comment_count on posts
-- ============================================================

-- Sync like_count when a like is inserted or deleted
CREATE OR REPLACE FUNCTION sync_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_post_like_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION sync_post_like_count();

-- Sync comment_count when a comment is approved/unapproved
CREATE OR REPLACE FUNCTION sync_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_post_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION sync_post_comment_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- posts: anyone can read published posts, authenticated can do all
CREATE POLICY "Public read published posts" ON public.posts
  FOR SELECT USING (published = true);
CREATE POLICY "Authenticated full access posts" ON public.posts
  FOR ALL USING (auth.role() = 'authenticated');

-- post_media: public read, authenticated write
CREATE POLICY "Public read post_media" ON public.post_media
  FOR SELECT USING (true);
CREATE POLICY "Authenticated full access post_media" ON public.post_media
  FOR ALL USING (auth.role() = 'authenticated');

-- post_likes: anyone can insert (unique constraint handles duplicates), public read
CREATE POLICY "Public read post_likes" ON public.post_likes
  FOR SELECT USING (true);
CREATE POLICY "Public insert post_likes" ON public.post_likes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated full access post_likes" ON public.post_likes
  FOR ALL USING (auth.role() = 'authenticated');

-- post_comments: anyone can read approved, anyone can insert (pending), authenticated can manage all
CREATE POLICY "Public read approved comments" ON public.post_comments
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Public insert comments" ON public.post_comments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated full access post_comments" ON public.post_comments
  FOR ALL USING (auth.role() = 'authenticated');

-- profile_settings: public read all, authenticated write
CREATE POLICY "Public read profile_settings" ON public.profile_settings
  FOR SELECT USING (true);
CREATE POLICY "Authenticated full access profile_settings" ON public.profile_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- DATA MIGRATION: blogs → posts (article type)
-- ============================================================

INSERT INTO public.posts (
  id, post_type, title, slug, body, excerpt, cover_image,
  published, published_at, created_at, updated_at
)
SELECT
  id,
  'article',
  title,
  slug,
  content,
  excerpt,
  cover_image,
  published,
  published_at,
  created_at,
  updated_at
FROM public.blogs
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DATA MIGRATION: gallery → posts (image type)
-- ============================================================

INSERT INTO public.posts (
  id, post_type, title, slug, body, cover_image,
  published, published_at, created_at, updated_at
)
SELECT
  id,
  'image',
  title,
  'gallery-' || LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTR(id::text, 1, 8),
  description,
  image_url,
  true,
  created_at,
  created_at,
  updated_at
FROM public.gallery
ON CONFLICT (id) DO NOTHING;
