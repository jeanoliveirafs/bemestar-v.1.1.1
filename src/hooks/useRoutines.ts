import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: 'morning' | 'evening' | 'exercise' | 'meditation' | 'work' | 'custom';
  estimated_duration: number; // em minutos
  activities: RoutineActivity[];
  days_of_week: number[]; // 0-6 (domingo a sábado)
  preferred_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineActivity {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  order: number;
  is_required: boolean;
}

export interface RoutineExecution {
  id: string;
  routine_id: string;
  user_id: string;
  execution_date: string;
  start_time?: string;
  end_time?: string;
  completed_activities: string[]; // IDs das atividades concluídas
  rating?: number; // 1-5
  notes?: string;
  is_completed: boolean;
  created_at: string;
}

export function useRoutines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineExecutions, setRoutineExecutions] = useState<RoutineExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar routines do usuário
  const loadRoutines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar routines');
    } finally {
      setLoading(false);
    }
  };

  // Carregar execuções de routines
  const loadRoutineExecutions = async (startDate?: string, endDate?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('routine_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('execution_date', { ascending: false });

      if (startDate) {
        query = query.gte('execution_date', startDate);
      }
      if (endDate) {
        query = query.lte('execution_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRoutineExecutions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar execuções');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova rotina
  const createRoutine = async (routineData: Omit<Routine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_routines')
        .insert({
          ...routineData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRoutines(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar routine');
      throw err;
    }
  };

  // Atualizar rotina
  const updateRoutine = async (routineId: string, updates: Partial<Routine>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('user_routines')
        .update(updates)
        .eq('id', routineId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setRoutines(prev => prev.map(routine => 
        routine.id === routineId ? data : routine
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar routine');
      throw err;
    }
  };

  // Deletar rotina (soft delete)
  const deleteRoutine = async (routineId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabase
        .from('user_routines')
        .update({ is_active: false })
        .eq('id', routineId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setRoutines(prev => prev.filter(routine => routine.id !== routineId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar routine');
      throw err;
    }
  };

  // Iniciar execução de rotina
  const startRoutineExecution = async (routineId: string, dataExecucao?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const today = dataExecucao || new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      // Verificar se já existe execução para hoje
      const { data: existingExecution } = await supabase
        .from('routine_executions')
        .select('id')
        .eq('routine_id', routineId)
        .eq('user_id', user.id)
        .eq('execution_date', today)
        .single();

      if (existingExecution) {
        throw new Error('Routine já foi iniciada hoje');
      }

      const { data, error } = await supabase
        .from('routine_executions')
        .insert({
          routine_id: routineId,
          user_id: user.id,
          execution_date: today,
          start_time: now,
          completed_activities: [],
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRoutineExecutions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar routine');
      throw err;
    }
  };

  // Atualizar execução de routine
  const updateRoutineExecution = async (
    executionId: string, 
    updates: Partial<RoutineExecution>
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('routine_executions')
        .update(updates)
        .eq('id', executionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setRoutineExecutions(prev => prev.map(execution => 
        execution.id === executionId ? data : execution
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar execução');
      throw err;
    }
  };

  // Marcar atividade como concluída
  const completeActivity = async (executionId: string, activityId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Buscar execução atual
      const { data: execution, error: fetchError } = await supabase
        .from('routine_executions')
        .select('completed_activities')
        .eq('id', executionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const completedActivities = execution.completed_activities || [];
      
      if (!completedActivities.includes(activityId)) {
        completedActivities.push(activityId);
        
        await updateRoutineExecution(executionId, {
          completed_activities: completedActivities
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar atividade');
      throw err;
    }
  };

  // Finalizar execução de routine
  const finishRoutineExecution = async (
    executionId: string, 
    rating?: number, 
    notes?: string
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const now = new Date().toTimeString().split(' ')[0];
      
      await updateRoutineExecution(executionId, {
        end_time: now,
        rating,
        notes,
        is_completed: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar routine');
      throw err;
    }
  };

  // Obter estatísticas de routines
  const getRoutineStats = async (routineId: string, days: number = 30) => {
    if (!user) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('routine_executions')
        .select('*')
        .eq('routine_id', routineId)
        .eq('user_id', user.id)
        .gte('execution_date', startDate.toISOString().split('T')[0])
        .order('execution_date', { ascending: true });

      if (error) throw error;

      const totalDays = days;
      const executedDays = data?.length || 0;
      const completedDays = data?.filter(execution => execution.is_completed).length || 0;
        const averageRating = data?.length ? 
          data.reduce((sum, exec) => sum + (exec.rating || 0), 0) / data.length : 0;
      
      return {
        totalDays,
        executedDays,
        completedDays,
        executionRate: (executedDays / totalDays) * 100,
        completionRate: executedDays > 0 ? (completedDays / executedDays) * 100 : 0,
        averageRating,
        executions: data || [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular estatísticas');
      return null;
    }
  };

  // Obter routines para hoje
  const getTodayRoutines = () => {
    const today = new Date().getDay(); // 0 = domingo, 1 = segunda, etc.
    return routines.filter(routine => 
      routine.is_active && routine.days_of_week.includes(today)
    );
  };

  // Verificar se routine foi executada hoje
  const isRoutineExecutedToday = (routineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return routineExecutions.some(execution => 
      execution.routine_id === routineId && 
      execution.execution_date === today
    );
  };

  useEffect(() => {
    if (user) {
      loadRoutines();
      loadRoutineExecutions();
    }
  }, [user]);

  return {
    routines,
    routineExecutions,
    loading,
    error,
    loadRoutines,
    loadRoutineExecutions,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    startRoutineExecution,
    updateRoutineExecution,
    completeActivity,
    finishRoutineExecution,
    getRoutineStats,
    getTodayRoutines,
    isRoutineExecutedToday,
    clearError: () => setError(null),
  };
}