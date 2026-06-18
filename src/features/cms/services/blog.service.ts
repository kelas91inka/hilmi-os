import { blogRepository } from '../repositories/blog.repository';
import { blogSchema } from '../validators/cms.schema';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const blogService = {
  getBlogs: () => blogRepository.getBlogs(),
  getPublishedBlogs: () => blogRepository.getPublishedBlogs(),
  getBlogById: (id: string) => blogRepository.getBlogById(id),
  getBlogBySlug: (slug: string) => blogRepository.getBlogBySlug(slug),

  async createDraft(title: string) {
    let slug = generateSlug(title);
    
    // Check if slug exists
    let existing = await blogRepository.getBlogBySlug(slug);
    let counter = 1;
    while (existing) {
      slug = `${generateSlug(title)}-${counter}`;
      existing = await blogRepository.getBlogBySlug(slug);
      counter++;
    }

    const data = {
      title,
      slug,
      published: false,
      excerpt: '',
      content: '',
      cover_image: null
    };
    
    return blogRepository.createBlog(data);
  },

  async updateBlog(id: string, data: unknown) {
    const validated = blogSchema.partial().parse(data);
    
    const current = await blogRepository.getBlogById(id);
    if (!current) throw new Error("Blog not found");

    const updateData: Partial<typeof validated> & { published_at?: string | null } = { ...validated };
    
    if (validated.published === true && !current.published_at) {
      updateData.published_at = new Date().toISOString();
    } else if (validated.published === false) {
      updateData.published_at = null;
    }

    return blogRepository.updateBlog(id, updateData);
  },

  deleteBlog: (id: string) => blogRepository.deleteBlog(id)
};
