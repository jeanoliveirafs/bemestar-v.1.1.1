/**
 * Componente para Plano de Ação em Crises
 * Botão de emergência com exercícios imediatos e contatos de emergência
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Heart, Volume2, VolumeX, Settings, Plus, Trash2, Play, Pause } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration_seconds: number;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
}

interface CalmingAudio {
  id: string;
  name: string;
  description: string;
  audio_url: string;
  duration_minutes: number;
  category: string;
}

const CrisisActionPlan: React.FC = () => {
  const [isInCrisis, setIsInCrisis] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [breathingExercises, setBreathingExercises] = useState<BreathingExercise[]>([]);
  const [calmingAudios, setCalmingAudios] = useState<CalmingAudio[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<CalmingAudio | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exercisePhase, setExercisePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  useEffect(() => {
    loadEmergencyContacts();
    loadBreathingExercises();
    loadCalmingAudios();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isExerciseActive && selectedExercise) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          const newTime = prev + 1;
          
          // Lógica para alternar fases da respiração
          if (exercisePhase === 'inhale' && newTime >= selectedExercise.inhale_seconds) {
            setExercisePhase('hold');
            return 0;
          } else if (exercisePhase === 'hold' && newTime >= selectedExercise.hold_seconds) {
            setExercisePhase('exhale');
            return 0;
          } else if (exercisePhase === 'exhale' && newTime >= selectedExercise.exhale_seconds) {
            setExercisePhase('inhale');
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isExerciseActive, exercisePhase, selectedExercise]);

  /**
   * Carrega contatos de emergência do usuário
   */
  const loadEmergencyContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  /**
   * Carrega exercícios de respiração disponíveis
   */
  const loadBreathingExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('breathing_exercises')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBreathingExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  };

  /**
   * Carrega áudios calmantes disponíveis
   */
  const loadCalmingAudios = async () => {
    try {
      const { data, error } = await supabase
        .from('calming_audios')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name');

      if (error) throw error;
      setCalmingAudios(data || []);
    } catch (error) {
      console.error('Erro ao carregar áudios:', error);
    }
  };

  /**
   * Ativa modo de crise
   */
  const activateCrisisMode = async () => {
    setIsInCrisis(true);
    
    // Registrar evento de crise para análise
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('crisis_events')
          .insert({
            user_id: user.id,
            event_type: 'crisis_button_pressed',
            timestamp: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Erro ao registrar evento de crise:', error);
    }
  };

  /**
   * Inicia exercício de respiração
   */
  const startBreathingExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsExerciseActive(true);
    setExercisePhase('inhale');
    setExerciseTimer(0);
  };

  /**
   * Para exercício de respiração
   */
  const stopBreathingExercise = () => {
    setIsExerciseActive(false);
    setSelectedExercise(null);
    setExerciseTimer(0);
  };

  /**
   * Reproduz/pausa áudio calmante
   */
  const toggleAudio = (audio: CalmingAudio) => {
    if (selectedAudio?.id === audio.id && isAudioPlaying) {
      // Pausar áudio atual
      audioElement?.pause();
      setIsAudioPlaying(false);
    } else {
      // Parar áudio anterior se houver
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      // Iniciar novo áudio
      const newAudio = new Audio(audio.audio_url);
      newAudio.loop = true;
      newAudio.play();
      
      setAudioElement(newAudio);
      setSelectedAudio(audio);
      setIsAudioPlaying(true);
      
      newAudio.onended = () => {
        setIsAudioPlaying(false);
      };
    }
  };

  /**
   * Para todos os áudios
   */
  const stopAllAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setIsAudioPlaying(false);
    setSelectedAudio(null);
  };

  /**
   * Adiciona novo contato de emergência
   */
  const addEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: newContact.name,
          phone: newContact.phone,
          relationship: newContact.relationship,
          is_primary: emergencyContacts.length === 0
        });

      if (error) throw error;
      
      setNewContact({ name: '', phone: '', relationship: '' });
      loadEmergencyContacts();
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
    }
  };

  /**
   * Remove contato de emergência
   */
  const removeEmergencyContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      loadEmergencyContacts();
    } catch (error) {
      console.error('Erro ao remover contato:', error);
    }
  };

  /**
   * Faz ligação para contato
   */
  const callContact = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  /**
   * Retorna texto da fase de respiração
   */
  const getBreathingPhaseText = () => {
    switch (exercisePhase) {
      case 'inhale':
        return 'Inspire';
      case 'hold':
        return 'Segure';
      case 'exhale':
        return 'Expire';
      default:
        return '';
    }
  };

  // Renderizar configurações
  if (showSettings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Configurações de Emergência</h1>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Contatos de Emergência */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contatos de Emergência</h2>
          
          {/* Adicionar Novo Contato */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Nome"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Relacionamento"
              value={newContact.relationship}
              onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />
            <button
              onClick={addEmergencyContact}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </button>
          </div>

          {/* Lista de Contatos */}
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{contact.name}</h3>
                    {contact.is_primary && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                  {contact.relationship && (
                    <p className="text-xs text-gray-500">{contact.relationship}</p>
                  )}
                </div>
                <button
                  onClick={() => removeEmergencyContact(contact.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar modo de crise
  if (isInCrisis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Modo de Emergência Ativado</h1>
          <p className="text-gray-600 mb-6">
            Você está seguro. Respire fundo e escolha uma das opções abaixo.
          </p>
          <button
            onClick={() => setIsInCrisis(false)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Sair do Modo de Emergência
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contatos de Emergência */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Contatos de Emergência
            </h2>
            
            {emergencyContacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Nenhum contato configurado</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Configurar Contatos
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => callContact(contact.phone)}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        {contact.relationship && (
                          <p className="text-xs text-gray-500">{contact.relationship}</p>
                        )}
                      </div>
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exercícios de Respiração */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Exercícios de Respiração
            </h2>
            
            {selectedExercise && isExerciseActive ? (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">{selectedExercise.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {getBreathingPhaseText()}
                  </div>
                  <div className="text-2xl text-gray-600">
                    {exerciseTimer}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={stopBreathingExercise}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Parar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {breathingExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => startBreathingExercise(exercise)}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <h3 className="font-medium">{exercise.name}</h3>
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {exercise.inhale_seconds}s inspirar • {exercise.hold_seconds}s segurar • {exercise.exhale_seconds}s expirar
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Áudios Calmantes */}
          <div className="bg-white rounded-lg border p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-green-600" />
                Áudios Calmantes
              </h2>
              {isAudioPlaying && (
                <button
                  onClick={stopAllAudio}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  Parar Áudio
                </button>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {calmingAudios.map((audio) => (
                <button
                  key={audio.id}
                  onClick={() => toggleAudio(audio)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedAudio?.id === audio.id && isAudioPlaying
                      ? 'bg-green-50 border-green-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{audio.name}</h3>
                    {selectedAudio?.id === audio.id && isAudioPlaying ? (
                      <Pause className="w-4 h-4 text-green-600" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{audio.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{audio.category}</span>
                    <span>{audio.duration_minutes} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar tela principal
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plano de Ação em Crises</h1>
        <p className="text-gray-600 mb-8">
          Tenha acesso rápido a recursos de apoio quando precisar.
        </p>
        
        {/* Botão de Emergência Principal */}
        <button
          onClick={activateCrisisMode}
          className="bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-6 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 mb-8"
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          PRECISO DE AJUDA AGORA
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Preview de Contatos */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Contatos de Emergência
          </h2>
          
          {emergencyContacts.length === 0 ? (
            <p className="text-gray-600 mb-4">Nenhum contato configurado</p>
          ) : (
            <div className="space-y-2 mb-4">
              {emergencyContacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="flex justify-between items-center">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-sm text-gray-600">{contact.phone}</span>
                </div>
              ))}
              {emergencyContacts.length > 3 && (
                <p className="text-sm text-gray-500">+{emergencyContacts.length - 3} mais</p>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Contatos
          </button>
        </div>

        {/* Preview de Recursos */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Recursos Disponíveis</h2>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium">Exercícios de Respiração</h3>
                <p className="text-sm text-gray-600">{breathingExercises.length} exercícios disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium">Áudios Calmantes</h3>
                <p className="text-sm text-gray-600">{calmingAudios.length} áudios disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisActionPlan;