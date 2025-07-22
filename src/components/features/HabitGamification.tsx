/**
 * Componente para Gamificação de Hábitos
 * Sistema de pontos, medalhas e níveis ao completar tarefas de bem-estar
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Flame, Calendar, Plus, Check, X, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface UserHabit {
  id: string;
  habit_name: string;
  description: string;
  category: string;
  target_frequency: number;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  points_per_completion: number;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  is_active: boolean;
  created_at: string;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string;
  points_earned: number;
}

interface UserGamification {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  badges_earned: string[];
  achievements_unlocked: string[];
  weekly_points: number;
  monthly_points: number;
  longest_streak: number;
  habits_completed_today: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  badge_icon: string;
}

const HabitGamification: React.FC = () => {
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set());
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    habit_name: '',
    description: '',
    category: 'wellness',
    target_frequency: 1,
    frequency_type: 'daily' as 'daily' | 'weekly' | 'monthly',
    points_per_completion: 10
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadBadges();
    loadAchievements();
    loadTodayCompletions();
  }, []);

  /**
   * Carrega dados do usuário
   */
  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;
      setHabits(habitsData || []);

      // Carregar gamificação
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gamificationError && gamificationError.code !== 'PGRST116') {
        throw gamificationError;
      }

      if (gamificationData) {
        setGamification(gamificationData);
      } else {
        // Criar registro inicial de gamificação
        const { data: newGamification, error: createError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            total_points: 0,
            current_level: 1,
            badges_earned: [],
            achievements_unlocked: [],
            weekly_points: 0,
            monthly_points: 0,
            longest_streak: 0,
            habits_completed_today: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setGamification(newGamification);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  /**
   * Carrega badges disponíveis
   */
  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('gamification_badges')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value');

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
    }
  };

  /**
   * Carrega conquistas disponíveis
   */
  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('gamification_achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('requirement_value');

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    }
  };

  /**
   * Carrega completações de hoje
   */
  const loadTodayCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`);

      if (error) throw error;
      
      const completedHabits = new Set(data?.map(c => c.habit_id) || []);
      setTodayCompletions(completedHabits);
    } catch (error) {
      console.error('Erro ao carregar completações:', error);
    }
  };

  /**
   * Adiciona novo hábito
   */
  const addHabit = async () => {
    if (!newHabit.habit_name.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_habits')
        .insert({
          user_id: user.id,
          ...newHabit
        });

      if (error) throw error;
      
      setNewHabit({
        habit_name: '',
        description: '',
        category: 'wellness',
        target_frequency: 1,
        frequency_type: 'daily',
        points_per_completion: 10
      });
      setShowAddHabit(false);
      loadUserData();
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Completa um hábito
   */
  const completeHabit = async (habit: UserHabit) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar completação
      const { error: completionError } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habit.id,
          points_earned: habit.points_per_completion
        });

      if (completionError) throw completionError;

      // Atualizar estatísticas do hábito
      const { error: habitError } = await supabase
        .from('user_habits')
        .update({
          current_streak: habit.current_streak + 1,
          best_streak: Math.max(habit.best_streak, habit.current_streak + 1),
          total_completions: habit.total_completions + 1
        })
        .eq('id', habit.id);

      if (habitError) throw habitError;

      // Atualizar gamificação
      if (gamification) {
        const newTotalPoints = gamification.total_points + habit.points_per_completion;
        const newLevel = Math.floor(newTotalPoints / 100) + 1;
        
        const { error: gamificationError } = await supabase
          .from('user_gamification')
          .update({
            total_points: newTotalPoints,
            current_level: newLevel,
            weekly_points: gamification.weekly_points + habit.points_per_completion,
            monthly_points: gamification.monthly_points + habit.points_per_completion,
            longest_streak: Math.max(gamification.longest_streak, habit.current_streak + 1),
            habits_completed_today: gamification.habits_completed_today + 1
          })
          .eq('user_id', user.id);

        if (gamificationError) throw gamificationError;
      }

      // Verificar novos badges e conquistas
      await checkNewBadgesAndAchievements();
      
      // Recarregar dados
      loadUserData();
      loadTodayCompletions();
      
    } catch (error) {
      console.error('Erro ao completar hábito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desfaz completação de hábito
   */
  const uncompleteHabit = async (habit: UserHabit) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Remover completação de hoje
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habit.id)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`);

      if (deleteError) throw deleteError;

      // Atualizar estatísticas
      const { error: habitError } = await supabase
        .from('user_habits')
        .update({
          current_streak: Math.max(0, habit.current_streak - 1),
          total_completions: Math.max(0, habit.total_completions - 1)
        })
        .eq('id', habit.id);

      if (habitError) throw habitError;

      // Atualizar gamificação
      if (gamification) {
        const { error: gamificationError } = await supabase
          .from('user_gamification')
          .update({
            total_points: Math.max(0, gamification.total_points - habit.points_per_completion),
            weekly_points: Math.max(0, gamification.weekly_points - habit.points_per_completion),
            monthly_points: Math.max(0, gamification.monthly_points - habit.points_per_completion),
            habits_completed_today: Math.max(0, gamification.habits_completed_today - 1)
          })
          .eq('user_id', user.id);

        if (gamificationError) throw gamificationError;
      }

      loadUserData();
      loadTodayCompletions();
      
    } catch (error) {
      console.error('Erro ao desfazer completação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica novos badges e conquistas
   */
  const checkNewBadgesAndAchievements = async () => {
    if (!gamification) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newBadges: string[] = [];
      const newAchievements: string[] = [];

      // Verificar badges
      for (const badge of badges) {
        if (gamification.badges_earned.includes(badge.id)) continue;
        
        let qualifies = false;
        switch (badge.requirement_type) {
          case 'total_points':
            qualifies = gamification.total_points >= badge.requirement_value;
            break;
          case 'streak_days':
            qualifies = gamification.longest_streak >= badge.requirement_value;
            break;
          case 'habits_completed':
            qualifies = gamification.habits_completed_today >= badge.requirement_value;
            break;
        }
        
        if (qualifies) {
          newBadges.push(badge.id);
        }
      }

      // Verificar conquistas
      for (const achievement of achievements) {
        if (gamification.achievements_unlocked.includes(achievement.id)) continue;
        
        let qualifies = false;
        switch (achievement.requirement_type) {
          case 'total_points':
            qualifies = gamification.total_points >= achievement.requirement_value;
            break;
          case 'level':
            qualifies = gamification.current_level >= achievement.requirement_value;
            break;
          case 'weekly_points':
            qualifies = gamification.weekly_points >= achievement.requirement_value;
            break;
        }
        
        if (qualifies) {
          newAchievements.push(achievement.id);
        }
      }

      // Atualizar se houver novos badges ou conquistas
      if (newBadges.length > 0 || newAchievements.length > 0) {
        const { error } = await supabase
          .from('user_gamification')
          .update({
            badges_earned: [...gamification.badges_earned, ...newBadges],
            achievements_unlocked: [...gamification.achievements_unlocked, ...newAchievements]
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao verificar badges/conquistas:', error);
    }
  };

  /**
   * Retorna ícone da categoria
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wellness':
        return <Star className="w-4 h-4" />;
      case 'fitness':
        return <Target className="w-4 h-4" />;
      case 'mindfulness':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  /**
   * Retorna cor da categoria
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wellness':
        return 'bg-green-100 text-green-800';
      case 'fitness':
        return 'bg-blue-100 text-blue-800';
      case 'mindfulness':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header com Estatísticas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
          Gamificação de Hábitos
        </h1>
        
        {gamification && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gamification.total_points}</div>
              <div className="text-sm text-gray-600">Pontos Totais</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{gamification.current_level}</div>
              <div className="text-sm text-gray-600">Nível Atual</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{gamification.longest_streak}</div>
              <div className="text-sm text-gray-600">Maior Sequência</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{gamification.habits_completed_today}</div>
              <div className="text-sm text-gray-600">Hoje</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hábitos */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Meus Hábitos</h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Hábito
            </button>
          </div>

          {/* Formulário de Novo Hábito */}
          {showAddHabit && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Novo Hábito</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Nome do hábito"
                  value={newHabit.habit_name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, habit_name: e.target.value }))}
                  className="border rounded-lg px-3 py-2"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                  className="border rounded-lg px-3 py-2 h-20 resize-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="wellness">Bem-estar</option>
                    <option value="fitness">Fitness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="other">Outro</option>
                  </select>
                  <select
                    value={newHabit.frequency_type}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, frequency_type: e.target.value as any }))}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Frequência alvo"
                    value={newHabit.target_frequency}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, target_frequency: parseInt(e.target.value) || 1 }))}
                    className="border rounded-lg px-3 py-2"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Pontos por completação"
                    value={newHabit.points_per_completion}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, points_per_completion: parseInt(e.target.value) || 10 }))}
                    className="border rounded-lg px-3 py-2"
                    min="1"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={addHabit}
                    disabled={isLoading || !newHabit.habit_name.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Hábitos */}
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompletedToday = todayCompletions.has(habit.id);
              
              return (
                <div key={habit.id} className="bg-white rounded-lg border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold mr-3">{habit.habit_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                          getCategoryColor(habit.category)
                        }`}>
                          {getCategoryIcon(habit.category)}
                          <span className="ml-1 capitalize">{habit.category}</span>
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-gray-600 text-sm mb-2">{habit.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Flame className="w-4 h-4 mr-1 text-orange-500" />
                          {habit.current_streak} dias
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                          {habit.total_completions} completações
                        </span>
                        <span>{habit.points_per_completion} pts</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => isCompletedToday ? uncompleteHabit(habit) : completeHabit(habit)}
                      disabled={isLoading}
                      className={`p-3 rounded-full transition-colors disabled:opacity-50 ${
                        isCompletedToday
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {isCompletedToday ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Barra de Progresso da Sequência */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((habit.current_streak / habit.best_streak) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Melhor sequência: {habit.best_streak} dias
                  </div>
                </div>
              );
            })}
            
            {habits.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhum hábito criado ainda</p>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Criar Primeiro Hábito
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar com Badges e Conquistas */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Badges
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {badges.slice(0, 9).map((badge) => {
                const isEarned = gamification?.badges_earned.includes(badge.id) || false;
                
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg text-center transition-all ${
                      isEarned
                        ? 'bg-yellow-100 border-2 border-yellow-300'
                        : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                    }`}
                    title={badge.description}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conquistas */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              Conquistas
            </h3>
            
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement) => {
                const isUnlocked = gamification?.achievements_unlocked.includes(achievement.id) || false;
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isUnlocked
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-lg mr-3">{achievement.badge_icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                      {isUnlocked && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progresso do Nível */}
          {gamification && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Progresso do Nível</h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">Nível {gamification.current_level}</div>
                <div className="text-sm text-gray-600">
                  {gamification.total_points % 100}/100 pontos para o próximo nível
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(gamification.total_points % 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitGamification;