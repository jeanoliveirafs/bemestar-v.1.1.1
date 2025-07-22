/**
 * Componente para Relatórios Visuais de Progresso
 * Gráficos semanais e mensais de humor, sono, hábitos e metas
 * Dados vêm das tabelas existentes e das novas funções
 */

import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Calendar, Download, Filter, Eye, Target, Heart, Zap, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface MoodData {
  date: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  sleep_hours: number;
  notes: string;
}

interface HabitData {
  date: string;
  habit_name: string;
  completed: boolean;
  category: string;
}

interface ScaleData {
  date: string;
  scale_name: string;
  score: number;
  risk_level: string;
}

interface ProgressSummary {
  period: string;
  avg_mood: number;
  avg_energy: number;
  avg_stress: number;
  avg_sleep: number;
  habits_completion_rate: number;
  total_habits_completed: number;
  scale_improvements: number;
  ai_content_completed: number;
}

const ProgressReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['mood', 'energy', 'habits']);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [habitData, setHabitData] = useState<HabitData[]>([]);
  const [scaleData, setScaleData] = useState<ScaleData[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');
  const [showComparison, setShowComparison] = useState(false);

  const metrics = {
    mood: { name: 'Humor', icon: Heart, color: '#ef4444', bgColor: 'bg-red-100' },
    energy: { name: 'Energia', icon: Zap, color: '#f59e0b', bgColor: 'bg-yellow-100' },
    stress: { name: 'Estresse', icon: TrendingUp, color: '#8b5cf6', bgColor: 'bg-purple-100' },
    sleep: { name: 'Sono', icon: Moon, color: '#3b82f6', bgColor: 'bg-blue-100' },
    habits: { name: 'Hábitos', icon: Target, color: '#10b981', bgColor: 'bg-green-100' }
  };

  const timeRanges = {
    week: { name: 'Última Semana', days: 7 },
    month: { name: 'Último Mês', days: 30 },
    quarter: { name: 'Últimos 3 Meses', days: 90 }
  };

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  /**
   * Carrega todos os dados de progresso
   */
  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMoodData(),
        loadHabitData(),
        loadScaleData(),
        calculateProgressSummary()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de progresso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carrega dados de humor
   */
  const loadMoodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRanges[timeRange].days);

      const { data, error } = await supabase
        .from('daily_mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        date: item.created_at.split('T')[0],
        mood_score: item.mood_score,
        energy_level: item.energy_level,
        stress_level: item.stress_level,
        sleep_hours: item.sleep_hours || 0,
        notes: item.notes || ''
      })) || [];

      setMoodData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados de humor:', error);
    }
  };

  /**
   * Carrega dados de hábitos
   */
  const loadHabitData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRanges[timeRange].days);

      const { data, error } = await supabase
        .from('habit_completions')
        .select(`
          *,
          user_habits!inner(title, category)
        `)
        .eq('user_habits.user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        date: item.completed_at.split('T')[0],
        habit_name: item.user_habits.title,
        completed: true,
        category: item.user_habits.category
      })) || [];

      setHabitData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados de hábitos:', error);
    }
  };

  /**
   * Carrega dados de escalas psicológicas
   */
  const loadScaleData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRanges[timeRange].days);

      const { data, error } = await supabase
        .from('user_scale_responses')
        .select(`
          *,
          psychological_scales!inner(name)
        `)
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        date: item.completed_at.split('T')[0],
        scale_name: item.psychological_scales.name,
        score: item.total_score,
        risk_level: item.risk_level
      })) || [];

      setScaleData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados de escalas:', error);
    }
  };

  /**
   * Calcula resumo de progresso
   */
  const calculateProgressSummary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRanges[timeRange].days);

      // Calcular médias de humor
      const { data: moodAvg } = await supabase
        .from('daily_mood_logs')
        .select('mood_score, energy_level, stress_level, sleep_hours')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Calcular taxa de completação de hábitos
      const { data: habitCompletions } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString());

      const { data: totalHabits } = await supabase
        .from('user_habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Calcular conteúdo IA completado
      const { data: aiContent } = await supabase
        .from('ai_content_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString());

      const avgMood = moodAvg?.reduce((sum, item) => sum + item.mood_score, 0) / (moodAvg?.length || 1) || 0;
      const avgEnergy = moodAvg?.reduce((sum, item) => sum + item.energy_level, 0) / (moodAvg?.length || 1) || 0;
      const avgStress = moodAvg?.reduce((sum, item) => sum + item.stress_level, 0) / (moodAvg?.length || 1) || 0;
      const avgSleep = moodAvg?.reduce((sum, item) => sum + (item.sleep_hours || 0), 0) / (moodAvg?.length || 1) || 0;

      const totalHabitsCount = totalHabits?.length || 1;
      const expectedCompletions = totalHabitsCount * timeRanges[timeRange].days;
      const actualCompletions = habitCompletions?.length || 0;
      const completionRate = (actualCompletions / expectedCompletions) * 100;

      setProgressSummary({
        period: timeRanges[timeRange].name,
        avg_mood: Math.round(avgMood * 10) / 10,
        avg_energy: Math.round(avgEnergy * 10) / 10,
        avg_stress: Math.round(avgStress * 10) / 10,
        avg_sleep: Math.round(avgSleep * 10) / 10,
        habits_completion_rate: Math.round(completionRate),
        total_habits_completed: actualCompletions,
        scale_improvements: 0, // Pode ser calculado comparando escalas
        ai_content_completed: aiContent?.length || 0
      });
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
    }
  };

  /**
   * Gera dados para gráfico de linha
   */
  const generateLineChartData = () => {
    const dates = [...new Set(moodData.map(item => item.date))].sort();
    
    return dates.map(date => {
      const dayData = moodData.find(item => item.date === date);
      const habitCount = habitData.filter(item => item.date === date).length;
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        mood: dayData?.mood_score || 0,
        energy: dayData?.energy_level || 0,
        stress: dayData?.stress_level || 0,
        sleep: dayData?.sleep_hours || 0,
        habits: habitCount
      };
    });
  };

  /**
   * Gera dados para gráfico de barras
   */
  const generateBarChartData = () => {
    const habitCategories = [...new Set(habitData.map(item => item.category))];
    
    return habitCategories.map(category => {
      const categoryHabits = habitData.filter(item => item.category === category);
      return {
        category,
        count: categoryHabits.length,
        percentage: Math.round((categoryHabits.length / habitData.length) * 100) || 0
      };
    });
  };

  /**
   * Gera dados para gráfico de pizza
   */
  const generatePieChartData = () => {
    const riskLevels = [...new Set(scaleData.map(item => item.risk_level))];
    
    return riskLevels.map(level => {
      const levelCount = scaleData.filter(item => item.risk_level === level).length;
      return {
        level,
        count: levelCount,
        percentage: Math.round((levelCount / scaleData.length) * 100) || 0
      };
    });
  };

  /**
   * Exporta dados como CSV
   */
  const exportData = () => {
    const csvData = [
      ['Data', 'Humor', 'Energia', 'Estresse', 'Sono', 'Hábitos Completados'],
      ...generateLineChartData().map(item => [
        item.date,
        item.mood,
        item.energy,
        item.stress,
        item.sleep,
        item.habits
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progresso_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Renderiza gráfico simples (placeholder para biblioteca de gráficos)
   */
  const renderSimpleChart = () => {
    const data = generateLineChartData();
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.flatMap(item => 
      selectedMetrics.map(metric => item[metric as keyof typeof item] as number)
    ));

    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Progresso ao Longo do Tempo</h3>
          <div className="flex space-x-2">
            {['line', 'bar', 'pie'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedChart(type as any)}
                className={`p-2 rounded-lg ${
                  selectedChart === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'line' && <LineChart className="w-4 h-4" />}
                {type === 'bar' && <BarChart className="w-4 h-4" />}
                {type === 'pie' && <PieChart className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico Simples */}
        <div className="h-64 flex items-end space-x-2 border-b border-l border-gray-200 p-4">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="flex flex-col-reverse space-y-reverse space-y-1 h-48">
                {selectedMetrics.map((metric) => {
                  const value = item[metric as keyof typeof item] as number;
                  const height = (value / maxValue) * 100;
                  const metricConfig = metrics[metric as keyof typeof metrics];
                  
                  return (
                    <div
                      key={metric}
                      className="w-full rounded-t"
                      style={{
                        height: `${height}%`,
                        backgroundColor: metricConfig.color,
                        minHeight: value > 0 ? '4px' : '0'
                      }}
                      title={`${metricConfig.name}: ${value}`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                {item.date}
              </div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 mt-4">
          {selectedMetrics.map((metric) => {
            const metricConfig = metrics[metric as keyof typeof metrics];
            const IconComponent = metricConfig.icon;
            
            return (
              <div key={metric} className="flex items-center">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: metricConfig.color }}
                />
                <IconComponent className="w-4 h-4 mr-1 text-gray-600" />
                <span className="text-sm text-gray-700">{metricConfig.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Renderiza cartões de resumo
   */
  const renderSummaryCards = () => {
    if (!progressSummary) return null;

    const cards = [
      {
        title: 'Humor Médio',
        value: progressSummary.avg_mood.toFixed(1),
        max: '5.0',
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        title: 'Energia Média',
        value: progressSummary.avg_energy.toFixed(1),
        max: '5.0',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      {
        title: 'Taxa de Hábitos',
        value: `${progressSummary.habits_completion_rate}%`,
        max: '100%',
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Sono Médio',
        value: `${progressSummary.avg_sleep.toFixed(1)}h`,
        max: '8h',
        icon: Moon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <div key={index} className={`${card.bgColor} rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-500">de {card.max}</p>
                </div>
                <IconComponent className={`w-8 h-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
          Relatórios de Progresso
        </h1>
        <p className="text-gray-600">
          Visualize seu progresso em bem-estar com gráficos detalhados e insights.
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Seletor de Período */}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-600" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border rounded-lg px-3 py-2"
              >
                {Object.entries(timeRanges).map(([key, range]) => (
                  <option key={key} value={key}>{range.name}</option>
                ))}
              </select>
            </div>

            {/* Seletor de Métricas */}
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-600" />
              <div className="flex space-x-2">
                {Object.entries(metrics).map(([key, metric]) => {
                  const IconComponent = metric.icon;
                  const isSelected = selectedMetrics.includes(key);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMetrics(prev => prev.filter(m => m !== key));
                        } else {
                          setSelectedMetrics(prev => [...prev, key]);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {metric.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                showComparison
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Comparar
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando dados...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cartões de Resumo */}
          {renderSummaryCards()}

          {/* Gráfico Principal */}
          {renderSimpleChart()}

          {/* Insights e Análises */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Análise de Hábitos */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Análise de Hábitos
              </h3>
              
              <div className="space-y-4">
                {generateBarChartData().map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendências */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Tendências
              </h3>
              
              <div className="space-y-4">
                {progressSummary && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">
                        Humor está {progressSummary.avg_mood >= 3.5 ? 'estável' : 'baixo'}
                      </span>
                      <span className="text-sm text-blue-600">
                        {progressSummary.avg_mood.toFixed(1)}/5.0
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">
                        Taxa de hábitos {progressSummary.habits_completion_rate >= 70 ? 'excelente' : 'precisa melhorar'}
                      </span>
                      <span className="text-sm text-green-600">
                        {progressSummary.habits_completion_rate}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">
                        Conteúdo IA completado
                      </span>
                      <span className="text-sm text-purple-600">
                        {progressSummary.ai_content_completed} atividades
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Comparação de Períodos */}
          {showComparison && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Comparação com Período Anterior</h3>
              <p className="text-gray-600 text-sm">
                Esta funcionalidade permite comparar seu progresso atual com períodos anteriores.
                Em desenvolvimento - dados comparativos serão exibidos aqui.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressReports;