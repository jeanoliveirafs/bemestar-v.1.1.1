/**
 * Componente para Conteúdo Dinâmico Gerado por IA
 * Além do chat, a IA gera mini exercícios diários ou mensagens motivacionais personalizadas
 * Integra geração de conteúdo ao banco para histórico
 */

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Calendar, Clock, Heart, Target, Zap, RefreshCw, BookOpen, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AIGeneratedContent {
  id: string;
  content_type: 'daily_exercise' | 'motivational_message' | 'wellness_tip' | 'breathing_guide' | 'reflection_prompt';
  title: string;
  content: string;
  personalization_data: any;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  tags: string[];
  is_completed: boolean;
  completion_rating: number | null;
  completion_notes: string | null;
  created_at: string;
  expires_at: string | null;
}

interface ContentPersonalization {
  user_mood_pattern: string;
  preferred_content_types: string[];
  completion_history: any;
  current_goals: string[];
  stress_level: number;
  energy_level: number;
}

interface ContentCompletion {
  id: string;
  content_id: string;
  completed_at: string;
  rating: number;
  notes: string;
  mood_before: number;
  mood_after: number;
}

const AIContent: React.FC = () => {
  const [todayContent, setTodayContent] = useState<AIGeneratedContent[]>([]);
  const [contentHistory, setContentHistory] = useState<AIGeneratedContent[]>([]);
  const [personalization, setPersonalization] = useState<ContentPersonalization | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [completionModal, setCompletionModal] = useState<AIGeneratedContent | null>(null);
  const [completionRating, setCompletionRating] = useState(5);
  const [completionNotes, setCompletionNotes] = useState('');
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const contentTypes = {
    daily_exercise: {
      name: 'Exercício Diário',
      icon: Target,
      color: 'bg-blue-100 text-blue-800',
      description: 'Atividades práticas para seu bem-estar'
    },
    motivational_message: {
      name: 'Mensagem Motivacional',
      icon: Heart,
      color: 'bg-pink-100 text-pink-800',
      description: 'Inspiração personalizada para seu dia'
    },
    wellness_tip: {
      name: 'Dica de Bem-estar',
      icon: Sparkles,
      color: 'bg-green-100 text-green-800',
      description: 'Conselhos práticos para uma vida mais saudável'
    },
    breathing_guide: {
      name: 'Guia de Respiração',
      icon: Zap,
      color: 'bg-purple-100 text-purple-800',
      description: 'Exercícios de respiração guiados'
    },
    reflection_prompt: {
      name: 'Reflexão Guiada',
      icon: BookOpen,
      color: 'bg-orange-100 text-orange-800',
      description: 'Perguntas para autoconhecimento'
    }
  };

  const difficultyLevels = {
    beginner: { name: 'Iniciante', color: 'bg-green-100 text-green-800' },
    intermediate: { name: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' },
    advanced: { name: 'Avançado', color: 'bg-red-100 text-red-800' }
  };

  useEffect(() => {
    loadTodayContent();
    loadPersonalization();
    loadContentHistory();
  }, []);

  /**
   * Carrega conteúdo do dia atual
   */
  const loadTodayContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ai_generated_content')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodayContent(data || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo de hoje:', error);
    }
  };

  /**
   * Carrega histórico de conteúdo
   */
  const loadContentHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_generated_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setContentHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  /**
   * Carrega dados de personalização
   */
  const loadPersonalization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar dados de humor recentes
      const { data: moodData } = await supabase
        .from('daily_mood_logs')
        .select('mood_score, energy_level, stress_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      // Buscar histórico de completações
      const { data: completionData } = await supabase
        .from('ai_content_completions')
        .select('content_type, rating')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      // Calcular personalização
      const avgMood = moodData?.reduce((sum, log) => sum + log.mood_score, 0) / (moodData?.length || 1) || 3;
      const avgEnergy = moodData?.reduce((sum, log) => sum + log.energy_level, 0) / (moodData?.length || 1) || 3;
      const avgStress = moodData?.reduce((sum, log) => sum + log.stress_level, 0) / (moodData?.length || 1) || 3;
      
      const preferredTypes = completionData
        ?.filter(c => c.rating >= 4)
        .map(c => c.content_type) || [];

      setPersonalization({
        user_mood_pattern: avgMood < 3 ? 'low' : avgMood > 4 ? 'high' : 'moderate',
        preferred_content_types: [...new Set(preferredTypes)],
        completion_history: completionData,
        current_goals: [], // Pode ser expandido
        stress_level: avgStress,
        energy_level: avgEnergy
      });
    } catch (error) {
      console.error('Erro ao carregar personalização:', error);
    }
  };

  /**
   * Gera novo conteúdo personalizado
   */
  const generatePersonalizedContent = async (contentType?: string) => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simular chamada para API de IA (n8n webhook)
      const aiResponse = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL + '/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          personalization_data: personalization,
          requested_type: contentType,
          context: {
            time_of_day: new Date().getHours(),
            day_of_week: new Date().getDay(),
            recent_mood: personalization?.user_mood_pattern
          }
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Erro na geração de conteúdo');
      }

      const aiContent = await aiResponse.json();

      // Salvar conteúdo gerado no banco
      const { error } = await supabase
        .from('ai_generated_content')
        .insert({
          user_id: user.id,
          content_type: aiContent.content_type,
          title: aiContent.title,
          content: aiContent.content,
          personalization_data: personalization,
          difficulty_level: aiContent.difficulty_level || 'beginner',
          estimated_duration_minutes: aiContent.estimated_duration_minutes || 5,
          tags: aiContent.tags || [],
          expires_at: aiContent.expires_at
        });

      if (error) throw error;

      loadTodayContent();
      loadContentHistory();
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      
      // Fallback: gerar conteúdo local
      await generateFallbackContent(contentType);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Gera conteúdo de fallback quando a IA não está disponível
   */
  const generateFallbackContent = async (contentType?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fallbackContent = {
        daily_exercise: {
          title: 'Exercício de Gratidão',
          content: 'Liste 3 coisas pelas quais você é grato hoje. Reflita sobre como cada uma delas impacta positivamente sua vida.',
          difficulty_level: 'beginner',
          estimated_duration_minutes: 5,
          tags: ['gratidão', 'reflexão', 'positividade']
        },
        motivational_message: {
          title: 'Mensagem do Dia',
          content: 'Cada pequeno passo que você dá em direção ao seu bem-estar é uma vitória. Celebre seu progresso, por menor que pareça.',
          difficulty_level: 'beginner',
          estimated_duration_minutes: 2,
          tags: ['motivação', 'autoestima', 'progresso']
        },
        wellness_tip: {
          title: 'Dica de Hidratação',
          content: 'Beba um copo de água agora e configure lembretes para beber água a cada 2 horas. A hidratação adequada melhora o humor e a concentração.',
          difficulty_level: 'beginner',
          estimated_duration_minutes: 1,
          tags: ['hidratação', 'saúde', 'hábitos']
        },
        breathing_guide: {
          title: 'Respiração 4-7-8',
          content: 'Inspire por 4 segundos, segure por 7 segundos, expire por 8 segundos. Repita 4 vezes. Este exercício ajuda a reduzir a ansiedade.',
          difficulty_level: 'beginner',
          estimated_duration_minutes: 3,
          tags: ['respiração', 'ansiedade', 'relaxamento']
        },
        reflection_prompt: {
          title: 'Reflexão sobre Emoções',
          content: 'Como você está se sentindo neste momento? Que emoção está mais presente? O que essa emoção está tentando te comunicar?',
          difficulty_level: 'intermediate',
          estimated_duration_minutes: 10,
          tags: ['autoconhecimento', 'emoções', 'reflexão']
        }
      };

      const selectedType = contentType || Object.keys(fallbackContent)[Math.floor(Math.random() * Object.keys(fallbackContent).length)];
      const content = fallbackContent[selectedType as keyof typeof fallbackContent];

      const { error } = await supabase
        .from('ai_generated_content')
        .insert({
          user_id: user.id,
          content_type: selectedType,
          title: content.title,
          content: content.content,
          personalization_data: personalization,
          difficulty_level: content.difficulty_level,
          estimated_duration_minutes: content.estimated_duration_minutes,
          tags: content.tags
        });

      if (error) throw error;

      loadTodayContent();
    } catch (error) {
      console.error('Erro ao gerar conteúdo de fallback:', error);
    }
  };

  /**
   * Marca conteúdo como concluído
   */
  const completeContent = async () => {
    if (!completionModal) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar completação
      const { error: completionError } = await supabase
        .from('ai_content_completions')
        .insert({
          user_id: user.id,
          content_id: completionModal.id,
          content_type: completionModal.content_type,
          rating: completionRating,
          notes: completionNotes.trim(),
          mood_before: moodBefore,
          mood_after: moodAfter
        });

      if (completionError) throw completionError;

      // Atualizar conteúdo
      const { error: updateError } = await supabase
        .from('ai_generated_content')
        .update({
          is_completed: true,
          completion_rating: completionRating,
          completion_notes: completionNotes.trim()
        })
        .eq('id', completionModal.id);

      if (updateError) throw updateError;

      // Atualizar gamificação
      await updateGamification(completionModal);

      setCompletionModal(null);
      setCompletionRating(5);
      setCompletionNotes('');
      setMoodBefore(3);
      setMoodAfter(3);
      
      loadTodayContent();
      loadContentHistory();
      loadPersonalization();
    } catch (error) {
      console.error('Erro ao completar conteúdo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza gamificação baseada na completação
   */
  const updateGamification = async (content: AIGeneratedContent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const points = {
        daily_exercise: 15,
        motivational_message: 5,
        wellness_tip: 10,
        breathing_guide: 20,
        reflection_prompt: 25
      };

      const earnedPoints = points[content.content_type] || 10;

      // Atualizar pontos do usuário
      const { data: gamificationData } = await supabase
        .from('user_gamification')
        .select('total_points, level')
        .eq('user_id', user.id)
        .single();

      const newTotalPoints = (gamificationData?.total_points || 0) + earnedPoints;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          total_points: newTotalPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao atualizar gamificação:', error);
    }
  };

  /**
   * Filtra conteúdo por tipo
   */
  const getFilteredContent = (content: AIGeneratedContent[]) => {
    if (selectedContentType === 'all') return content;
    return content.filter(item => item.content_type === selectedContentType);
  };

  /**
   * Formata duração
   */
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  /**
   * Renderiza estrelas de avaliação
   */
  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-purple-600" />
          Conteúdo Personalizado IA
        </h1>
        <p className="text-gray-600">
          Exercícios e mensagens personalizadas geradas especialmente para você.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Controles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Gerar Conteúdo</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => generatePersonalizedContent()}
                disabled={isGenerating}
                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar Automático'}
              </button>
              
              <div className="text-xs text-gray-500 text-center">
                ou escolha um tipo específico:
              </div>
              
              {Object.entries(contentTypes).map(([key, type]) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={key}
                    onClick={() => generatePersonalizedContent(key)}
                    disabled={isGenerating}
                    className="w-full p-2 text-left rounded-lg border hover:bg-gray-50 disabled:opacity-50 flex items-center"
                  >
                    <IconComponent className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            
            <div className="space-y-3">
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(contentTypes).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHistory(false)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                    !showHistory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                    showHistory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Histórico
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3">
          {/* Estatísticas */}
          {personalization && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Seu Progresso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {contentHistory.filter(c => c.is_completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Conteúdos Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(personalization.energy_level * 20)}%
                  </div>
                  <div className="text-sm text-gray-600">Nível de Energia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {personalization.preferred_content_types.length}
                  </div>
                  <div className="text-sm text-gray-600">Tipos Preferidos</div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Conteúdo */}
          <div className="space-y-4">
            {getFilteredContent(showHistory ? contentHistory : todayContent).map((content) => {
              const contentType = contentTypes[content.content_type];
              const IconComponent = contentType.icon;
              const difficulty = difficultyLevels[content.difficulty_level];
              
              return (
                <div
                  key={content.id}
                  className={`bg-white rounded-lg border p-6 transition-all ${
                    content.is_completed ? 'opacity-75 border-green-200' : 'hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <IconComponent className="w-6 h-6 mr-3 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-lg">{content.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${contentType.color}`}>
                            {contentType.name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${difficulty.color}`}>
                            {difficulty.name}
                          </span>
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(content.estimated_duration_minutes)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(content.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {content.is_completed && (
                        <div className="flex items-center mt-1">
                          {renderStars(content.completion_rating || 0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{content.content}</p>
                  </div>
                  
                  {/* Tags */}
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Ações */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {contentType.description}
                    </div>
                    
                    {!content.is_completed ? (
                      <button
                        onClick={() => setCompletionModal(content)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Concluir
                      </button>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <Target className="w-4 h-4 mr-2" />
                        Concluído
                      </div>
                    )}
                  </div>
                  
                  {/* Notas de Conclusão */}
                  {content.is_completed && content.completion_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Suas anotações:</div>
                      <div className="text-sm text-gray-600">{content.completion_notes}</div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {getFilteredContent(showHistory ? contentHistory : todayContent).length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {showHistory ? 'Nenhum conteúdo no histórico' : 'Nenhum conteúdo gerado hoje'}
                </p>
                <button
                  onClick={() => generatePersonalizedContent()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Gerar Primeiro Conteúdo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Conclusão */}
      {completionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Concluir Atividade</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como foi sua experiência?
                </label>
                {renderStars(completionRating, true, setCompletionRating)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humor antes (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodBefore}
                    onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{moodBefore}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humor depois (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodAfter}
                    onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{moodAfter}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anotações (opcional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Como se sentiu? O que aprendeu?"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setCompletionModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={completeContent}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Concluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContent;