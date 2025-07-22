/**
 * Componente para Escalas Psicológicas e Autoavaliações
 * Permite aos usuários responder questionários validados como PHQ-9, GAD-7
 */

import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Scale {
  id: string;
  name: string;
  description: string;
  category: string;
  total_questions: number;
  max_score: number;
  interpretation_ranges: Record<string, number[]>;
}

interface Question {
  id: string;
  question_text: string;
  question_order: number;
  answer_options: Array<{ value: number; text: string }>;
}

interface ScaleResponse {
  id: string;
  scale_id: string;
  total_score: number;
  risk_level: string;
  completed_at: string;
  scale: { name: string; category: string };
}

const PsychologicalScales: React.FC = () => {
  const [scales, setScales] = useState<Scale[]>([]);
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recentResults, setRecentResults] = useState<ScaleResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Carregar escalas disponíveis
  useEffect(() => {
    loadScales();
    loadRecentResults();
  }, []);

  /**
   * Carrega todas as escalas psicológicas disponíveis
   */
  const loadScales = async () => {
    try {
      const { data, error } = await supabase
        .from('psychological_scales')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setScales(data || []);
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
    }
  };

  /**
   * Carrega resultados recentes do usuário
   */
  const loadRecentResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_scale_responses')
        .select(`
          id,
          scale_id,
          total_score,
          risk_level,
          completed_at,
          psychological_scales!inner(name, category)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentResults(data || []);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    }
  };

  /**
   * Inicia uma escala específica carregando suas perguntas
   */
  const startScale = async (scale: Scale) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scale_questions')
        .select('*')
        .eq('scale_id', scale.id)
        .order('question_order');

      if (error) throw error;
      
      setSelectedScale(scale);
      setQuestions(data || []);
      setResponses({});
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registra resposta para uma pergunta
   */
  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  /**
   * Avança para próxima pergunta ou finaliza escala
   */
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitScale();
    }
  };

  /**
   * Volta para pergunta anterior
   */
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  /**
   * Submete as respostas e calcula resultado
   */
  const submitScale = async () => {
    if (!selectedScale) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Calcular pontuação total
      const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);
      
      // Determinar nível de risco baseado nos ranges
      let riskLevel = 'low';
      const ranges = selectedScale.interpretation_ranges;
      
      for (const [level, range] of Object.entries(ranges)) {
        if (totalScore >= range[0] && totalScore <= range[1]) {
          riskLevel = level;
          break;
        }
      }

      // Salvar no banco
      const { data, error } = await supabase
        .from('user_scale_responses')
        .insert({
          user_id: user.id,
          scale_id: selectedScale.id,
          responses,
          total_score: totalScore,
          risk_level: riskLevel
        })
        .select()
        .single();

      if (error) throw error;

      setLastResult({ ...data, scale: selectedScale });
      setShowResults(true);
      loadRecentResults();
      
      // Adicionar pontos de gamificação
      await addGamificationPoints(20);
      
    } catch (error) {
      console.error('Erro ao submeter escala:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona pontos de gamificação
   */
  const addGamificationPoints = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar gamificação atual do usuário
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gamification) {
        // Atualizar pontos existentes
        await supabase
          .from('user_gamification')
          .update({ 
            total_points: gamification.total_points + points,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Criar registro inicial
        await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            total_points: points
          });
      }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
    }
  };

  /**
   * Retorna cor baseada no nível de risco
   */
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'minimal':
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'mild':
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      case 'moderately_severe':
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'severe':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Retorna texto amigável para nível de risco
   */
  const getRiskText = (riskLevel: string) => {
    const texts: Record<string, string> = {
      minimal: 'Mínimo',
      low: 'Baixo',
      mild: 'Leve',
      moderate: 'Moderado',
      moderately_severe: 'Moderadamente Severo',
      high: 'Alto',
      severe: 'Severo'
    };
    return texts[riskLevel] || riskLevel;
  };

  // Renderizar lista de escalas
  if (!selectedScale && !showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            Escalas Psicológicas
          </h1>
          <p className="text-gray-600">
            Avalie seu bem-estar mental através de questionários cientificamente validados.
          </p>
        </div>

        {/* Resultados Recentes */}
        {recentResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Resultados Recentes
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{result.scale.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getRiskColor(result.risk_level)
                    }`}>
                      {getRiskText(result.risk_level)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Pontuação: {result.total_score}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(result.completed_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Escalas Disponíveis */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Escalas Disponíveis</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {scales.map((scale) => (
              <div key={scale.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{scale.name}</h3>
                <p className="text-gray-600 mb-4">{scale.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">
                    {scale.total_questions} perguntas
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {scale.category}
                  </span>
                </div>
                <button
                  onClick={() => startScale(scale)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Carregando...' : 'Iniciar Avaliação'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar resultados
  if (showResults && lastResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Avaliação Concluída!</h1>
          <h2 className="text-xl text-gray-700 mb-6">{lastResult.scale.name}</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {lastResult.total_score}/{selectedScale?.max_score}
            </div>
            <div className={`inline-block px-4 py-2 rounded-full font-medium ${
              getRiskColor(lastResult.risk_level)
            }`}>
              Nível: {getRiskText(lastResult.risk_level)}
            </div>
          </div>

          {lastResult.risk_level === 'severe' || lastResult.risk_level === 'high' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 text-sm">
                Seus resultados indicam que pode ser útil conversar com um profissional de saúde mental.
                Lembre-se: esta é apenas uma ferramenta de autoavaliação.
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSelectedScale(null);
                setShowResults(false);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Voltar às Escalas
            </button>
            <button
              onClick={() => startScale(selectedScale!)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refazer Avaliação
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar questionário
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{selectedScale?.name}</h1>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} de {questions.length}
          </span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-lg font-medium mb-6">
            {currentQuestion.question_text}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.answer_options.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={responses[currentQuestion.id] === option.value}
                  onChange={() => handleResponse(currentQuestion.id, option.value)}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={!responses[currentQuestion.id] && responses[currentQuestion.id] !== 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychologicalScales;