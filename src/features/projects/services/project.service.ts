import { projectRepository, ProjectUpdate } from "../repositories/project.repository";
import { ProjectFormValues, ProjectTimelineFormValues } from "../validators/project.schema";

export const projectService = {
  async getAllProjects() {
    return projectRepository.getProjects();
  },

  async getProjectDetails(id: string) {
    return projectRepository.getProjectById(id);
  },

  async createProject(data: ProjectFormValues) {
    // Auto-generate slug if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    return projectRepository.createProject({
      title: data.title,
      slug,
      description: data.description || null,
      status: data.status,
      visibility: data.visibility,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      cover_image: data.cover_image || null,
      featured: data.featured,
    });
  },

  async updateProject(id: string, data: Partial<ProjectFormValues>) {
    const updateData: ProjectUpdate = {};

    if (data.title !== undefined) updateData.title = data.title;
    
    if (data.slug !== undefined) {
      updateData.slug = data.slug || undefined;
    }
    
    // Update slug if title changes and no explicit slug is given
    if (data.title !== undefined && !data.slug) {
      updateData.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    if (data.status !== undefined) updateData.status = data.status;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;

    if (data.start_date !== undefined) {
      updateData.start_date = data.start_date || null;
    }

    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date || null;
    }

    if (data.cover_image !== undefined) {
      updateData.cover_image = data.cover_image || null;
    }

    if (data.featured !== undefined) updateData.featured = data.featured;
    
    return projectRepository.updateProject(id, updateData);
  },

  async deleteProject(id: string) {
    return projectRepository.deleteProject(id);
  },

  async createProjectTimelineEvent(projectId: string, data: ProjectTimelineFormValues) {
    return projectRepository.createProjectTimelineEvent(projectId, {
      title: data.title,
      description: data.description || null,
      event_date: data.event_date || null,
    });
  },

  async deleteProjectTimelineEvent(id: string) {
    return projectRepository.deleteProjectTimelineEvent(id);
  }
};
