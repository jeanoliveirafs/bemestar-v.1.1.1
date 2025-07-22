import { useState, useEffect } from 'react';
import { supabaseClient } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export interface EmotionPost {
  id: string;
  user_id: string;
  emocao_principal: string;
  intensidade: number; // 1-10
  descricao?: string;
  gatilhos?: string[];
  contexto?: string;
  localizacao?: string;
  clima?: string;
  pessoas_presentes?: string[];
  atividade_atual?: string;
  pensamentos?: string;
  sensacoes_fisicas?: string;
  estrategias_usadas?: string[];
  tags?: string[];
  privado: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface EmotionReaction {
  id: string;
  post_id: string;
  user_id: string;
  tipo_reacao: 'apoio' | 'compreensao' | 'forca' | 'gratidao' | 'inspiracao';
  comentario?: string;
  criado_em: string;
}

export interface EmotionInsight {
  emotion: string;
  count: number;
  averageIntensity: number;
  commonTriggers: string[];
  commonStrategies: string[];
  timePattern: { hour: number; count: number }[];
  weekPattern: { day: number; count: number }[];
}

export function useEmotions() {
  const { user } = useAuth();
  const [emotionPosts, setEmotionPosts] = useState<EmotionPost[]>([]);
  const [emotionReactions, setEmotionReactions] = useState<EmotionReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar posts de emoções do usuário
  const loadEmotionPosts = async (limit?: number, offset?: number) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabaseClient
        .from('emocao_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      if (offset && offset > 0) {
        setEmotionPosts(prev => [...prev, ...(data || [])]);
      } else {
        setEmotionPosts(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar posts de emoções');
    } finally {
      setLoading(false);
    }
  };

  // Carregar reações dos posts
  const loadEmotionReactions = async (postIds?: string[]) => {
    if (!user) return;

    try {
      let query = supabaseClient
        .from('emocao_reacoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (postIds && postIds.length > 0) {
        query = query.in('post_id', postIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmotionReactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reações');
    }
  };

  // Criar novo post de emoção
  const createEmotionPost = async (postData: Omit<EmotionPost, 'id' | 'user_id' | 'criado_em' | 'atualizado_em'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('emocao_posts')
        .insert({
          ...postData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setEmotionPosts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar post de emoção');
      throw err;
    }
  };

  // Atualizar post de emoção
  const updateEmotionPost = async (postId: string, updates: Partial<EmotionPost>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabaseClient
        .from('emocao_posts')
        .update(updates)
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setEmotionPosts(prev => prev.map(post => 
        post.id === postId ? data : post
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar post');
      throw err;
    }
  };

  // Deletar post de emoção
  const deleteEmotionPost = async (postId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabaseClient
        .from('emocao_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEmotionPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar post');
      throw err;
    }
  };

  // Adicionar reação a um post
  const addReaction = async (postId: string, reactionData: Omit<EmotionReaction, 'id' | 'post_id' | 'user_id' | 'criado_em'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Verificar se já existe reação do usuário para este post
      const { data: existingReaction } = await supabaseClient
        .from('emocao_reacoes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // Atualizar reação existente
        const { data, error } = await supabaseClient
          .from('emocao_reacoes')
          .update(reactionData)
          .eq('id', existingReaction.id)
          .select()
          .single();

        if (error) throw error;
        
        setEmotionReactions(prev => prev.map(reaction => 
          reaction.id === existingReaction.id ? data : reaction
        ));
        return data;
      } else {
        // Criar nova reação
        const { data, error } = await supabaseClient
          .from('emocao_reacoes')
          .insert({
            ...reactionData,
            post_id: postId,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        setEmotionReactions(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar reação');
      throw err;
    }
  };

  // Remover reação
  const removeReaction = async (postId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { error } = await supabaseClient
        .from('emocao_reacoes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEmotionReactions(prev => prev.filter(reaction => 
        !(reaction.post_id === postId && reaction.user_id === user.id)
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover reação');
      throw err;
    }
  };

  // Obter insights de emoções
  const getEmotionInsights = async (days: number = 30): Promise<EmotionInsight[]> => {
    if (!user) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabaseClient
        .from('emocao_posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('criado_em', startDate.toISOString())
        .order('criado_em', { ascending: true });

      if (error) throw error;

      const posts = data || [];
      const emotionMap = new Map<string, {
        count: number;
        totalIntensity: number;
        triggers: string[];
        strategies: string[];
        times: Date[];
      }>();

      // Processar posts
      posts.forEach(post => {
        const emotion = post.emocao_principal;
        const existing = emotionMap.get(emotion) || {
          count: 0,
          totalIntensity: 0,
          triggers: [],
          strategies: [],
          times: [],
        };

        existing.count++;
        existing.totalIntensity += post.intensidade;
        existing.triggers.push(...(post.gatilhos || []));
        existing.strategies.push(...(post.estrategias_usadas || []));
        existing.times.push(new Date(post.criado_em));

        emotionMap.set(emotion, existing);
      });

      // Converter para insights
      const insights: EmotionInsight[] = Array.from(emotionMap.entries()).map(([emotion, data]) => {
        // Contar triggers mais comuns
        const triggerCounts = data.triggers.reduce((acc, trigger) => {
          acc[trigger] = (acc[trigger] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const commonTriggers = Object.entries(triggerCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([trigger]) => trigger);

        // Contar estratégias mais comuns
        const strategyCounts = data.strategies.reduce((acc, strategy) => {
          acc[strategy] = (acc[strategy] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const commonStrategies = Object.entries(strategyCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([strategy]) => strategy);

        // Padrão de horários
        const hourCounts = data.times.reduce((acc, time) => {
          const hour = time.getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const timePattern = Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour: parseInt(hour), count }))
          .sort((a, b) => a.hour - b.hour);

        // Padrão de dias da semana
        const dayCounts = data.times.reduce((acc, time) => {
          const day = time.getDay();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const weekPattern = Object.entries(dayCounts)
          .map(([day, count]) => ({ day: parseInt(day), count }))
          .sort((a, b) => a.day - b.day);

        return {
          emotion,
          count: data.count,
          averageIntensity: data.totalIntensity / data.count,
          commonTriggers,
          commonStrategies,
          timePattern,
          weekPattern,
        };
      });

      return insights.sort((a, b) => b.count - a.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular insights');
      return [];
    }
  };

  // Obter posts recentes por emoção
  const getPostsByEmotion = async (emotion: string, limit: number = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabaseClient
        .from('emocao_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('emocao_principal', emotion)
        .order('criado_em', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar posts por emoção');
      return [];
    }
  };

  // Buscar posts por texto
  const searchPosts = async (searchTerm: string, limit: number = 20) => {
    if (!user) return [];

    try {
      const { data, error } = await supabaseClient
        .from('emocao_posts')
        .select('*')
        .eq('user_id', user.id)
        .or(`descricao.ilike.%${searchTerm}%,pensamentos.ilike.%${searchTerm}%,contexto.ilike.%${searchTerm}%`)
        .order('criado_em', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar posts');
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadEmotionPosts(20); // Carregar os 20 posts mais recentes
    }
  }, [user]);

  return {
    emotionPosts,
    emotionReactions,
    loading,
    error,
    loadEmotionPosts,
    loadEmotionReactions,
    createEmotionPost,
    updateEmotionPost,
    deleteEmotionPost,
    addReaction,
    removeReaction,
    getEmotionInsights,
    getPostsByEmotion,
    searchPosts,
    clearError: () => setError(null),
  };
}