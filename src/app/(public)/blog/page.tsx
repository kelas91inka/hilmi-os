import { Metadata } from 'next';
import Link from 'next/link';
import { blogService } from '@/features/cms/services/blog.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Blog | Hilmi OS',
  description: 'Writings on software, design, and life.',
};

export default async function BlogIndexPage() {
  const blogs = await blogService.getPublishedBlogs();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Writings on software engineering, design patterns, and building things.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-24 border rounded-2xl bg-card border-dashed">
          <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group">
              <Card className="transition-colors hover:bg-muted/50 border-0 shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(blog.published_at!).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <CardDescription className="text-base text-muted-foreground line-clamp-2">
                    {blog.excerpt || 'Read more...'}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
