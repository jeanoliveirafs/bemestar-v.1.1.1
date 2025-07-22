import { useState, useEffect } from 'react';
import { supabaseClient } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export interface Habit {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  frequencia_tipo: 'diario' | 'semanal' | 'mensal';
  frequencia_valor: number;
  meta_diaria?: number;
  unidade?: string;
  cor?: string;
  icone?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface HabitRecord {
  id: string;
  habito_id: string;
  user_id: string;
  data_registro: string;
  valor?: number;
  concluido: boolean;
  observacoes?: string;
  criado_em: string;
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
      const { data, error } = await supabaseClient
        .from('habitos')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

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
      let query = supabaseClient
        .from('habito_registros')
        .select('*')
        .eq('user_id', user.id)
        .order('data_registro', { ascending: false });

      if (startDate) {
        query = query.gte('data_registro', startDate);
      }
      if (endDate) {
        query = query.lte('data_registro', endDate);
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
  const createHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'criado_em' | 'atualizado_em'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('habitos')
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
      const { data, error } = await supabaseClient
        .from('habitos')
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
      const { error } = await supabaseClient
        .from('habitos')
        .update({ ativo: false })
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
  const recordHabit = async (habitId: string, recordData: Omit<HabitRecord, 'id' | 'habito_id' | 'user_id' | 'criado_em'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Verificar se já existe registro para hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: existingRecord } = await supabaseClient
        .from('habito_registros')
        .select('id')
        .eq('habito_id', habitId)
        .eq('user_id', user.id)
        .eq('data_registro', recordData.data_registro || today)
        .single();

      if (existingRecord) {
        // Atualizar registro existente
        const { data, error } = await supabaseClient
          .from('habito_registros')
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
        const { data, error } = await supabaseClient
          .from('habito_registros')
          .insert({
            ...recordData,
            habito_id: habitId,
            user_id: user.id,
            data_registro: recordData.data_registro || today,
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
      
      const { data, error } = await supabaseClient
        .from('habito_registros')
        .select('*')
        .eq('habito_id', habitId)
        .eq('user_id', user.id)
        .gte('data_registro', startDate.toISOString().split('T')[0])
        .order('data_registro', { ascending: true });

      if (error) throw error;

      const totalDays = days;
      const completedDays = data?.filter(record => record.concluido).length || 0;
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
      .filter(record => record.concluido)
      .sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

    if (!sortedRecords.length) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].data_registro);
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