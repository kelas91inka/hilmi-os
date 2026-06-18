export type GoalType = 'mingguan' | 'bulanan' | 'tahunan' | 'lifetime';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  status: GoalStatus;
  target_date: string | null; // ISO Date string (YYYY-MM-DD)
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null; // ISO timestamp
  created_at: string;
  updated_at: string;
}
