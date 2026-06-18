import { TaskWithTags } from "../../tasks/types/task.types";

export const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

export const PROJECT_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type ProjectVisibility = typeof PROJECT_VISIBILITY[keyof typeof PROJECT_VISIBILITY];

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTimelineEvent {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types for relations
export interface ProjectWithDetails extends Project {
  project_files?: ProjectFile[];
  project_timeline?: ProjectTimelineEvent[];
  tasks?: TaskWithTags[];
}
