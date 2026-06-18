import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogService } from '@/features/cms/services/blog.service';
import { BlogEditor } from '@/features/cms/components/BlogEditor';

export const metadata: Metadata = {
  title: 'Edit Blog | Hilmi OS',
};

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await blogService.getBlogById(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="flex-1 bg-muted/10">
      <BlogEditor blog={blog} />
    </div>
  );
}
