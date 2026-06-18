import { createClient } from "@/lib/supabase/server";
import { Project, ProjectWithDetails } from "../types/project.types";

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<Omit<Project, "id" | "user_id" | "created_at" | "updated_at">>;

export const projectRepository = {
  async getProjects(): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        tasks(id, status)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getPublicProjects(): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getProjectById(id: string): Promise<ProjectWithDetails | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_files (*),
        project_timeline (*),
        tasks (
          *,
          task_tags (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as ProjectWithDetails;
  },

  async createProject(projectData: Omit<ProjectInsert, "user_id">): Promise<Project> {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure user_id is set
    const dataToInsert = { ...projectData, user_id: user.id };

    const { data: project, error } = await supabase
      .from("projects")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;

    return project as Project;
  },

  async updateProject(id: string, projectData: ProjectUpdate): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Project;
  },

  async deleteProject(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  }
};
