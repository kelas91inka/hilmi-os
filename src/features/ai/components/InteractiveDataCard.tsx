'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, FolderKanban, Target, FileText, Coins, Trophy, BookOpen,
  ChevronDown, ExternalLink, Calendar, TrendingUp, TrendingDown,
} from 'lucide-react';

type DataType = 'tasks' | 'projects' | 'goals' | 'notes' | 'finance' | 'achievements' | 'diary';

const MODULE_ROUTES: Record<DataType, string> = {
  tasks: '/portal/tasks',
  projects: '/portal/projects',
  goals: '/portal/goals',
  notes: '/portal/notes',
  finance: '/portal/finance',
  achievements: '/portal/cms',
  diary: '/portal/diary',
};

/** Get an item-level route for modules that support detail pages */
function getItemRoute(type: DataType, item: any): string {
  const base = MODULE_ROUTES[type] || '/portal/dashboard';
  if (!item?.id) return base;
  switch (type) {
    case 'projects': return `/portal/projects/${item.id}`;
    case 'notes': return `/portal/notes/${item.id}`;
    default: return `${base}?highlight=${item.id}`;
  }
}

const TYPE_ICONS: Record<DataType, typeof Briefcase> = {
  tasks: Briefcase,
  projects: FolderKanban,
  goals: Target,
  notes: FileText,
  finance: Coins,
  achievements: Trophy,
  diary: BookOpen,
};

const TYPE_LABELS: Record<DataType, string> = {
  tasks: 'Tasks',
  projects: 'Projects',
  goals: 'Goals',
  notes: 'Notes',
  finance: 'Finance',
  achievements: 'Achievements',
  diary: 'Diary',
};

interface InteractiveDataCardProps {
  type: DataType;
  data: any[];
}

export function InteractiveDataCard({ type, data }: InteractiveDataCardProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const Icon = TYPE_ICONS[type] || FileText;
  const visibleData = showAll ? data : data.slice(0, 5);

  return (
    <div className="mt-3 border border-border/80 bg-card rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-bold text-foreground">{TYPE_LABELS[type] || type}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{data.length}</Badge>
        </div>
        <button
          onClick={() => router.push(MODULE_ROUTES[type] || '/portal/dashboard')}
          className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Lihat Semua <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/40">
        {visibleData.map((item, idx) => (
          <DataItem key={item.id || idx} type={type} item={item} onClick={() => router.push(getItemRoute(type, item))} />
        ))}
      </div>

      {/* Show more */}
      {!showAll && data.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Tampilkan {data.length - 5} lainnya
        </button>
      )}
    </div>
  );
}

function DataItem({ type, item, onClick }: { type: DataType; item: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {item.title || item.description || item.content?.substring(0, 60) || 'Tanpa judul'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.status && (
            <StatusBadge status={item.status} />
          )}
          {item.priority && type === 'tasks' && (
            <PriorityBadge priority={item.priority} />
          )}
          {item.progress != null && type === 'goals' && (
            <span className="text-[10px] text-muted-foreground font-mono-num">{item.progress}%</span>
          )}
          {item.amount != null && type === 'finance' && (
            <span className={`text-[10px] font-bold font-mono-num ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              {item.type === 'income' ? '+' : '-'}Rp {Number(item.amount).toLocaleString('id-ID')}
            </span>
          )}
          {item.mood && type === 'diary' && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{item.mood}</Badge>
          )}
          {item.category && type === 'achievements' && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{item.category}</Badge>
          )}
        </div>
      </div>
      {(item.due_date || item.target_date || item.entry_date || item.transaction_date) && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <Calendar className="w-3 h-3" />
          <span className="font-mono-num">{item.due_date || item.target_date || item.entry_date || item.transaction_date}</span>
        </div>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    selesai: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    sedang_dikerjakan: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    active: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    belum_dimulai: 'bg-muted text-muted-foreground border-border',
    ditunda: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    paused: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    planning: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };
  const colors = colorMap[status] || 'bg-muted text-muted-foreground border-border';
  return (
    <Badge variant="outline" className={`text-[10px] h-4 px-1.5 capitalize ${colors}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    kritis: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    tinggi: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    normal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    rendah: 'bg-muted text-muted-foreground border-border',
  };
  const colors = colorMap[priority] || 'bg-muted text-muted-foreground border-border';
  return (
    <Badge variant="outline" className={`text-[10px] h-4 px-1.5 capitalize ${colors}`}>
      {priority}
    </Badge>
  );
}

/**
 * Parse message text for [DATA:type]...[/DATA] markers and return
 * an array of { type: 'text' | 'data', content: string, dataType?: DataType, data?: any[] }
 */
export function parseDataMarkers(text: string): Array<{ type: 'text' | 'data'; content: string; dataType?: DataType; data?: any[] }> {
  const parts: Array<{ type: 'text' | 'data'; content: string; dataType?: DataType; data?: any[] }> = [];
  const regex = /\[DATA:(\w+)\]([\s\S]*?)\[\/DATA\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the marker
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }

    const dataType = match[1] as DataType;
    let data: any[] = [];
    try {
      data = JSON.parse(match[2]);
    } catch {
      // If JSON parse fails, treat as text
      parts.push({ type: 'text', content: match[0] });
      lastIndex = match.index + match[0].length;
      continue;
    }

    parts.push({ type: 'data', content: match[2], dataType, data });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}
