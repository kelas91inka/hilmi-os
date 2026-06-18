import { Metadata } from 'next';
import { blogService } from '@/features/cms/services/blog.service';
import { BlogList } from '@/features/cms/components/BlogList';

export const metadata: Metadata = {
  title: 'Blog CMS | Hilmi OS',
};

export default async function BlogCMSPage() {
  const blogs = await blogService.getBlogs();

  return (
    <div className="p-4 md:p-8">
      <BlogList initialBlogs={blogs} />
    </div>
  );
}
