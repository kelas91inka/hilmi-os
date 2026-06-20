import { Suspense } from "react";
import { Metadata } from "next";
import { projectService } from "@/features/projects/services/project.service";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { PageContextSetter } from "@/features/ai/components/PageContextSetter";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Proyek | Hilmi OS",
  description: "Kelola seluruh proyek, tugas, dan lini masa portofolio Anda",
};

export default async function ProjectsPage() {
  const projects = await projectService.getAllProjects();

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto">
      <PageContextSetter context="Manajemen Proyek" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-primary" />
            Proyek
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola seluruh proyek, tugas, dan lini masa portofolio Anda.
          </p>
        </div>
      </div>
      
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Memuat proyek...</div>}>
        <ProjectList projects={projects} />
      </Suspense>
    </div>
  );
}

