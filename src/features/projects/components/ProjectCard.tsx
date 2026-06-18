"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, MoreVertical, Trash, Eye, Globe, Lock, Star, CheckSquare } from "lucide-react";
import { Project, PROJECT_STATUS, PROJECT_VISIBILITY, ProjectStatus, ProjectVisibility } from "../types/project.types";
import { deleteProjectAction } from "../actions/project.actions";
import { ProjectForm } from "./ProjectForm";
import { DeleteConfirmDialog } from "@/features/tasks/components/DeleteConfirmDialog";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Define an extended type locally since we added tasks(id,status) to the repo query
interface ExtendedProject extends Project {
  tasks?: { id: string; status: string }[];
}

interface ProjectCardProps {
  project: ExtendedProject;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [PROJECT_STATUS.PLANNING]: { label: 'Planning', className: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-transparent' },
  [PROJECT_STATUS.ACTIVE]: { label: 'Active', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent' },
  [PROJECT_STATUS.PAUSED]: { label: 'Paused', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-transparent' },
  [PROJECT_STATUS.COMPLETED]: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent' },
  [PROJECT_STATUS.ARCHIVED]: { label: 'Archived', className: 'bg-slate-800/15 text-slate-900 dark:text-slate-300 border-transparent' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteProjectAction(project.id);
  };

  const statusConfig = STATUS_CONFIG[project.status ?? ''] ?? STATUS_CONFIG[PROJECT_STATUS.PLANNING];

  // Calculate Progress based on tasks if available
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'selesai').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <Card className="relative flex flex-col transition-all hover:shadow-md hover:border-primary/40 group overflow-hidden">
        {project.cover_image && (
          <div className="h-24 w-full bg-muted relative border-b overflow-hidden">
            <img 
              src={project.cover_image} 
              alt="Cover" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient overlay for text legibility if we wanted to put text over it, but we put it below */}
          </div>
        )}
        
        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/portal/projects/${project.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                {project.title}
                {project.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
              </h3>
            </Link>
            <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-4">
              {project.start_date && (
                <div className="flex items-center">
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {format(new Date(project.start_date), "MMM yyyy")}
                  {project.end_date ? ` - ${format(new Date(project.end_date), "MMM yyyy")}` : " - Present"}
                </div>
              )}
              <div className="flex items-center">
                {project.visibility === PROJECT_VISIBILITY.PUBLIC ? (
                  <Globe className="mr-1.5 h-3 w-3" />
                ) : (
                  <Lock className="mr-1.5 h-3 w-3" />
                )}
                {project.visibility === PROJECT_VISIBILITY.PUBLIC ? "Public" : "Private"}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors -mr-1">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/portal/projects/${project.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeout(() => setIsEditDialogOpen(true), 100)}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onSelect={() => setTimeout(() => setIsDeleteDialogOpen(true), 100)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-between">
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-4">
            {project.description || <span className="italic opacity-60">Tidak ada deskripsi</span>}
          </p>
          
          <div className="mt-auto space-y-4">
            {totalTasks > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {completedTasks}/{totalTasks} Tugas Selesai
                  </span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              {project.status && (
                <Badge variant="secondary" className={`${statusConfig.className} text-[10px] px-2 py-0.5 font-medium`}>
                  {statusConfig.label}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectForm 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description || "",
          status: project.status as ProjectStatus,
          visibility: project.visibility as ProjectVisibility,
          start_date: project.start_date ? project.start_date.split('T')[0] : "",
          end_date: project.end_date ? project.end_date.split('T')[0] : "",
          featured: project.featured,
          cover_image: project.cover_image || "",
        }} 
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Project"
        description={`"${project.title}" beserta semua linimasa yang terkait akan dihapus secara permanen.`}
      />
    </>
  );
}
