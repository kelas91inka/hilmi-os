'use client';

import { useState } from 'react';
import { Project, PROJECT_STATUS, PROJECT_VISIBILITY } from '../types/project.types';
import { ProjectCard } from './ProjectCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FolderPlus, X } from 'lucide-react';
import { ProjectForm } from './ProjectForm';

interface ExtendedProject extends Project {
  tasks?: { id: string; status: string }[];
}

interface ProjectListProps {
  projects: ExtendedProject[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [visibility, setVisibility] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (project.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === 'all' || project.status === status;
    const matchesVisibility = visibility === 'all' || project.visibility === visibility;
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari proyek..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex w-full sm:w-auto gap-3 justify-between sm:justify-end">
            <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value={PROJECT_STATUS.PLANNING}>Planning</SelectItem>
                <SelectItem value={PROJECT_STATUS.ACTIVE}>Active</SelectItem>
                <SelectItem value={PROJECT_STATUS.PAUSED}>Paused</SelectItem>
                <SelectItem value={PROJECT_STATUS.COMPLETED}>Completed</SelectItem>
                <SelectItem value={PROJECT_STATUS.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibility} onValueChange={(val) => setVisibility(val || 'all')}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Visibilitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Visibilitas</SelectItem>
                <SelectItem value={PROJECT_VISIBILITY.PUBLIC}>Public</SelectItem>
                <SelectItem value={PROJECT_VISIBILITY.PRIVATE}>Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
          {projects.length === 0 ? (
            <>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Belum ada proyek</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
                Mulai tambahkan proyek pertama Anda untuk melacak portofolio, tugas, dan linimasa.
              </p>
              <ProjectForm />
            </>
          ) : (
            <p className="text-muted-foreground">Tidak ada proyek yang sesuai dengan filter pencarian.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
