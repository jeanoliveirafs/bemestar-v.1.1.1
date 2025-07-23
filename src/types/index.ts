// Tipos globais para o aplicativo de bem-estar

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_level: number;
  notes?: string;
  created_at: string;
}

export interface UserScaleResponse {
  id: string;
  user_id: string;
  scale_id: string;
  responses: Record<string, any>;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface UserHabit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  target_frequency: number;
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmotionPost {
  id: string;
  user_id: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  reactions: Record<string, number>;
  created_at: string;
}

export interface UserGamification {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  badges_earned: string[];
  achievements_unlocked: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyMoodLog {
  id: string;
  user_id: string;
  date: string;
  morning_mood?: number;
  afternoon_mood?: number;
  evening_mood?: number;
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  notes?: string;
  created_at: string;
}

export interface RoutineItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  scheduled_time?: string;
  is_flexible: boolean;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIGeneratedContent {
  id: string;
  user_id: string;
  content_type: 'exercise' | 'motivation' | 'tip' | 'reflection';
  title: string;
  content: string;
  personalization_data: Record<string, any>;
  is_completed: boolean;
  created_at: string;
}

export interface SoundSession {
  id: string;
  user_id: string;
  sound_type: string;
  duration_minutes: number;
  mood_before?: number;
  mood_after?: number;
  created_at: string;
}

// Tipos para componentes
export interface TabItem {
  id: string;
  name: string;
  icon: any;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  color: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

// Tipos para configurações
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  n8nWebhookUrl: string;
}

// Tipos para notificações
export interface NotificationSettings {
  id: string;
  user_id: string;
  mood_reminders: boolean;
  habit_reminders: boolean;
  routine_reminders: boolean;
  crisis_alerts: boolean;
  community_updates: boolean;
  ai_content_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para relatórios
export interface ProgressReport {
  period: 'week' | 'month' | 'quarter';
  mood_average: number;
  habits_completion_rate: number;
  streak_count: number;
  points_earned: number;
  achievements_unlocked: number;
  sessions_completed: number;
}

// Tipos para escalas psicológicas
export interface PsychologicalScale {
  id: string;
  name: string;
  description: string;
  questions: ScaleQuestion[];
  scoring_method: 'sum' | 'average' | 'weighted';
  risk_thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  created_at: string;
}

export interface ScaleQuestion {
  id: string;
  text: string;
  type: 'likert' | 'boolean' | 'multiple_choice';
  options?: string[];
  weight?: number;
}

// Tipos para plano de crise
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

export interface CrisisResource {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'audio' | 'text' | 'video';
  content_url?: string;
  duration_minutes?: number;
  is_active: boolean;
}

// Tipos para gamificação
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  criteria: Record<string, any>;
  points_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  criteria: Record<string, any>;
  points_reward: number;
  badge_reward?: string;
  is_hidden: boolean;
}

// Tipos para sons e mindfulness
export interface SoundTrack {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'meditation' | 'focus';
  file_url: string;
  duration_minutes: number;
  description?: string;
  mood_tags: string[];
}

export interface MindfulnessSession {
  id: string;
  user_id: string;
  session_type: 'meditation' | 'breathing' | 'sound_therapy' | 'guided';
  duration_minutes: number;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  completed_at: string;
}