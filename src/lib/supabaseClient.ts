/**
 * Cliente Supabase centralizado para todas as operações de banco de dados
 * Configuração única para evitar duplicação de código
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
}

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos TypeScript para as tabelas principais
export interface UserScaleResponse {
  id: string;
  user_id: string;
  scale_id: string;
  responses: Record<string, number>;
  total_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'severe';
  completed_at: string;
  notes?: string;
}

export interface UserHabit {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  frequency_type: 'daily' | 'weekly' | 'custom';
  frequency_config: Record<string, any>;
  reminder_enabled: boolean;
  reminder_times: string[];
  target_duration_minutes?: number;
  points_per_completion: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmotionPost {
  id: string;
  user_id: string;
  anonymous_id: string;
  content: string;
  emotion_category?: string;
  is_anonymous: boolean;
  is_moderated: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface UserGamification {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
}

export interface DailyMoodLog {
  id: string;
  user_id: string;
  date: string;
  mood_score: number;
  energy_level: number;
  sleep_quality: number;
  sleep_hours?: number;
  stress_level: number;
  notes?: string;
}

/**
 * Funções utilitárias para operações comuns
 */

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Função para fazer login
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Função para fazer cadastro
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Função para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Função para escutar mudanças de autenticação
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;