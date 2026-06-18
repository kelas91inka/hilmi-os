import { createClient } from '@/lib/supabase/server';
import { format, startOfWeek, endOfWeek, subDays, eachDayOfInterval } from 'date-fns';

export async function getDashboardData() {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Last 7 days for mini chart
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  }).map(d => format(d, 'yyyy-MM-dd'));

  const [
    todayTasksRes,
    overdueTasksRes,
    inProgressTasksRes,
    activeProjectsRes,
    activeGoalsRes,
    activeHabitsRes,
    todayHabitLogsRes,
    weekHabitLogsRes,
    recentNotesRes,
    recentDiaryRes,
    profileRes,
    completedThisWeekRes,
    // Multi-source recent activity
    recentTasksRes,
    recentNotesActivityRes,
    recentGoalsActivityRes,
    // Daily completed tasks for mini chart
    last7DaysTasksRes,
  ] = await Promise.all([
    // Tasks due today
    supabase
      .from('tasks')
      .select('*, task_tags(id, tag)')
      .eq('status', 'belum_dimulai')
      .lte('due_date', today + 'T23:59:59Z')
      .gte('due_date', today + 'T00:00:00Z')
      .order('priority', { ascending: false }),

    // Overdue tasks
    supabase
      .from('tasks')
      .select('id, title, priority, due_date, status')
      .in('status', ['belum_dimulai', 'sedang_dikerjakan'])
      .lt('due_date', today + 'T00:00:00Z')
      .order('due_date', { ascending: true })
      .limit(5),

    // In progress tasks
    supabase
      .from('tasks')
      .select('*, task_tags(id, tag)')
      .eq('status', 'sedang_dikerjakan')
      .order('updated_at', { ascending: false })
      .limit(5),

    // Active projects
    supabase
      .from('projects')
      .select('id, title, status, description, start_date, end_date, cover_image')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(4),

    // Active goals
    supabase
      .from('goals')
      .select('id, title, goal_type, status, progress, target_date, description')
      .eq('status', 'active')
      .order('target_date', { ascending: true })
      .limit(4),

    // Active habits
    supabase
      .from('habits')
      .select('id, title'),

    // Today's habit logs
    supabase
      .from('habit_logs')
      .select('habit_id, completed_date')
      .eq('completed_date', today),

    // This week's habit logs for streaks
    supabase
      .from('habit_logs')
      .select('habit_id, completed_date')
      .gte('completed_date', weekStart)
      .lte('completed_date', weekEnd),

    // Recent notes
    supabase
      .from('notes')
      .select('id, title, excerpt, updated_at, is_favorite')
      .order('updated_at', { ascending: false })
      .limit(4),

    // Recent diary entries
    supabase
      .from('diary_entries')
      .select('id, title, mood, entry_date, content')
      .order('entry_date', { ascending: false })
      .limit(3),

    // Profile
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .single(),

    // Tasks completed this week
    supabase
      .from('tasks')
      .select('id')
      .eq('status', 'selesai')
      .gte('completed_at', weekStart + 'T00:00:00Z')
      .lte('completed_at', weekEnd + 'T23:59:59Z'),

    // Recent activity source 1: tasks
    supabase
      .from('tasks')
      .select('id, title, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3),

    // Recent activity source 2: notes
    supabase
      .from('notes')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3),

    // Recent activity source 3: goals
    supabase
      .from('goals')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3),

    // Daily completed tasks for mini bar chart (last 7 days)
    supabase
      .from('tasks')
      .select('id, completed_at')
      .eq('status', 'selesai')
      .gte('completed_at', last7Days[0] + 'T00:00:00Z')
      .lte('completed_at', today + 'T23:59:59Z'),
  ]);

  const activeHabits = activeHabitsRes.data || [];
  const todayLogs = todayHabitLogsRes.data || [];
  const weekLogs = weekHabitLogsRes.data || [];

  const habitsWithStatus = activeHabits.map((habit) => ({
    ...habit,
    completedToday: todayLogs.some((log) => log.habit_id === habit.id),
    completionsThisWeek: weekLogs.filter((log) => log.habit_id === habit.id).length,
    // Streak: consecutive days back from today that this habit has a log
    streak: (() => {
      let streak = 0;
      const habitWeekLogs = weekLogs
        .filter((log) => log.habit_id === habit.id)
        .map((log) => log.completed_date);
      // Simple streak: count days from today backward that have a log
      for (let i = 0; i < 7; i++) {
        const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (habitWeekLogs.includes(checkDate)) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    })(),
  }));

  // Merge and sort recent activity from multiple sources
  const recentActivity = [
    ...(recentTasksRes.data || []).map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      type: 'task' as const,
      status: t.status,
      updated_at: t.updated_at,
    })),
    ...(recentNotesActivityRes.data || []).map(n => ({
      id: `note-${n.id}`,
      title: n.title,
      type: 'note' as const,
      status: null,
      updated_at: n.updated_at,
    })),
    ...(recentGoalsActivityRes.data || []).map(g => ({
      id: `goal-${g.id}`,
      title: g.title,
      type: 'goal' as const,
      status: null,
      updated_at: g.updated_at,
    })),
  ]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  // Build daily chart data for last 7 days
  const completedTasks = last7DaysTasksRes.data || [];
  const dailyChartData = last7Days.map(date => ({
    date,
    count: completedTasks.filter(t => {
      if (!t.completed_at) return false;
      return t.completed_at.startsWith(date);
    }).length,
  }));

  return {
    profile: profileRes.data,
    today,
    todayTasks: todayTasksRes.data || [],
    overdueTasks: overdueTasksRes.data || [],
    inProgressTasks: inProgressTasksRes.data || [],
    activeProjects: activeProjectsRes.data || [],
    activeGoals: activeGoalsRes.data || [],
    habits: habitsWithStatus,
    habitsCompletedToday: habitsWithStatus.filter((h) => h.completedToday).length,
    totalActiveHabits: activeHabits.length,
    recentNotes: recentNotesRes.data || [],
    recentDiary: recentDiaryRes.data || [],
    completedTasksThisWeek: completedThisWeekRes.data?.length || 0,
    recentActivity,
    dailyChartData,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
