import { Suspense } from "react";
import { Metadata } from "next";
import { taskService } from "@/features/tasks/services/task.service";
import { projectRepository } from "@/features/projects/repositories/project.repository";
import { goalRepository } from "@/features/goals/repositories/goal.repository";
import { TaskView } from "@/features/tasks/components/TaskView";
import { PageContextSetter } from "@/features/ai/components/PageContextSetter";
import { CheckSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Tugas | Hilmi OS",
  description: "Kelola tugas harian dan jadwalkan aktivitas Anda",
};

export default async function TasksPage() {
  const [tasks, projects, goals] = await Promise.all([
    taskService.getAllTasks(),
    projectRepository.getProjects(),
    goalRepository.getGoals()
  ]);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <PageContextSetter context="Manajemen Tugas" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            Tugas
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola tugas harian dan jadwalkan aktivitas Anda.
          </p>
        </div>
      </div>
      
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Memuat tugas...</div>}>
        <TaskView initialTasks={tasks} projects={projects} goals={goals} />
      </Suspense>
    </div>
  );
}
