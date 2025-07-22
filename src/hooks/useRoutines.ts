import { useState, useEffect } from 'react';
import { supabaseClient } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export interface Routine {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  categoria: 'matinal' | 'noturna' | 'exercicio' | 'meditacao' | 'trabalho' | 'personalizada';
  duracao_estimada: number; // em minutos
  atividades: RoutineActivity[];
  dias_semana: number[]; // 0-6 (domingo a sábado)
  horario_preferido?: string;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface RoutineActivity {
  id: string;
  nome: string;
  descricao?: string;
  duracao: number; // em minutos
  ordem: number;
  obrigatoria: boolean;
}

export interface RoutineExecution {
  id: string;
  rotina_id: string;
  user_id: string;
  data_execucao: string;
  horario_inicio?: string;
  horario_fim?: string;
  atividades_concluidas: string[]; // IDs das atividades concluídas
  avaliacao?: number; // 1-5
  observacoes?: string;
  concluida: boolean;
  criado_em: string;
}

export function useRoutines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineExecutions, setRoutineExecutions] = useState<RoutineExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar rotinas do usuário
  const loadRoutines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('rotinas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar execuções de rotinas
  const loadRoutineExecutions = async (startDate?: string, endDate?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabaseClient
        .from('rotina_execucoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_execucao', { ascending: false });

      if (startDate) {
        query = query.gte('data_execucao', startDate);
      }
      if (endDate) {
        query = query.lte('data_execucao', endDate);
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
  const createRoutine = async (routineData: Omit<Routine, 'id' | 'user_id' | 'criado_em' | 'atualizado_em'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('rotinas')
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
      setError(err instanceof Error ? err.message : 'Erro ao criar rotina');
      throw err;
    }
  };

  // Atualizar rotina
  const updateRoutine = async (routineId: string, updates: Partial<Routine>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('rotinas')
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
      setError(err instanceof Error ? err.message : 'Erro ao atualizar rotina');
      throw err;
    }
  };

  // Deletar rotina (soft delete)
  const deleteRoutine = async (routineId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabaseClient
        .from('rotinas')
        .update({ ativa: false })
        .eq('id', routineId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setRoutines(prev => prev.filter(routine => routine.id !== routineId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar rotina');
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
      const { data: existingExecution } = await supabaseClient
        .from('rotina_execucoes')
        .select('id')
        .eq('rotina_id', routineId)
        .eq('user_id', user.id)
        .eq('data_execucao', today)
        .single();

      if (existingExecution) {
        throw new Error('Rotina já foi iniciada hoje');
      }

      const { data, error } = await supabaseClient
        .from('rotina_execucoes')
        .insert({
          rotina_id: routineId,
          user_id: user.id,
          data_execucao: today,
          horario_inicio: now,
          atividades_concluidas: [],
          concluida: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRoutineExecutions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar rotina');
      throw err;
    }
  };

  // Atualizar execução de rotina
  const updateRoutineExecution = async (
    executionId: string, 
    updates: Partial<RoutineExecution>
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('rotina_execucoes')
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
      const { data: execution, error: fetchError } = await supabaseClient
        .from('rotina_execucoes')
        .select('atividades_concluidas')
        .eq('id', executionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const completedActivities = execution.atividades_concluidas || [];
      
      if (!completedActivities.includes(activityId)) {
        completedActivities.push(activityId);
        
        await updateRoutineExecution(executionId, {
          atividades_concluidas: completedActivities
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar atividade');
      throw err;
    }
  };

  // Finalizar execução de rotina
  const finishRoutineExecution = async (
    executionId: string, 
    avaliacao?: number, 
    observacoes?: string
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const now = new Date().toTimeString().split(' ')[0];
      
      await updateRoutineExecution(executionId, {
        horario_fim: now,
        avaliacao,
        observacoes,
        concluida: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar rotina');
      throw err;
    }
  };

  // Obter estatísticas de rotinas
  const getRoutineStats = async (routineId: string, days: number = 30) => {
    if (!user) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabaseClient
        .from('rotina_execucoes')
        .select('*')
        .eq('rotina_id', routineId)
        .eq('user_id', user.id)
        .gte('data_execucao', startDate.toISOString().split('T')[0])
        .order('data_execucao', { ascending: true });

      if (error) throw error;

      const totalDays = days;
      const executedDays = data?.length || 0;
      const completedDays = data?.filter(execution => execution.concluida).length || 0;
      const averageRating = data?.length ? 
        data.reduce((sum, exec) => sum + (exec.avaliacao || 0), 0) / data.length : 0;
      
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

  // Obter rotinas para hoje
  const getTodayRoutines = () => {
    const today = new Date().getDay(); // 0 = domingo, 1 = segunda, etc.
    return routines.filter(routine => 
      routine.ativa && routine.dias_semana.includes(today)
    );
  };

  // Verificar se rotina foi executada hoje
  const isRoutineExecutedToday = (routineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return routineExecutions.some(execution => 
      execution.rotina_id === routineId && 
      execution.data_execucao === today
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