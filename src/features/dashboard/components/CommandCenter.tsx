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
  AlertCircle, CheckCircle2, Circle, Activity, TrendingUp, Sparkles,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  kritis: 'bg-red-500/10 text-red-600 dark:text-red-400',
  tinggi: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  normal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  rendah: 'bg-muted text-muted-foreground',
};

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', neutral: '😐', sad: '😔',
  productive: '⚡', stressed: '😰', tired: '😴', sick: '🤒',
};

const GOAL_TYPE_LABEL: Record<string, string> = {
  mingguan: 'Mingguan', bulanan: 'Bulanan', tahunan: 'Tahunan', lifetime: 'Lifetime',
};

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  task: 'Tugas',
  note: 'Catatan',
  goal: 'Tujuan',
};

const ACTIVITY_TYPE_COLOR: Record<string, string> = {
  task: 'bg-blue-500',
  note: 'bg-purple-500',
  goal: 'bg-green-500',
};

const STATUS_LABEL: Record<string, string> = {
  belum_dimulai: 'Belum dimulai',
  sedang_dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
  ditunda: 'Ditunda',
  active: 'Aktif',
};

function GreetingHeader({ profile, today }: { profile: DashboardData['profile']; today: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const name = profile?.full_name?.split(' ')[0] || 'Hilmi';
  const dateLabel = format(parseISO(today), 'EEEE, d MMMM yyyy', { locale: id });

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{dateLabel}</p>
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting}, <span className="text-primary">{name}</span> 👋
      </h1>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, color = 'text-primary' }: {
  icon: React.ElementType; label: string; value: number | string; href?: string; color?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-all group">
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 ${color} group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function SectionHeader({ title, href, icon: Icon }: { title: string; href?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-primary hover:underline flex items-center gap-1">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || 'text-muted-foreground';
  const priorityBg = PRIORITY_BG[task.priority] || 'bg-muted text-muted-foreground';

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0">
      <div className="mt-0.5">
        {task.status === 'sedang_dikerjakan' ? (
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
        ) : (
          <Circle className={`w-4 h-4 ${priorityColor}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link href="/portal/tasks" className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">
          {task.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.due_date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(parseISO(task.due_date), 'd MMM', { locale: id })}
            </span>
          )}
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${priorityBg}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}

function OverdueAlert({ tasks }: { tasks: DashboardData['overdueTasks'] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {tasks.length} tugas terlambat
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tasks.slice(0, 2).map(t => t.title).join(', ')}
          {tasks.length > 2 && ` dan ${tasks.length - 2} lainnya`}
        </p>
        <Link href="/portal/tasks" className="text-xs text-red-500 hover:underline mt-1 inline-block">
          Selesaikan sekarang →
        </Link>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: DashboardData['activeGoals'][0] }) {
  const pct = goal.progress ?? 0;
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : 'bg-orange-400';

  return (
    <Link href={`/portal/goals/${goal.id}`} className="block group">
      <Card className="p-4 hover:shadow-md transition-all group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium line-clamp-1">{goal.title}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
            {GOAL_TYPE_LABEL[goal.goal_type ?? ''] ?? goal.goal_type}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className={`font-semibold ${pct >= 80 ? 'text-green-600' : 'text-foreground'}`}>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`${barColor} h-1.5 rounded-full transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {goal.target_date && (
            <p className="text-xs text-muted-foreground">
              Target: {format(parseISO(goal.target_date), 'd MMMM yyyy', { locale: id })}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

function ProjectCard({ project }: { project: DashboardData['activeProjects'][0] }) {
  // Fix: use actual status from data instead of hardcoding
  const statusKey = project.status ?? '';
  const statusDisplay = STATUS_LABEL[statusKey] ?? statusKey;
  const statusColor = project.status === 'active'
    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
    : project.status === 'completed'
    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
    : 'bg-muted text-muted-foreground';

  return (
    <Link href={`/portal/projects/${project.id}`} className="block group">
      <Card className="p-4 hover:shadow-md transition-all group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium line-clamp-1">{project.title}</span>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
            {statusDisplay}
          </span>
        </div>
        {project.end_date && (
          <p className="text-xs text-muted-foreground mt-2">
            Deadline: {format(parseISO(project.end_date), 'd MMM yyyy', { locale: id })}
          </p>
        )}
      </Card>
    </Link>
  );
}

function NoteCard({ note }: { note: DashboardData['recentNotes'][0] }) {
  return (
    <Link href={`/portal/notes/${note.id}`} className="block group">
      <Card className="p-4 hover:shadow-md transition-all group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium line-clamp-1">{note.title}</span>
          {note.is_favorite && <span title="Favorit">⭐</span>}
        </div>
        {note.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{note.excerpt}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(parseISO(note.updated_at), 'd MMM', { locale: id })}
        </p>
      </Card>
    </Link>
  );
}

function DiaryCard({ entry }: { entry: DashboardData['recentDiary'][0] }) {
  const isToday_ = isToday(parseISO(entry.entry_date));
  return (
    <Link href={`/portal/diary/${entry.entry_date}`} className="flex items-center gap-3 py-2 border-b last:border-b-0 hover:text-primary transition-colors">
      <span className="text-xl">{MOOD_EMOJI[entry.mood ?? ''] || '📝'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium line-clamp-1">
          {isToday_ ? 'Hari ini' : format(parseISO(entry.entry_date), 'EEEE, d MMM', { locale: id })}
        </div>
        {entry.title && <p className="text-xs text-muted-foreground line-clamp-1">{entry.title}</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {MOOD_EMOJI[entry.mood ?? ''] ? entry.mood : ''}
      </span>
    </Link>
  );
}

function ActivityFeed({ activities }: { activities: DashboardData['recentActivity'] }) {
  if (activities.length === 0) return (
    <p className="text-sm text-muted-foreground text-center py-2">Belum ada aktivitas.</p>
  );

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${ACTIVITY_TYPE_COLOR[activity.type] ?? 'bg-primary/50'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-1">{activity.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {ACTIVITY_TYPE_LABEL[activity.type]}
              </span>
              {activity.status && (
                <span className="text-[10px] text-muted-foreground">
                  {STATUS_LABEL[activity.status] ?? activity.status}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {format(parseISO(activity.updated_at), 'd MMM HH:mm', { locale: id })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommandCenter({ data }: CommandCenterProps) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const totalTasks = data.todayTasks.length + data.inProgressTasks.length;

  // Determine Top Focus
  const allUrgentTasks = [...data.overdueTasks, ...data.todayTasks].sort((a, b) => {
    const priorityWeight: Record<string, number> = { kritis: 4, urgent: 4, tinggi: 3, high: 3, normal: 2, rendah: 1, low: 1 };
    return (priorityWeight[b.priority || 'normal'] || 2) - (priorityWeight[a.priority || 'normal'] || 2);
  });
  const focusTask = allUrgentTasks[0] || data.inProgressTasks[0] || null;

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <GreetingHeader profile={data.profile} today={data.today} />
          <div className="flex gap-2 flex-shrink-0">
            {/* Quick Capture button — most prominent */}
            <button
              onClick={() => setQuickCaptureOpen(true)}
              id="quick-capture-btn"
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-2 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Cepat
            </button>
            <Link
              href={`/portal/diary/${format(new Date(), 'yyyy-MM-dd')}`}
              className="text-xs border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-1.5"
            >
              <BookHeart className="w-3.5 h-3.5" />
              Tulis Jurnal
            </Link>
          </div>
        </div>

        {/* Overdue Alert */}
        {data.overdueTasks.length > 0 && <OverdueAlert tasks={data.overdueTasks} />}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={CheckSquare} label="Tugas Hari Ini" value={totalTasks} href="/portal/tasks" />
          <StatCard icon={FolderKanban} label="Proyek Aktif" value={data.activeProjects.length} href="/portal/projects" color="text-blue-500" />
          <StatCard icon={Target} label="Goal Aktif" value={data.activeGoals.length} href="/portal/goals" color="text-purple-500" />
          <StatCard icon={Zap} label="Habit Selesai" value={`${data.habitsCompletedToday}/${data.totalActiveHabits}`} href="/portal/habits" color="text-orange-500" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Briefing */}
            <AIBriefingCard />

            {/* Fokus Utama Hari Ini */}
            {focusTask && (
              <div className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 rounded-xl p-5 border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-lg text-primary">Fokus Utama</h2>
                </div>
                <div className="bg-background rounded-lg p-3 border">
                  <TaskRow task={focusTask} />
                </div>
              </div>
            )}

            {/* In Progress + Today Tasks */}
            <div>
              <SectionHeader title="Tugas Hari Ini" href="/portal/tasks" icon={CheckSquare} />
              <div className="rounded-xl border bg-card p-4">
                {data.inProgressTasks.length === 0 && data.todayTasks.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Tidak ada tugas aktif hari ini.</p>
                    <button
                      onClick={() => setQuickCaptureOpen(true)}
                      className="text-primary text-sm hover:underline"
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
              <SectionHeader title="Tujuan Aktif" href="/portal/goals" icon={Target} />
              {data.activeGoals.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">Mulai dengan membuat tujuan pertama Anda.</p>
                  <Link href="/portal/goals" className="text-primary text-sm hover:underline mt-1 inline-block">
                    Buat Tujuan →
                  </Link>
                </div>
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
              <SectionHeader title="Proyek Aktif" href="/portal/projects" icon={FolderKanban} />
              {data.activeProjects.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">Belum ada proyek aktif.</p>
                  <Link href="/portal/projects" className="text-primary text-sm hover:underline mt-1 inline-block">
                    Buat Proyek →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.activeProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Sidebar widgets */}
          <div className="space-y-6">

            {/* Habit Check-In — interactive */}
            <div>
              <SectionHeader title="Habit Hari Ini" href="/portal/habits" icon={Zap} />
              <div className="rounded-xl border bg-card p-4">
                <HabitCheckInWidget
                  habits={data.habits}
                  habitsCompletedToday={data.habitsCompletedToday}
                  totalActiveHabits={data.totalActiveHabits}
                />
              </div>
            </div>

            {/* Weekly Progress — with mini chart */}
            <div>
              <SectionHeader title="Progress Mingguan" icon={TrendingUp} />
              <div className="rounded-xl border bg-card p-4">
                <WeeklyProgressChart
                  dailyChartData={data.dailyChartData}
                  completedTasksThisWeek={data.completedTasksThisWeek}
                />
              </div>
            </div>

            {/* Recent Activity — multi-source */}
            <div>
              <SectionHeader title="Aktivitas Terakhir" icon={Activity} />
              <div className="rounded-xl border bg-card p-4">
                <ActivityFeed activities={data.recentActivity} />
              </div>
            </div>

            {/* Recent Notes */}
            <div>
              <SectionHeader title="Catatan Terbaru" href="/portal/notes" icon={BookOpen} />
              <div className="rounded-xl border bg-card p-4">
                {data.recentNotes.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
                    <button
                      onClick={() => setQuickCaptureOpen(true)}
                      className="text-primary text-xs hover:underline"
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
              <SectionHeader title="Jurnal Terbaru" href="/portal/diary" icon={BookHeart} />
              <div className="rounded-xl border bg-card p-4">
                {data.recentDiary.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">Belum ada entri jurnal.</p>
                    <Link href={`/portal/diary/${format(new Date(), 'yyyy-MM-dd')}`} className="text-primary text-xs hover:underline">
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
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs border border-dashed rounded-lg py-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <BookHeart className="w-3.5 h-3.5" />
                  Tulis Jurnal Hari Ini
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        open={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </>
  );
}
