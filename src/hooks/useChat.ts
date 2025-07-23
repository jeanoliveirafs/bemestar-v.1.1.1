import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { chatgptService } from '../services/chatgptService';

export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_type: 'general' | 'crisis' | 'habits' | 'emotions' | 'routines' | 'mindfulness';
  user_message: string;
  ai_response: string;
  context?: any; // JSON com contexto adicional
  is_helpful?: boolean;
  feedback?: string;
  created_at: string;
}

export interface AIContentCache {
  id: string;
  content_type: 'tip' | 'exercise' | 'meditation' | 'reflection' | 'motivation';
  category: string;
  title: string;
  content: string;
  tags?: string[];
  usage_context?: any;
  popularity: number;
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  userProfile?: any;
  recentEmotions?: any[];
  activeHabits?: any[];
  currentRoutines?: any[];
  timeOfDay?: 'manha' | 'tarde' | 'noite' | 'madrugada';
  dayOfWeek?: number;
  lastInteraction?: string;
}

export function useChat() {
  const { user, userProfile } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiContentCache, setAiContentCache] = useState<AIContentCache[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Carregar histórico de chat
  const loadChatHistory = async (tipoConversa?: string, limit: number = 50) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (tipoConversa) {
        query = query.eq('conversation_type', tipoConversa);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setChatHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  // Carregar cache de conteúdo IA
  const loadAIContentCache = async (tipoConteudo?: string, categoria?: string) => {
    try {
      let query = supabase
        .from('ai_content_cache')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(100);

      if (tipoConteudo) {
        query = query.eq('content_type', tipoConteudo);
      }
      if (categoria) {
        query = query.eq('category', categoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setAiContentCache(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cache de conteúdo');
    }
  };

  // Construir contexto para IA
  const buildChatContext = async (): Promise<ChatContext> => {
    if (!user) return {};

    try {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      let timeOfDay: 'manha' | 'tarde' | 'noite' | 'madrugada';
      if (hour >= 6 && hour < 12) timeOfDay = 'manha';
      else if (hour >= 12 && hour < 18) timeOfDay = 'tarde';
      else if (hour >= 18 && hour < 24) timeOfDay = 'noite';
      else timeOfDay = 'madrugada';

      // Buscar emoções recentes (últimos 7 dias)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentEmotions } = await supabase
        .from('emotion_posts')
        .select('emotion_category, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar hábitos ativos
      const { data: activeHabits } = await supabase
        .from('user_habits')
        .select('name, category, frequency_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(10);

      // Buscar routines para hoje
      const { data: currentRoutines } = await supabase
        .from('user_routines')
        .select('name, category, estimated_duration')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .contains('days_of_week', [dayOfWeek])
        .limit(5);

      // Última interação
      const { data: lastChat } = await supabase
        .from('chat_history')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        userProfile,
        recentEmotions: recentEmotions || [],
        activeHabits: activeHabits || [],
        currentRoutines: currentRoutines || [],
        timeOfDay,
        dayOfWeek,
        lastInteraction: lastChat?.created_at,
      };
    } catch (err) {
      console.error('Erro ao construir contexto:', err);
      return {};
    }
  };

  // Enviar mensagem para IA
  const sendMessage = async (
    mensagem: string, 
    tipoConversa: ChatMessage['conversation_type'] = 'general',
    contextoAdicional?: any
  ): Promise<ChatMessage | null> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setIsTyping(true);
      setError(null);

      // Construir contexto
      const context = await buildChatContext();
      const fullContext = { ...context, ...contextoAdicional };

      // Buscar conteúdo relevante do cache
      const relevantContent = await findRelevantContent(mensagem, tipoConversa);

      // Enviar para IA
      const resposta = await chatgptService.sendMessage(
        mensagem,
        tipoConversa,
        fullContext,
        relevantContent
      );

      // Salvar no histórico
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          conversation_type: tipoConversa,
          user_message: mensagem,
          ai_response: resposta,
          context: fullContext,
        })
        .select()
        .single();

      if (error) throw error;

      setChatHistory(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
      return null;
    } finally {
      setIsTyping(false);
    }
  };

  // Buscar conteúdo relevante no cache
  const findRelevantContent = async (
    mensagem: string, 
    tipoConversa: string
  ): Promise<AIContentCache[]> => {
    try {
      // Buscar por palavras-chave na mensagem
      const keywords = mensagem.toLowerCase().split(' ').filter(word => word.length > 3);
      
      if (keywords.length === 0) return [];

      const { data, error } = await supabase
        .from('ai_content_cache')
        .select('*')
        .or(`category.ilike.%${tipoConversa}%,tags.cs.{${keywords.join(',')}}`)  
        .order('popularity', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar conteúdo relevante:', err);
      return [];
    }
  };

  // Avaliar resposta da IA
  const rateResponse = async (chatId: string, util: boolean, feedback?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .update({
          is_helpful: util,
          feedback: feedback,
        })
        .eq('id', chatId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? data : chat
      ));
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avaliar resposta');
      throw err;
    }
  };

  // Adicionar conteúdo ao cache
  const addToCache = async (contentData: Omit<AIContentCache, 'id' | 'popularity' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ai_content_cache')
        .insert({
          ...contentData,
          popularity: 1,
        })
        .select()
        .single();

      if (error) throw error;
      
      setAiContentCache(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ao cache');
      throw err;
    }
  };

  // Incrementar popularidade do conteúdo
  const incrementPopularity = async (contentId: string) => {
    try {
      const { error } = await supabase
        .rpc('increment_popularity', { content_id: contentId });

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao incrementar popularidade:', err);
    }
  };

  // Obter sugestões de conversa
  const getConversationSuggestions = async (tipoConversa: string): Promise<string[]> => {
    try {
      const context = await buildChatContext();
      
      const suggestions: Record<string, string[]> = {
        general: [
          'Como posso melhorar meu bem-estar hoje?',
          'Preciso de motivação para continuar',
          'Como lidar com o estresse do dia a dia?',
        ],
        crisis: [
          'Estou me sentindo muito ansioso',
          'Preciso de ajuda para me acalmar',
          'Como posso lidar com pensamentos negativos?',
        ],
        habits: [
          'Como criar um novo hábito saudável?',
          'Estou tendo dificuldade para manter meus hábitos',
          'Quais hábitos são mais importantes para o bem-estar?',
        ],
        emotions: [
          'Como identificar melhor minhas emoções?',
          'Estou confuso sobre o que estou sentindo',
          'Como processar emoções difíceis?',
        ],
        routines: [
          'Como criar uma rotina matinal eficaz?',
          'Preciso de ajuda para organizar meu dia',
          'Como manter consistência nas minhas routines?',
        ],
        mindfulness: [
          'Como começar a meditar?',
          'Preciso de um exercício de respiração',
          'Como praticar mindfulness no trabalho?',
        ],
      };

      return suggestions[tipoConversa] || suggestions.general;
    } catch (err) {
      console.error('Erro ao obter sugestões:', err);
      return [];
    }
  };

  // Limpar histórico
  const clearChatHistory = async (tipoConversa?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      let query = supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (tipoConversa) {
        query = query.eq('conversation_type', tipoConversa);
      }

      const { error } = await query;
      if (error) throw error;

      if (tipoConversa) {
        setChatHistory(prev => prev.filter(chat => chat.conversation_type !== tipoConversa));
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar histórico');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      loadChatHistory();
      loadAIContentCache();
    }
  }, [user]);

  return {
    chatHistory,
    aiContentCache,
    loading,
    error,
    isTyping,
    loadChatHistory,
    loadAIContentCache,
    sendMessage,
    rateResponse,
    addToCache,
    incrementPopularity,
    getConversationSuggestions,
    clearChatHistory,
    clearError: () => setError(null),
  };
}