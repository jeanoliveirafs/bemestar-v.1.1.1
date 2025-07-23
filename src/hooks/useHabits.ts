import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Habit {
  id: string;
  user_id: string;
  category_id?: string;
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

export interface HabitRecord {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  completion_date: string;
  duration_minutes?: number;
  notes?: string;
  points_earned: number;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar hábitos do usuário
  const loadHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar hábitos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar registros de hábitos
  const loadHabitRecords = async (startDate?: string, endDate?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (startDate) {
        query = query.gte('completion_date', startDate);
      }
      if (endDate) {
        query = query.lte('completion_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHabitRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo hábito
  const createHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          ...habitData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setHabits(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar hábito');
      throw err;
    }
  };

  // Atualizar hábito
  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .update(updates)
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? data : habit
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar hábito');
      throw err;
    }
  };

  // Deletar hábito (soft delete)
  const deleteHabit = async (habitId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('user_habits')
        .update({ is_active: false })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar hábito');
      throw err;
    }
  };

  // Registrar execução de hábito
  const recordHabit = async (habitId: string, recordData: Omit<HabitRecord, 'id' | 'habit_id' | 'user_id' | 'completion_date'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Verificar se já existe registro para hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: existingRecord } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completion_date', today)
        .single();

      if (existingRecord) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('habit_completions')
          .update(recordData)
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        
        setHabitRecords(prev => prev.map(record => 
          record.id === existingRecord.id ? data : record
        ));
        return data;
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            ...recordData,
            habit_id: habitId,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        setHabitRecords(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar hábito');
      throw err;
    }
  };

  // Obter estatísticas de hábitos
  const getHabitStats = async (habitId: string, days: number = 30) => {
    if (!user) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completion_date', startDate.toISOString().split('T')[0])
        .order('completion_date', { ascending: true });

      if (error) throw error;

      const totalDays = days;
      const completedDays = data?.length || 0;
      const streak = calculateStreak(data || []);
      
      return {
        totalDays,
        completedDays,
        completionRate: (completedDays / totalDays) * 100,
        currentStreak: streak,
        records: data || [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular estatísticas');
      return null;
    }
  };

  // Calcular sequência atual
  const calculateStreak = (records: HabitRecord[]): number => {
    if (!records.length) return 0;

    const sortedRecords = records
      .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());

    if (!sortedRecords.length) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].completion_date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (recordDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  useEffect(() => {
    if (user) {
      loadHabits();
      loadHabitRecords();
    }
  }, [user]);

  return {
    habits,
    habitRecords,
    loading,
    error,
    loadHabits,
    loadHabitRecords,
    createHabit,
    updateHabit,
    deleteHabit,
    recordHabit,
    getHabitStats,
    clearError: () => setError(null),
  };
}