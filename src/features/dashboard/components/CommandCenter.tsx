'use client';

import { useState } from 'react';
import { DashboardData } from '../repositories/dashboard.repository';
import { AIBriefingCard } from './AIBriefingCard';
import { HabitCheckInWidget } from './HabitCheckInWidget';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { QuickCaptureModal } from './QuickCaptureModal';
import { format, parseISO, isToday } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import {
  CheckSquare, FolderKanban, Target, Zap,
  BookOpen, BookHeart, ArrowRight, Clock,
  AlertCircle, CheckCircle2, Circle, Activity,
  TrendingUp, Sparkles, Plus, TrendingDown,
  BarChart3, Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandCenterProps {
  data: DashboardData;
}

const PRIORITY_COLORS: Record<string, string> = {
  kritis: 'text-red-500',
  tinggi: 'text-orange-500',
  normal: 'text-blue-500',
  rendah: 'text-muted-foreground',
  urgent: 'text-red-500',
  high: 'text-orange-500',
};

const PRIORITY_BG: Record<string, string> = {
  kritis: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  tinggi: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  normal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  rendah: 'bg-muted text-muted-foreground border-border',
};

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', neutral: '😐', sad: '😔',
  productive: '⚡', stressed: '😰', tired: '😴', sick: '🤒',
};

const GOAL_TYPE_LABEL: Record<string, string> = {
  mingguan: 'Mingguan', bulanan: 'Bulanan', tahunan: 'Tahunan', lifetime: 'Lifetime',
};

const ACTIVITY_TYPE_COLOR: Record<string, string> = {
  task: 'bg-blue-500',
  note: 'bg-violet-500',
  goal: 'bg-emerald-500',
};

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  task: 'Tugas',
  note: 'Catatan',
  goal: 'Tujuan',
};

const STATUS_LABEL: Record<string, string> = {
  belum_dimulai: 'Belum dimulai',
  sedang_dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
  active: 'Aktif',
};

