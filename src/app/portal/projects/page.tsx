import { Suspense } from "react";
import { Metadata } from "next";
import { projectService } from "@/features/projects/services/project.service";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Proyek | Hilmi OS",
  description: "Kelola seluruh proyek, tugas, dan lini masa portofolio Anda",
};

export default async function ProjectsPage() {
  const projects = await projectService.getAllProjects();

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary" />
            Proyek
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola seluruh proyek, tugas, dan lini masa portofolio Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ProjectForm />
        </div>
      </div>
      
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Memuat proyek...</div>}>
        <ProjectList projects={projects} />
      </Suspense>
    </div>
  );
}
