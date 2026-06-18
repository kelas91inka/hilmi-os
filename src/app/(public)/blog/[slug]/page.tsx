import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogService } from '@/features/cms/services/blog.service';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await blogService.getBlogBySlug(slug);
  if (!blog || !blog.published) return { title: 'Not Found' };

  return {
    title: `${blog.title} | Hilmi OS`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await blogService.getBlogBySlug(slug);

  if (!blog || !blog.published) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <Link href="/blog">
        <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          {blog.title}
        </h1>
        <div className="text-muted-foreground">
          {new Date(blog.published_at!).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </header>

      {blog.cover_image && (
        <div className="mb-12 rounded-2xl overflow-hidden bg-muted aspect-video relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={blog.cover_image} 
            alt={blog.title} 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div 
        className="prose prose-zinc dark:prose-invert max-w-none text-lg leading-loose
          prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
      />
    </article>
  );
}