/* ── Greeting Header ───────────────────────────────── */
function GreetingHeader({ profile, today, onCapture }: {
  profile: DashboardData['profile'];
  today: string;
  onCapture: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Selamat Malam' : hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const name = profile?.full_name?.split(' ')[0] || 'Hilmi';
  const dateLabel = format(parseISO(today), 'EEEE, d MMMM yyyy', { locale: id });

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-mono-num">{dateLabel}</p>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {greeting},{' '}
          <span className="text-gradient-primary">{name}</span> 👋
        </h1>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onCapture}
          id="quick-capture-btn"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Catat Cepat</span>
          <span className="sm:hidden">+</span>
        </button>
        <Link
          href={`/portal/diary/${format(new Date(), 'yyyy-MM-dd')}`}
          className="hidden sm:flex text-xs border border-border rounded-xl px-4 py-2.5 hover:bg-muted/50 hover:border-primary/30 transition-all items-center gap-1.5 font-medium"
        >
          <BookHeart className="w-4 h-4" />
          Jurnal
        </Link>
      </div>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, href, color = 'text-primary', bgColor = 'bg-primary/10', sublabel }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  href?: string;
  color?: string;
  bgColor?: string;
  sublabel?: string;
}) {
  const content = (
    <div className={cn(
      'glow-card rounded-2xl border border-border bg-card p-4 transition-all duration-200',
      href && 'hover:border-primary/30 hover:shadow-lg group cursor-pointer'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgColor, color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-mono-num text-2xl font-bold tracking-tight leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{label}</div>
          {sublabel && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

/* ── Section Header ────────────────────────────────── */
function SectionHeader({ title, href, icon: Icon, count }: {
  title: string; href?: string; icon?: React.ElementType; count?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
        {count !== undefined && (
          <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[9px] font-mono-num">
            {count}
          </span>
        )}
      </h2>
      {href && (
        <Link href={href} className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold transition-colors">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ── Task Row ──────────────────────────────────────── */
function TaskRow({ task }: { task: any }) {
  const priorityBg = PRIORITY_BG[task.priority] || 'bg-muted text-muted-foreground border-border';
  const priorityColor = PRIORITY_COLORS[task.priority] || 'text-muted-foreground';

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0 group">
      <div className="mt-0.5 shrink-0">
        {task.status === 'sedang_dikerjakan' ? (
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
        ) : (
          <Circle className={cn('w-4 h-4', priorityColor)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href="/portal/tasks"
          className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors"
        >
          {task.title}
        </Link>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {format(parseISO(task.due_date), 'd MMM', { locale: id })}
            </span>
          )}
          <span className={cn(
            'text-[9px] font-semibold px-1.5 py-0.5 rounded-md border',
            priorityBg
          )}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Overdue Alert ─────────────────────────────────── */
function OverdueAlert({ tasks }: { tasks: DashboardData['overdueTasks'] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="p-4 rounded-2xl border border-red-500/25 bg-red-500/5 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-600 dark:text-red-400">
          {tasks.length} tugas terlambat
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {tasks.slice(0, 2).map(t => t.title).join(', ')}
          {tasks.length > 2 && ` dan ${tasks.length - 2} lainnya`}
        </p>
        <Link
          href="/portal/tasks"
          className="text-xs text-red-500 hover:underline mt-1.5 inline-flex items-center gap-1 font-medium"
        >
          Selesaikan sekarang <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

/* ── Goal Card ─────────────────────────────────────── */
function GoalCard({ goal }: { goal: DashboardData['activeGoals'][0] }) {
  const pct = goal.progress ?? 0;
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-primary' : 'bg-amber-400';
  const pctColor = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground';

  return (
    <Link href={`/portal/goals/${goal.id}`} className="block group">
      <div className="glow-card bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all duration-200 hover-border-primary">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{goal.title}</span>
          <span className="badge-muted shrink-0">
            {GOAL_TYPE_LABEL[goal.goal_type ?? ''] ?? goal.goal_type}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className={cn('font-mono-num font-bold', pctColor)}>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(barColor, 'h-1.5 rounded-full transition-all duration-500')}
              style={{ width: `${pct}%` }}
            />
          </div>
          {goal.target_date && (
            <p className="text-[10px] text-muted-foreground font-mono-num">
              Target: {format(parseISO(goal.target_date), 'd MMMM yyyy', { locale: id })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Project Card ──────────────────────────────────── */
function ProjectCard({ project }: { project: DashboardData['activeProjects'][0] }) {
  const statusKey = project.status ?? '';
  const statusDisplay = STATUS_LABEL[statusKey] ?? statusKey;
  const statusClass = project.status === 'active'
    ? 'badge-success'
    : project.status === 'completed'
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full'
    : 'badge-muted';

  return (
    <Link href={`/portal/projects/${project.id}`} className="block group">
      <div className="glow-card bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all duration-200 hover-border-primary">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </span>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
            )}
          </div>
          <span className={statusClass}>{statusDisplay}</span>
        </div>
        {project.end_date && (
          <p className="text-[10px] text-muted-foreground mt-2 font-mono-num flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {format(parseISO(project.end_date), 'd MMM yyyy', { locale: id })}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── Note Card ─────────────────────────────────────── */
function NoteCard({ note }: { note: DashboardData['recentNotes'][0] }) {
  return (
    <Link href={`/portal/notes/${note.id}`} className="block group">
      <div className="glow-card bg-card border border-border rounded-2xl p-3.5 hover:border-primary/30 transition-all duration-200 hover-border-primary">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {note.title}
          </span>
          {note.is_favorite && <span title="Favorit" className="text-sm shrink-0">⭐</span>}
        </div>
        {note.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{note.excerpt}</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1.5 font-mono-num">
          {format(parseISO(note.updated_at), 'd MMM', { locale: id })}
        </p>
      </div>
    </Link>
  );
}

/* ── Diary Card ────────────────────────────────────── */
function DiaryCard({ entry }: { entry: DashboardData['recentDiary'][0] }) {
  const isToday_ = isToday(parseISO(entry.entry_date));
  return (
    <Link
      href={`/portal/diary/${entry.entry_date}`}
      className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-b-0 hover:text-primary transition-colors group"
    >
      <span className="text-xl shrink-0">{MOOD_EMOJI[entry.mood ?? ''] || '📝'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium line-clamp-1">
          {isToday_ ? 'Hari ini' : format(parseISO(entry.entry_date), 'EEEE, d MMM', { locale: id })}
        </div>
        {entry.title && (
          <p className="text-xs text-muted-foreground line-clamp-1">{entry.title}</p>
        )}
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
    </Link>
  );
}

/* ── Activity Feed ─────────────────────────────────── */
function ActivityFeed({ activities }: { activities: DashboardData['recentActivity'] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Belum ada aktivitas.
      </p>
    );
  }
  return (
    <div className="space-y-2.5">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={cn(
            'w-2 h-2 mt-1.5 rounded-full shrink-0',
            ACTIVITY_TYPE_COLOR[activity.type] ?? 'bg-primary/50'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-1 font-medium">{activity.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                {ACTIVITY_TYPE_LABEL[activity.type]}
              </span>
              {activity.status && (
                <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  {STATUS_LABEL[activity.status] ?? activity.status}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground ml-auto font-mono-num">
                {format(parseISO(activity.updated_at), 'd MMM HH:mm', { locale: id })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Focus Task Banner ─────────────────────────────── */
function FocusTaskBanner({ task, onCapture }: { task: any; onCapture: () => void }) {
  if (!task) {
    return (
      <div className="glow-card bg-card border border-dashed border-border rounded-2xl p-5 text-center">
        <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm font-medium text-muted-foreground">Tidak ada tugas prioritas hari ini</p>
        <button
          onClick={onCapture}
          className="mt-2 text-xs text-primary hover:underline"
        >
          + Tambahkan tugas
        </button>
      </div>
    );
  }

  const priorityBg = PRIORITY_BG[task.priority] || 'bg-muted text-muted-foreground border-border';

  return (
    <div className="glow-card rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4.5 h-4.5 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Fokus Utama Hari Ini</span>
      </div>
      <div className="bg-background/60 rounded-xl p-3.5 border border-border/50">
        <TaskRow task={task} />
      </div>
    </div>
  );
}

/* ── Empty Section State ───────────────────────────── */
function EmptySectionState({ message, actionLabel, href }: { message: string; actionLabel: string; href: string }) {
  return (
    <div className="glow-card rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link href={href} className="text-xs text-primary hover:underline mt-1.5 inline-block font-medium">
        {actionLabel} →
      </Link>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────── */
export function CommandCenter({ data }: CommandCenterProps) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const totalTasks = data.todayTasks.length + data.inProgressTasks.length;

  const allUrgentTasks = [...data.overdueTasks, ...data.todayTasks].sort((a, b) => {
    const priorityWeight: Record<string, number> = { kritis: 4, urgent: 4, tinggi: 3, high: 3, normal: 2, rendah: 1, low: 1 };
    return (priorityWeight[b.priority || 'normal'] || 2) - (priorityWeight[a.priority || 'normal'] || 2);
  });
  const focusTask = allUrgentTasks[0] || data.inProgressTasks[0] || null;

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-6">

        {/* Header */}
        <GreetingHeader
          profile={data.profile}
          today={data.today}
          onCapture={() => setQuickCaptureOpen(true)}
        />

        {/* Overdue Alert */}
        {data.overdueTasks.length > 0 && (
          <OverdueAlert tasks={data.overdueTasks} />
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={CheckSquare}
            label="Tugas Hari Ini"
            value={totalTasks}
            href="/portal/tasks"
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={FolderKanban}
            label="Proyek Aktif"
            value={data.activeProjects.length}
            href="/portal/projects"
            color="text-violet-500"
            bgColor="bg-violet-500/10"
          />
          <StatCard
            icon={Target}
            label="Goal Aktif"
            value={data.activeGoals.length}
            href="/portal/goals"
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <StatCard
            icon={Flame}
            label="Habit Selesai"
            value={`${data.habitsCompletedToday}/${data.totalActiveHabits}`}
            href="/portal/habits"
            color="text-orange-500"
            bgColor="bg-orange-500/10"
          />
        </div>

        {/* Main Grid — Left (2/3) + Right (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT COLUMN ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Daily Briefing */}
            <AIBriefingCard />

            {/* Focus Task */}
            <FocusTaskBanner task={focusTask} onCapture={() => setQuickCaptureOpen(true)} />

            {/* Today's Tasks */}
            <div>
              <SectionHeader
                title="Tugas Hari Ini"
                href="/portal/tasks"
                icon={CheckSquare}
                count={totalTasks}
              />
              <div className="rounded-2xl border border-border bg-card p-4 glow-card">
                {data.inProgressTasks.length === 0 && data.todayTasks.length === 0 ? (
                  <div className="text-center py-5 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">Tidak ada tugas aktif hari ini.</p>
                    <button
                      onClick={() => setQuickCaptureOpen(true)}
                      className="text-primary text-xs hover:underline font-medium"
                    >
                      + Tambah tugas baru
                    </button>
                  </div>
                ) : (
                  <div>
                    {data.inProgressTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                    {data.todayTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Goals */}
            <div>
              <SectionHeader
                title="Tujuan Aktif"
                href="/portal/goals"
                icon={Target}
                count={data.activeGoals.length}
              />
              {data.activeGoals.length === 0 ? (
                <EmptySectionState
                  message="Mulai dengan membuat tujuan pertama Anda."
                  actionLabel="Buat Tujuan"
                  href="/portal/goals"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </div>

            {/* Active Projects */}
            <div>
              <SectionHeader
                title="Proyek Aktif"
                href="/portal/projects"
                icon={FolderKanban}
                count={data.activeProjects.length}
              />
              {data.activeProjects.length === 0 ? (
                <EmptySectionState
                  message="Belum ada proyek aktif."
                  actionLabel="Buat Proyek"
                  href="/portal/projects"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.activeProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN ────────────────────────── */}
          <div className="space-y-6">

            {/* Habit Check-In */}
            <div>
              <SectionHeader
                title="Habit Hari Ini"
                href="/portal/habits"
                icon={Zap}
                count={data.totalActiveHabits}
              />
              <div className="rounded-2xl border border-border bg-card p-4 glow-card">
                <HabitCheckInWidget
                  habits={data.habits}
                  habitsCompletedToday={data.habitsCompletedToday}
                  totalActiveHabits={data.totalActiveHabits}
                />
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div>
              <SectionHeader title="Progress Mingguan" icon={TrendingUp} />
              <div className="rounded-2xl border border-border bg-card p-4 glow-card">
                <WeeklyProgressChart
                  dailyChartData={data.dailyChartData}
                  completedTasksThisWeek={data.completedTasksThisWeek}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <SectionHeader title="Aktivitas Terakhir" icon={Activity} />
              <div className="rounded-2xl border border-border bg-card p-4 glow-card">
                <ActivityFeed activities={data.recentActivity} />
              </div>
            </div>

            {/* Recent Notes */}
            <div>
              <SectionHeader
                title="Catatan Terbaru"
                href="/portal/notes"
                icon={BookOpen}
              />
              <div className="rounded-2xl border border-border bg-card p-3 glow-card">
                {data.recentNotes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
                    <button
                      onClick={() => setQuickCaptureOpen(true)}
                      className="text-primary text-xs hover:underline mt-1"
                    >
                      + Buat catatan cepat
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {data.recentNotes.slice(0, 3).map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Diary */}
            <div>
              <SectionHeader
                title="Jurnal Terbaru"
                href="/portal/diary"
                icon={BookHeart}
              />
              <div className="rounded-2xl border border-border bg-card p-4 glow-card">
                {data.recentDiary.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">Belum ada entri jurnal.</p>
                    <Link
                      href={`/portal/diary/${format(new Date(), 'yyyy-MM-dd')}`}
                      className="text-primary text-xs hover:underline"
                    >
                      Tulis hari ini →
                    </Link>
                  </div>
                ) : (
                  data.recentDiary.map((entry) => (
                    <DiaryCard key={entry.id} entry={entry} />
                  ))
                )}
                <Link
                  href={`/portal/diary/${format(new Date(), 'yyyy-MM-dd')}`}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs border border-dashed border-border rounded-xl py-2.5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all font-medium"
                >
                  <BookHeart className="w-3.5 h-3.5" />
                  Tulis Jurnal Hari Ini
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <QuickCaptureModal
        open={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </>
  );
}
