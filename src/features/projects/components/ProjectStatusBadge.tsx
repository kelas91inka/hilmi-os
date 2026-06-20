'use client';

import { PROJECT_STATUS } from "../types/project.types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [PROJECT_STATUS.PLANNING]: { label: 'Planning', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
  [PROJECT_STATUS.ACTIVE]: { label: 'Aktif', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  [PROJECT_STATUS.PAUSED]: { label: 'Ditunda', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
  [PROJECT_STATUS.COMPLETED]: { label: 'Selesai', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  [PROJECT_STATUS.ARCHIVED]: { label: 'Arsip', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
};

interface ProjectStatusBadgeProps {
  status: string;
  className?: string;
}

export function ProjectStatusBadge({ status, className = "" }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[PROJECT_STATUS.PLANNING];
  
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
