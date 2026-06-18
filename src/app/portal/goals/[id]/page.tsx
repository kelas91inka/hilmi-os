import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Target, TrendingUp, CheckCircle2, Circle, Clock, PauseCircle } from 'lucide-react';

import { goalService } from '@/features/goals/services/goal.service';
import { taskService } from '@/features/tasks/services/task.service';
import { MilestoneList } from '@/features/goals/components/MilestoneList';
import { MilestoneForm } from '@/features/goals/components/MilestoneForm';
import { GoalForm } from '@/features/goals/components/GoalForm';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GoalProgressUpdater } from '@/features/goals/components/GoalProgressUpdater';

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // CRITICAL: Await params in Next.js 16 to avoid silent failures and 22P02 UUID errors
  const { id } = await params;

  const goal = await goalService.getGoalById(id);

  if (!goal) {
    notFound();
  }

  const [milestones, linkedTasks] = await Promise.all([
    goalService.getMilestones(id),
    taskService.getTasksByGoalId(id),
  ]);

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Aktif", className: "bg-blue-500/15 text-blue-700 border-transparent" },
    completed: { label: "Selesai", className: "bg-emerald-500/15 text-emerald-700 border-transparent" },
    archived: { label: "Diarsipkan", className: "bg-slate-800/15 text-slate-900 border-transparent" },
  };



  const typeLabels: Record<string, string> = {
    mingguan: "Mingguan",
    bulanan: "Bulanan",
    tahunan: "Tahunan",
    lifetime: "Lifetime",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link href="/portal/goals" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Goals
        </Link>
      </div>

      {/* Goal Header */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border dark:border-slate-800 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="font-normal uppercase tracking-wider text-[10px]">
                {typeLabels[goal.goal_type] || goal.goal_type}
              </Badge>
              <Badge variant="secondary" className={`${statusConfig[goal.status]?.className || statusConfig.active.className}`}>
                {statusConfig[goal.status]?.label || "Aktif"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              {goal.title}
            </h1>
            
            {goal.description && (
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                {goal.description}
              </p>
            )}

            <div className="flex items-center gap-6 mt-6 text-sm text-slate-500">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Dibuat: {format(new Date(goal.created_at), "dd MMM yyyy")}
              </div>
              {goal.target_date && (
                <div className="flex items-center text-orange-600 font-medium">
                  <Target className="mr-2 h-4 w-4" />
                  Target Selesai: {format(new Date(goal.target_date), "dd MMM yyyy")}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <GoalForm 
              trigger={<button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors">Edit Tujuan</button>}
              initialData={{
                id: goal.id,
                title: goal.title,
                description: goal.description || "",
                status: goal.status,
                goal_type: goal.goal_type,
                target_date: goal.target_date ? goal.target_date.split('T')[0] : "",
                progress: goal.progress,
              }}
            />
          </div>
        </div>

        {/* Big Progress Bar / Slider */}
        <GoalProgressUpdater goalId={goal.id} initialProgress={goal.progress} />
        
        <div className="mt-4">
          <p className="text-sm text-slate-500">
            {milestones.filter(m => m.completed).length} dari {milestones.length} milestone dan {linkedTasks.filter(t => t.status === 'selesai').length} dari {linkedTasks.length} tugas telah diselesaikan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Milestones</h2>
            <MilestoneForm goalId={goal.id} />
          </div>
          
          <MilestoneList goalId={goal.id} milestones={milestones} />
        </div>

        {/* Side Panel — Linked Tasks */}
        <div className="space-y-6">
          <Card className="dark:bg-slate-950 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Tugas Terkait</h3>
                <Badge variant="secondary" className="text-xs">
                  {linkedTasks.filter(t => t.status === 'selesai').length}/{linkedTasks.length}
                </Badge>
              </div>

              {linkedTasks.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center border border-dashed dark:border-slate-800">
                  Belum ada tugas yang ditautkan ke tujuan ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedTasks.map((task) => {
                    const statusIcon = {
                      selesai: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
                      sedang_dikerjakan: <Clock className="w-4 h-4 text-blue-500 shrink-0" />,
                      ditunda: <PauseCircle className="w-4 h-4 text-yellow-500 shrink-0" />,
                      belum_dimulai: <Circle className="w-4 h-4 text-slate-300 shrink-0" />,
                    }[task.status ?? 'belum_dimulai'] ?? <Circle className="w-4 h-4 text-slate-300 shrink-0" />;

                    const priorityColor = {
                      kritis: 'text-red-600 bg-red-50 border-red-200',
                      tinggi: 'text-orange-600 bg-orange-50 border-orange-200',
                      normal: 'text-blue-600 bg-blue-50 border-blue-200',
                      rendah: 'text-slate-500 bg-slate-50 border-slate-200',
                    }[task.priority ?? 'normal'] ?? 'text-slate-500 bg-slate-50';

                    return (
                      <Link
                        key={task.id}
                        href="/portal/tasks"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                      >
                        {statusIcon}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-1 ${
                            task.status === 'selesai' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {task.title}
                          </p>
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mt-1 ${priorityColor}`}>
                            {task.priority}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
