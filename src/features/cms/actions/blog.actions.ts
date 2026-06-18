'use server';

import { revalidatePath } from 'next/cache';
import { blogService } from '../services/blog.service';

export async function createDraftAction(title: string) {
  try {
    const blog = await blogService.createDraft(title);
    revalidatePath('/portal/cms');
    return { success: true, data: blog };
  } catch (error) {
    console.error('Error creating draft:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateBlogAction(id: string, data: unknown) {
  try {
    const blog = await blogService.updateBlog(id, data);
    revalidatePath('/portal/cms');
    revalidatePath(`/portal/cms/${id}`);
    revalidatePath('/blog');
    revalidatePath(`/blog/${blog.slug}`);
    return { success: true, data: blog };
  } catch (error) {
    console.error('Error updating blog:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    await blogService.deleteBlog(id);
    revalidatePath('/portal/cms');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
