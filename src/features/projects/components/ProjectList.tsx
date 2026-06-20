'use client';

import { useState } from 'react';
import { Project, PROJECT_STATUS, PROJECT_VISIBILITY } from '../types/project.types';
import { ProjectCard } from './ProjectCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FolderPlus, X, Filter, ChevronDown } from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { EmptyState } from '@/components/shared/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ExtendedProject extends Project {
  tasks?: { id: string; status: string }[];
}

interface ProjectListProps {
  projects: ExtendedProject[];
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Semua Status',
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

const VISIBILITY_LABELS: Record<string, string> = {
  all: 'Semua Visibilitas',
  public: 'Public',
  private: 'Private',
};

export function ProjectList({ projects }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [visibility, setVisibility] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (project.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === 'all' || project.status === status;
    const matchesVisibility = visibility === 'all' || project.visibility === visibility;
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const activeFilterCount = [
    status !== 'all',
    visibility !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatus('all');
    setVisibility('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-2xl border glow-card justify-between items-start sm:items-center">
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
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              className={`flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl border transition-colors ${
                activeFilterCount > 0
                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Filter Lanjutan</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Reset semua
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Status Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                    <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Status">
                          {STATUS_LABELS[status]}
                        </SelectValue>
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
                  </div>

                  {/* Visibility Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visibilitas</label>
                    <Select value={visibility} onValueChange={(val) => setVisibility(val || 'all')}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Visibilitas">
                          {VISIBILITY_LABELS[visibility]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Visibilitas</SelectItem>
                        <SelectItem value={PROJECT_VISIBILITY.PUBLIC}>Public</SelectItem>
                        <SelectItem value={PROJECT_VISIBILITY.PRIVATE}>Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ProjectForm />
        </div>
      </div>

      {/* Filter result summary */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{filteredProjects.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{projects.length}</span> proyek
          </span>
          <button
            onClick={() => { clearFilters(); setSearchQuery(''); }}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Hapus semua filter
          </button>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderPlus className="w-6 h-6" />}
          title={projects.length === 0 ? "Belum ada proyek" : "Tidak ada proyek"}
          description={
            projects.length === 0
              ? "Mulai tambahkan proyek pertama Anda untuk melacak portofolio, tugas, dan linimasa."
              : "Tidak ada proyek yang sesuai dengan filter pencarian."
          }
          action={projects.length === 0 ? <ProjectForm /> : undefined}
        />
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

