'use client';

import { useState } from 'react';
import { TaskWithTags } from '../types/task.types';
import { Project } from '@/features/projects/types/project.types';
import { Goal } from '@/features/goals/types/goal.types';
import { TaskBoard } from './TaskBoard';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskStatsBar } from './TaskStatsBar';
import { Input } from '@/components/ui/input';
import {
  Search, LayoutGrid, List as ListIcon, Filter, X,
  ChevronDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TaskViewProps {
  initialTasks: TaskWithTags[];
  projects: Project[];
  goals: Goal[];
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Semua Status',
  belum_dimulai: 'Belum Dimulai',
  sedang_dikerjakan: 'Sedang Dikerjakan',
  selesai: 'Selesai',
};

const PRIORITY_LABELS: Record<string, string> = {
  all: 'Semua Prioritas',
  kritis: '🔴 Kritis',
  tinggi: '🟠 Tinggi',
  normal: '🔵 Normal',
  rendah: '⚪ Rendah',
};

export function TaskView({ initialTasks, projects, goals }: TaskViewProps) {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectId, setProjectId] = useState<string>('all');
  const [goalId, setGoalId] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [tagQuery, setTagQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = [
    projectId !== 'all',
    goalId !== 'all',
    priority !== 'all',
    status !== 'all',
    tagQuery !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setProjectId('all');
    setGoalId('all');
    setPriority('all');
    setStatus('all');
    setTagQuery('');
  };

  const filteredTasks = initialTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectId === 'all' || task.project_id === projectId;
    const matchesGoal = goalId === 'all' || task.goal_id === goalId;
    const matchesPriority = priority === 'all' || task.priority === priority;
    const matchesStatus = status === 'all' || task.status === status;
    const matchesTag = tagQuery === '' || (task.task_tags ?? []).some(t =>
      t.tag.toLowerCase().includes(tagQuery.toLowerCase())
    );
    return matchesSearch && matchesProject && matchesGoal && matchesPriority && matchesStatus && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <TaskStatsBar tasks={initialTasks} />

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-2xl border glow-card w-full">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tugas..."
            className="pl-9 h-9 text-xs"
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
          {/* Filter Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              id="task-filter-btn"
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
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Filter Lanjutan</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset semua
                    </button>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Status</label>
                  <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Status">
                        {STATUS_LABELS[status]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="belum_dimulai">Belum Dimulai</SelectItem>
                      <SelectItem value="sedang_dikerjakan">Sedang Dikerjakan</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Prioritas</label>
                  <Select value={priority} onValueChange={(val) => setPriority(val || 'all')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Prioritas">
                        {PRIORITY_LABELS[priority]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Prioritas</SelectItem>
                      <SelectItem value="kritis">🔴 Kritis</SelectItem>
                      <SelectItem value="tinggi">🟠 Tinggi</SelectItem>
                      <SelectItem value="normal">🔵 Normal</SelectItem>
                      <SelectItem value="rendah">⚪ Rendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Proyek</label>
                  <Select value={projectId} onValueChange={(val) => setProjectId(val || 'all')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Proyek">
                        {projectId === 'all' ? 'Semua Proyek' : projects.find(p => p.id === projectId)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Proyek</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Tujuan</label>
                  <Select value={goalId} onValueChange={(val) => setGoalId(val || 'all')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Semua Tujuan">
                        {goalId === 'all' ? 'Semua Tujuan' : goals.find(g => g.id === goalId)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tujuan</SelectItem>
                      {goals.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Tag</label>
                  <div className="relative">
                    <Input
                      placeholder="Filter berdasarkan tag..."
                      className="h-8 text-xs"
                      value={tagQuery}
                      onChange={(e) => setTagQuery(e.target.value)}
                    />
                    {tagQuery && (
                      <button
                        onClick={() => setTagQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* View toggle */}
          <div className="flex bg-muted rounded-xl p-1 border">
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                view === 'board'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Board View"
              aria-label="Tampilan Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                view === 'list'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
              aria-label="Tampilan List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Task button */}
          <TaskForm projects={projects} goals={goals} />
        </div>
      </div>

      {/* Filter result summary */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{filteredTasks.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{initialTasks.length}</span> tugas
          </span>
          {(activeFilterCount > 0 || searchQuery) && (
            <button
              onClick={() => { clearFilters(); setSearchQuery(''); }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Hapus semua filter
            </button>
          )}
        </div>
      )}

      {/* Task Content */}
      {view === 'board' ? (
        <TaskBoard tasks={filteredTasks} projects={projects} goals={goals} />
      ) : (
        <TaskList tasks={filteredTasks} projects={projects} goals={goals} />
      )}
    </div>
  );
}
