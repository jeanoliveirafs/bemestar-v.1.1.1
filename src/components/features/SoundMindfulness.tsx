/**
 * Componente para Integração com Som e Mindfulness
 * Sons ambiente disponíveis durante exercícios
 * IA sugere sons conforme estado emocional
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Heart, Brain, Waves, TreePine, Cloud, Sun, Moon, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface SoundTrack {
  id: string;
  name: string;
  category: string;
  file_url: string;
  duration: number;
  description: string;
  mood_tags: string[];
  energy_level: 'low' | 'medium' | 'high';
  recommended_for: string[];
  created_at: string;
}

interface MindfulnessSession {
  id: string;
  user_id: string;
  sound_track_id: string;
  session_type: 'meditation' | 'breathing' | 'sleep' | 'focus' | 'relaxation';
  duration_minutes: number;
  mood_before: number;
  mood_after: number;
  notes: string;
  completed_at: string;
}

interface AIRecommendation {
  sound_id: string;
  reason: string;
  confidence: number;
  mood_match: string[];
}

const SoundMindfulness: React.FC = () => {
  const [soundTracks, setSoundTracks] = useState<SoundTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sessionType, setSessionType] = useState<string>('meditation');
  const [moodBefore, setMoodBefore] = useState<number>(3);
  const [moodAfter, setMoodAfter] = useState<number>(3);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const categories = {
    all: { name: 'Todos', icon: Waves, color: 'text-blue-600' },
    nature: { name: 'Natureza', icon: TreePine, color: 'text-green-600' },
    rain: { name: 'Chuva', icon: Cloud, color: 'text-gray-600' },
    ocean: { name: 'Oceano', icon: Waves, color: 'text-blue-500' },
    meditation: { name: 'Meditação', icon: Brain, color: 'text-purple-600' },
    sleep: { name: 'Sono', icon: Moon, color: 'text-indigo-600' },
    focus: { name: 'Foco', icon: Zap, color: 'text-yellow-600' },
    relaxation: { name: 'Relaxamento', icon: Heart, color: 'text-pink-600' }
  };

  const sessionTypes = {
    meditation: { name: 'Meditação', icon: Brain, description: 'Prática de mindfulness e consciência' },
    breathing: { name: 'Respiração', icon: Waves, description: 'Exercícios de respiração consciente' },
    sleep: { name: 'Sono', icon: Moon, description: 'Sons para relaxamento e sono' },
    focus: { name: 'Foco', icon: Zap, description: 'Concentração e produtividade' },
    relaxation: { name: 'Relaxamento', icon: Heart, description: 'Redução de estresse e ansiedade' }
  };

  useEffect(() => {
    loadSoundTracks();
    loadAIRecommendations();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isSessionActive) {
        completeSession();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isSessionActive]);

  /**
   * Carrega faixas de som do banco
   */
  const loadSoundTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('sound_tracks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setSoundTracks(data || []);
    } catch (error) {
      console.error('Erro ao carregar faixas de som:', error);
      // Fallback com dados locais
      setSoundTracks(getDefaultSoundTracks());
    }
  };

  /**
   * Carrega recomendações de IA
   */
  const loadAIRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar último log de humor
      const { data: moodData } = await supabase
        .from('daily_mood_logs')
        .select('mood_score, energy_level, stress_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (moodData && moodData.length > 0) {
        const recommendations = generateAIRecommendations(moodData[0]);
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    }
  };

  /**
   * Gera recomendações de IA baseadas no humor
   */
  const generateAIRecommendations = (moodData: any): AIRecommendation[] => {
    const { mood_score, energy_level, stress_level } = moodData;
    const recommendations: AIRecommendation[] = [];

    // Lógica de recomendação baseada no estado emocional
    if (stress_level >= 4) {
      recommendations.push({
        sound_id: 'rain-gentle',
        reason: 'Som de chuva suave ajuda a reduzir o estresse',
        confidence: 0.9,
        mood_match: ['stressed', 'anxious']
      });
    }

    if (energy_level <= 2) {
      recommendations.push({
        sound_id: 'birds-morning',
        reason: 'Sons energizantes da natureza para aumentar a vitalidade',
        confidence: 0.8,
        mood_match: ['tired', 'low-energy']
      });
    }

    if (mood_score <= 2) {
      recommendations.push({
        sound_id: 'ocean-waves',
        reason: 'Ondas do oceano promovem sensação de calma e bem-estar',
        confidence: 0.85,
        mood_match: ['sad', 'depressed']
      });
    }

    if (mood_score >= 4 && energy_level >= 4) {
      recommendations.push({
        sound_id: 'forest-ambient',
        reason: 'Ambiente florestal para manter o equilíbrio positivo',
        confidence: 0.7,
        mood_match: ['happy', 'energetic']
      });
    }

    return recommendations;
  };

  /**
   * Dados padrão de faixas de som
   */
  const getDefaultSoundTracks = (): SoundTrack[] => [
    {
      id: 'rain-gentle',
      name: 'Chuva Suave',
      category: 'rain',
      file_url: '/sounds/rain-gentle.mp3',
      duration: 1800, // 30 minutos
      description: 'Som relaxante de chuva suave para reduzir estresse',
      mood_tags: ['relaxing', 'calming', 'stress-relief'],
      energy_level: 'low',
      recommended_for: ['sleep', 'meditation', 'relaxation'],
      created_at: new Date().toISOString()
    },
    {
      id: 'ocean-waves',
      name: 'Ondas do Oceano',
      category: 'ocean',
      file_url: '/sounds/ocean-waves.mp3',
      duration: 2400, // 40 minutos
      description: 'Ondas suaves do oceano para meditação profunda',
      mood_tags: ['peaceful', 'meditative', 'grounding'],
      energy_level: 'low',
      recommended_for: ['meditation', 'sleep'],
      created_at: new Date().toISOString()
    },
    {
      id: 'forest-ambient',
      name: 'Floresta Ambiente',
      category: 'nature',
      file_url: '/sounds/forest-ambient.mp3',
      duration: 3600, // 60 minutos
      description: 'Sons da floresta com pássaros e vento suave',
      mood_tags: ['natural', 'refreshing', 'balanced'],
      energy_level: 'medium',
      recommended_for: ['focus', 'meditation'],
      created_at: new Date().toISOString()
    },
    {
      id: 'birds-morning',
      name: 'Pássaros da Manhã',
      category: 'nature',
      file_url: '/sounds/birds-morning.mp3',
      duration: 1200, // 20 minutos
      description: 'Canto energizante dos pássaros ao amanhecer',
      mood_tags: ['energizing', 'uplifting', 'positive'],
      energy_level: 'high',
      recommended_for: ['focus', 'morning-routine'],
      created_at: new Date().toISOString()
    },
    {
      id: 'meditation-bells',
      name: 'Sinos de Meditação',
      category: 'meditation',
      file_url: '/sounds/meditation-bells.mp3',
      duration: 900, // 15 minutos
      description: 'Sinos tibetanos para meditação profunda',
      mood_tags: ['spiritual', 'centering', 'mindful'],
      energy_level: 'low',
      recommended_for: ['meditation', 'breathing'],
      created_at: new Date().toISOString()
    }
  ];

  /**
   * Reproduz ou pausa a faixa atual
   */
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Seleciona uma nova faixa
   */
  const selectTrack = (track: SoundTrack) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  /**
   * Ajusta o volume
   */
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  /**
   * Busca para uma posição específica
   */
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  /**
   * Inicia uma sessão de mindfulness
   */
  const startSession = () => {
    if (!currentTrack) return;
    
    setIsSessionActive(true);
    setSessionStartTime(new Date());
    setShowSessionModal(false);
    
    // Reproduzir automaticamente
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  /**
   * Completa uma sessão de mindfulness
   */
  const completeSession = async () => {
    if (!isSessionActive || !sessionStartTime || !currentTrack) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);

      const sessionData: Partial<MindfulnessSession> = {
        user_id: user.id,
        sound_track_id: currentTrack.id,
        session_type: sessionType as any,
        duration_minutes: sessionDuration,
        mood_before: moodBefore,
        mood_after: moodAfter,
        notes: sessionNotes,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('mindfulness_sessions')
        .insert([sessionData]);

      if (error) throw error;

      // Atualizar gamificação
      await updateGamification(sessionDuration);

      // Reset session
      setIsSessionActive(false);
      setSessionStartTime(null);
      setSessionNotes('');
      
      alert('Sessão concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  /**
   * Atualiza pontos de gamificação
   */
  const updateGamification = async (durationMinutes: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const points = Math.round(durationMinutes * 2); // 2 pontos por minuto

      const { error } = await supabase.rpc('add_gamification_points', {
        p_user_id: user.id,
        p_points: points,
        p_activity_type: 'mindfulness_session'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar gamificação:', error);
    }
  };

  /**
   * Formata tempo em MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Filtra faixas por categoria
   */
  const filteredTracks = soundTracks.filter(track => 
    selectedCategory === 'all' || track.category === selectedCategory
  );

  /**
   * Renderiza player de áudio
   */
  const renderAudioPlayer = () => {
    if (!currentTrack) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Waves className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{currentTrack.name}</h3>
            <p className="text-sm text-gray-600">{currentTrack.description}</p>
            <div className="flex space-x-2 mt-1">
              {currentTrack.mood_tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Controles de Reprodução */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => seekTo(Math.max(0, currentTime - 10))}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => seekTo(Math.min(duration, currentTime + 10))}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 ml-auto">
            <VolumeX className="w-4 h-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20"
            />
            <Volume2 className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            ref={progressRef}
            className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seekTo(duration * percentage);
            }}
          >
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Botão de Sessão */}
        <div className="flex justify-center">
          {!isSessionActive ? (
            <button
              onClick={() => setShowSessionModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Brain className="w-4 h-4 mr-2" />
              Iniciar Sessão de Mindfulness
            </button>
          ) : (
            <button
              onClick={completeSession}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              Finalizar Sessão
            </button>
          )}
        </div>

        {/* Áudio Element */}
        <audio
          ref={audioRef}
          src={currentTrack.file_url}
          volume={volume}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        />
      </div>
    );
  };

  /**
   * Renderiza recomendações de IA
   */
  const renderAIRecommendations = () => {
    if (aiRecommendations.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Recomendações Personalizadas
        </h3>
        
        <div className="space-y-3">
          {aiRecommendations.map((rec, index) => {
            const track = soundTracks.find(t => t.id === rec.sound_id);
            if (!track) return null;
            
            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{track.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex space-x-1 mr-3">
                        {rec.mood_match.map((mood, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {mood}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(rec.confidence * 100)}% de confiança
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => selectTrack(track)}
                    className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Waves className="w-8 h-8 mr-3 text-blue-600" />
          Som e Mindfulness
        </h1>
        <p className="text-gray-600">
          Sons ambiente e sessões guiadas para meditação, relaxamento e foco.
        </p>
      </div>

      {/* Recomendações de IA */}
      {renderAIRecommendations()}

      {/* Player de Áudio */}
      {renderAudioPlayer()}

      {/* Filtros de Categoria */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, category]) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === key;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Faixas */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Biblioteca de Sons</h3>
        </div>
        
        <div className="divide-y">
          {filteredTracks.map((track) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            
            return (
              <div
                key={track.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isCurrentTrack ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
                onClick={() => selectTrack(track)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{track.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {categories[track.category as keyof typeof categories]?.name || track.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(track.duration)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        track.energy_level === 'high' ? 'bg-yellow-100 text-yellow-800' :
                        track.energy_level === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {track.energy_level === 'high' ? 'Energizante' :
                         track.energy_level === 'medium' ? 'Equilibrado' : 'Relaxante'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isCurrentTrack && (
                      <div className="flex items-center text-blue-600">
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Sessão */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Configurar Sessão</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Sessão
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.entries(sessionTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como você se sente agora? (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muito mal</span>
                  <span>Neutro</span>
                  <span>Muito bem</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Como você espera se sentir após a sessão?"
                  className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSessionModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={startSession}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Iniciar Sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundMindfulness;