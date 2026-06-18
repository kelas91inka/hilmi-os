export interface UserSettings {
  id: string;
  user_id: string;
  theme: string | null;
  language: string | null;
  timezone: string | null;
  ai_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

export type UpdateSettingsDTO = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
