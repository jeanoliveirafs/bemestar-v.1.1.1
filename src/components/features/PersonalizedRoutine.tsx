/**
 * Componente para Rotina Personalizada com Lembretes Inteligentes
 * Usuário define hábitos e recebe lembretes baseados em horários ou contexto
 */

import React, { useState, useEffect } from 'react';
import { Clock, Bell, BellOff, Calendar, Plus, Edit, Trash2, Brain, Zap, Moon, Sun } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface RoutineItem {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'exercise' | 'journaling' | 'reading' | 'other';
  scheduled_time: string;
  duration_minutes: number;
  days_of_week: number[]; // 0-6 (domingo-sábado)
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  ai_suggestions_enabled: boolean;
  completion_streak: number;
  last_completed: string | null;
  created_at: string;
}

interface SmartReminder {
  id: string;
  routine_item_id: string;
  reminder_type: 'time_based' | 'context_based' | 'ai_suggested';
  trigger_condition: string;
  message: string;
  is_active: boolean;
  created_by_ai: boolean;
}

interface RoutineCompletion {
  id: string;
  routine_item_id: string;
  completed_at: string;
  mood_before: number;
  mood_after: number;
  notes: string;
}

const PersonalizedRoutine: React.FC = () => {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set());
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'meditation' as const,
    scheduled_time: '09:00',
    duration_minutes: 15,
    days_of_week: [1, 2, 3, 4, 5], // Segunda a sexta por padrão
    reminder_enabled: true,
    reminder_minutes_before: 10,
    ai_suggestions_enabled: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const categories = {
    meditation: { name: 'Meditação', icon: Brain, color: 'purple' },
    exercise: { name: 'Exercício', icon: Zap, color: 'green' },
    journaling: { name: 'Diário', icon: Edit, color: 'blue' },
    reading: { name: 'Leitura', icon: Moon, color: 'indigo' },
    other: { name: 'Outro', icon: Sun, color: 'gray' }
  };

  useEffect(() => {
    loadRoutineItems();
    loadSmartReminders();
    loadTodayCompletions();
    
    // Atualizar hora atual a cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Carrega itens da rotina do usuário
   */
  const loadRoutineItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('routine_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('scheduled_time');

      if (error) throw error;
      setRoutineItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar rotina:', error);
    }
  };

  /**
   * Carrega lembretes inteligentes
   */
  const loadSmartReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('smart_reminders')
        .select(`
          *,
          routine_items!inner(user_id)
        `)
        .eq('routine_items.user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setSmartReminders(data || []);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
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
        .from('routine_completions')
        .select('routine_item_id')
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`);

      if (error) throw error;
      
      const completedItems = new Set(data?.map(c => c.routine_item_id) || []);
      setTodayCompletions(completedItems);
    } catch (error) {
      console.error('Erro ao carregar completações:', error);
    }
  };

  /**
   * Adiciona novo item à rotina
   */
  const addRoutineItem = async () => {
    if (!newItem.title.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('routine_items')
        .insert({
          user_id: user.id,
          ...newItem
        });

      if (error) throw error;
      
      // Criar lembretes automáticos se habilitado
      if (newItem.ai_suggestions_enabled) {
        await createAIReminders(newItem);
      }
      
      resetForm();
      loadRoutineItems();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza item da rotina
   */
  const updateRoutineItem = async () => {
    if (!editingItem || !newItem.title.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('routine_items')
        .update(newItem)
        .eq('id', editingItem.id);

      if (error) throw error;
      
      resetForm();
      loadRoutineItems();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove item da rotina
   */
  const deleteRoutineItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('routine_items')
        .update({ is_active: false })
        .eq('id', itemId);

      if (error) throw error;
      loadRoutineItems();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  /**
   * Completa item da rotina
   */
  const completeRoutineItem = async (item: RoutineItem, moodBefore: number, moodAfter: number, notes: string = '') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar completação
      const { error: completionError } = await supabase
        .from('routine_completions')
        .insert({
          user_id: user.id,
          routine_item_id: item.id,
          mood_before: moodBefore,
          mood_after: moodAfter,
          notes
        });

      if (completionError) throw completionError;

      // Atualizar streak
      const { error: updateError } = await supabase
        .from('routine_items')
        .update({
          completion_streak: item.completion_streak + 1,
          last_completed: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Gerar sugestões de IA baseadas no humor
      if (item.ai_suggestions_enabled) {
        await generateAISuggestions(item, moodBefore, moodAfter);
      }

      loadRoutineItems();
      loadTodayCompletions();
    } catch (error) {
      console.error('Erro ao completar item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria lembretes de IA para um item
   */
  const createAIReminders = async (item: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Lembrete baseado em contexto
      const contextReminder = {
        user_id: user.id,
        routine_item_id: item.id,
        reminder_type: 'context_based',
        trigger_condition: `mood_low_${item.category}`,
        message: `Que tal fazer ${item.title}? Pode ajudar a melhorar seu humor.`,
        is_active: true,
        created_by_ai: true
      };

      await supabase.from('smart_reminders').insert(contextReminder);
    } catch (error) {
      console.error('Erro ao criar lembretes de IA:', error);
    }
  };

  /**
   * Gera sugestões de IA baseadas no humor
   */
  const generateAISuggestions = async (item: RoutineItem, moodBefore: number, moodAfter: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const moodImprovement = moodAfter - moodBefore;
      
      if (moodImprovement > 0) {
        // Criar lembrete positivo
        const suggestion = {
          user_id: user.id,
          routine_item_id: item.id,
          reminder_type: 'ai_suggested',
          trigger_condition: 'mood_improvement_detected',
          message: `${item.title} tem te ajudado! Continue assim! 🌟`,
          is_active: true,
          created_by_ai: true
        };

        await supabase.from('smart_reminders').insert(suggestion);
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    }
  };

  /**
   * Reseta formulário
   */
  const resetForm = () => {
    setNewItem({
      title: '',
      description: '',
      category: 'meditation',
      scheduled_time: '09:00',
      duration_minutes: 15,
      days_of_week: [1, 2, 3, 4, 5],
      reminder_enabled: true,
      reminder_minutes_before: 10,
      ai_suggestions_enabled: true
    });
    setShowAddItem(false);
    setEditingItem(null);
  };

  /**
   * Inicia edição de item
   */
  const startEditing = (item: RoutineItem) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description,
      category: item.category,
      scheduled_time: item.scheduled_time,
      duration_minutes: item.duration_minutes,
      days_of_week: item.days_of_week,
      reminder_enabled: item.reminder_enabled,
      reminder_minutes_before: item.reminder_minutes_before,
      ai_suggestions_enabled: item.ai_suggestions_enabled
    });
    setShowAddItem(true);
  };

  /**
   * Verifica se item está agendado para hoje
   */
  const isScheduledToday = (item: RoutineItem) => {
    const today = new Date().getDay();
    return item.days_of_week.includes(today);
  };

  /**
   * Verifica se é hora do lembrete
   */
  const isReminderTime = (item: RoutineItem) => {
    if (!item.reminder_enabled || !isScheduledToday(item)) return false;
    
    const [hours, minutes] = item.scheduled_time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes - item.reminder_minutes_before, 0, 0);
    
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
    
    return timeDiff < 60000; // Dentro de 1 minuto
  };

  /**
   * Filtra itens por dia selecionado
   */
  const getItemsForDay = (day: number) => {
    return routineItems.filter(item => item.days_of_week.includes(day));
  };

  /**
   * Retorna cor da categoria
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      meditation: 'bg-purple-100 text-purple-800 border-purple-200',
      exercise: 'bg-green-100 text-green-800 border-green-200',
      journaling: 'bg-blue-100 text-blue-800 border-blue-200',
      reading: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Clock className="w-8 h-8 mr-3 text-blue-600" />
          Rotina Personalizada
        </h1>
        <p className="text-gray-600">
          Crie sua rotina de bem-estar com lembretes inteligentes baseados em IA.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Seletor de Dias */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Dias da Semana</h3>
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => {
                const itemCount = getItemsForDay(index).length;
                const isToday = index === new Date().getDay();
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedDay === index
                        ? 'bg-blue-600 text-white'
                        : isToday
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{day}</span>
                      {itemCount > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedDay === index
                            ? 'bg-white text-blue-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {itemCount}
                        </span>
                      )}
                    </div>
                    {isToday && (
                      <div className="text-xs mt-1 opacity-75">Hoje</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão Adicionar */}
          <button
            onClick={() => setShowAddItem(true)}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3">
          {/* Formulário de Adicionar/Editar */}
          {showAddItem && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título da atividade"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className="border rounded-lg px-3 py-2"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as any }))}
                    className="border rounded-lg px-3 py-2"
                  >
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <textarea
                  placeholder="Descrição (opcional)"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="border rounded-lg px-3 py-2 h-20 resize-none"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="time"
                    value={newItem.scheduled_time}
                    onChange={(e) => setNewItem(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Duração (min)"
                    value={newItem.duration_minutes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 15 }))}
                    className="border rounded-lg px-3 py-2"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Lembrete (min antes)"
                    value={newItem.reminder_minutes_before}
                    onChange={(e) => setNewItem(prev => ({ ...prev, reminder_minutes_before: parseInt(e.target.value) || 10 }))}
                    className="border rounded-lg px-3 py-2"
                    min="0"
                  />
                </div>
                
                {/* Dias da Semana */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias da Semana
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const newDays = newItem.days_of_week.includes(index)
                            ? newItem.days_of_week.filter(d => d !== index)
                            : [...newItem.days_of_week, index];
                          setNewItem(prev => ({ ...prev, days_of_week: newDays }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          newItem.days_of_week.includes(index)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Opções */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.reminder_enabled}
                      onChange={(e) => setNewItem(prev => ({ ...prev, reminder_enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Ativar lembretes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.ai_suggestions_enabled}
                      onChange={(e) => setNewItem(prev => ({ ...prev, ai_suggestions_enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Sugestões de IA</span>
                  </label>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={editingItem ? updateRoutineItem : addRoutineItem}
                    disabled={isLoading || !newItem.title.trim()}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Atividades do Dia */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Atividades - {daysOfWeek[selectedDay]}
                {selectedDay === new Date().getDay() && (
                  <span className="ml-2 text-sm text-blue-600">(Hoje)</span>
                )}
              </h3>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="space-y-4">
              {getItemsForDay(selectedDay).map((item) => {
                const isCompleted = todayCompletions.has(item.id);
                const isReminder = isReminderTime(item);
                const category = categories[item.category];
                const IconComponent = category.icon;
                
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isReminder ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                    } ${
                      isCompleted ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <IconComponent className="w-5 h-5 mr-2 text-gray-600" />
                          <h4 className="font-semibold">{item.title}</h4>
                          {isReminder && (
                            <Bell className="w-4 h-4 ml-2 text-yellow-600" />
                          )}
                          {isCompleted && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Concluído
                            </span>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {item.scheduled_time} ({item.duration_minutes}min)
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                            {category.name}
                          </span>
                          {item.completion_streak > 0 && (
                            <span className="flex items-center text-orange-600">
                              🔥 {item.completion_streak}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.reminder_enabled && (
                          <Bell className="w-4 h-4 text-blue-600" />
                        )}
                        {item.ai_suggestions_enabled && (
                          <Brain className="w-4 h-4 text-purple-600" />
                        )}
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRoutineItem(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {selectedDay === new Date().getDay() && !isCompleted && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => completeRoutineItem(item, 3, 4)} // Valores padrão de humor
                          disabled={isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Marcar como Concluído
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {getItemsForDay(selectedDay).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Nenhuma atividade agendada para {daysOfWeek[selectedDay].toLowerCase()}
                  </p>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Adicionar Atividade
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRoutine;