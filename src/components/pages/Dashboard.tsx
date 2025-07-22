import React, { useState, useEffect } from 'react';
import { 
  Heart, TrendingUp, Users, Activity, Brain, 
  Calendar, Clock, Target, Award, Smile,
  AlertTriangle, ChevronRight, Play, MessageCircle,
  Zap, BarChart3, CheckCircle, Coffee, Send, Phone, Video,
  Shield, Bell, Sparkles, PieChart, Music
} from 'lucide-react';

// Importar os novos componentes (com fallback)
const PsychologicalScales = React.lazy(() => import('../features/PsychologicalScales').catch(() => ({ default: () => <div className="p-8 text-center">Escalas Psicológicas - Em desenvolvimento</div> })));
const CrisisActionPlan = React.lazy(() => import('../features/CrisisActionPlan').catch(() => ({ default: () => <div className="p-8 text-center">Plano de Crise - Em desenvolvimento</div> })));
const HabitGamification = React.lazy(() => import('../features/HabitGamification').catch(() => ({ default: () => <div className="p-8 text-center">Gamificação - Em desenvolvimento</div> })));
const PersonalizedRoutine = React.lazy(() => import('../features/PersonalizedRoutine').catch(() => ({ default: () => <div className="p-8 text-center">Rotina Personalizada - Em desenvolvimento</div> })));
const EmotionWall = React.lazy(() => import('../features/EmotionWall').catch(() => ({ default: () => <div className="p-8 text-center">Mural de Emoções - Em desenvolvimento</div> })));
const AIContent = React.lazy(() => import('../features/AIContent').catch(() => ({ default: () => <div className="p-8 text-center">Conteúdo IA - Em desenvolvimento</div> })));
const ProgressReports = React.lazy(() => import('../features/ProgressReports').catch(() => ({ default: () => <div className="p-8 text-center">Relatórios - Em desenvolvimento</div> })));
const SoundMindfulness = React.lazy(() => import('../features/SoundMindfulness').catch(() => ({ default: () => <div className="p-8 text-center">Mindfulness - Em desenvolvimento</div> })));

export default function Dashboard() {
  const [currentMood, setCurrentMood] = useState(7);
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [showDesabafo, setShowDesabafo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Olá! Bem-vindo ao seu espaço seguro. Como você está se sentindo hoje?', sender: 'bot', time: '14:30' },
    { id: 2, text: 'Estou aqui para te ouvir e apoiar. Fique à vontade para compartilhar seus sentimentos.', sender: 'bot', time: '14:30' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [moodMessage, setMoodMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Definir as abas das novas funcionalidades
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'scales', name: 'Autoavaliações', icon: Brain },
    { id: 'crisis', name: 'Emergência', icon: Shield },
    { id: 'habits', name: 'Hábitos', icon: Award },
    { id: 'routine', name: 'Rotina', icon: Bell },
    { id: 'emotions', name: 'Comunidade', icon: Users },
    { id: 'ai-content', name: 'IA Content', icon: Sparkles },
    { id: 'reports', name: 'Relatórios', icon: PieChart },
    { id: 'mindfulness', name: 'Mindfulness', icon: Music }
  ];
  
  // Função para registrar humor
  const handleMoodRegister = () => {
    setMoodMessage('Humor registrado com sucesso! 🎉');
    setTimeout(() => setMoodMessage(''), 3000);
  };
  
  // Função para abrir espaço de desabafo
  const handleDesabafoClick = () => {
    setShowChat(true);
  };
  
  // Função para enviar mensagem no chat via webhook n8n
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      const messageToSend = newMessage;
      setNewMessage('');
      setIsTyping(true);
      
      try {
        // Enviar mensagem para o webhook do n8n
        const response = await fetch('https://webhook.jeanautomationpro.com.br/webhook/bemestar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageToSend,
            sessionId: 'user-session-' + Date.now() // Gerar um sessionId único
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Adicionar resposta do bot
          const botMessage = {
            id: chatMessages.length + 2,
            text: data.message || 'Desculpe, não consegui processar sua mensagem.',
            sender: 'bot',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          
          setChatMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        } else {
          // Fallback em caso de erro na API
          const errorMessage = {
            id: chatMessages.length + 2,
            text: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes.',
            sender: 'bot',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          
          setChatMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        
        // Fallback em caso de erro de conexão
        const errorMessage = {
          id: chatMessages.length + 2,
          text: 'Ops! Parece que estou offline no momento. Suas mensagens são importantes para mim, tente novamente em breve.',
          sender: 'bot',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }
  };
  
  // Função para navegar para ações rápidas
  const handleQuickAction = (actionType: string) => {
    switch(actionType) {
      case 'respiracao':
        setActiveTab('mindfulness');
        break;
      case 'ansiedade':
        setActiveTab('crisis');
        break;
      case 'recursos':
        setActiveTab('ai-content');
        break;
      case 'habitos':
        setActiveTab('habits');
        break;
      case 'progresso':
        setActiveTab('reports');
        break;
      case 'sessoes':
        setActiveTab('reports');
        break;
      case 'dias-consecutivos':
        setActiveTab('habits');
        break;
      default:
        console.log(`Navegando para: ${actionType}`);
        break;
    }
  };

  // Função para renderizar o conteúdo baseado na aba ativa
  const renderTabContent = () => {
    switch(activeTab) {
      case 'scales':
        return <PsychologicalScales />;
      case 'crisis':
        return <CrisisActionPlan />;
      case 'habits':
        return <HabitGamification />;
      case 'routine':
        return <PersonalizedRoutine />;
      case 'emotions':
        return <EmotionWall />;
      case 'ai-content':
        return <AIContent />;
      case 'reports':
        return <ProgressReports />;
      case 'mindfulness':
        return <SoundMindfulness />;
      default:
        return renderDashboardContent();
    }
  };

  // Função para renderizar o conteúdo do dashboard principal
  const renderDashboardContent = () => {
    const moodData = [
      { day: 'Seg', value: 6 },
      { day: 'Ter', value: 7 },
      { day: 'Qua', value: 8 },
      { day: 'Qui', value: 6 },
      { day: 'Sex', value: 9 },
      { day: 'Sab', value: 8 },
      { day: 'Dom', value: 7 }
    ];

    const todayGoals = [
      { id: 1, title: 'Exercício de respiração', duration: '5 min', completed: true, icon: Brain },
      { id: 2, title: 'Caminhada ao ar livre', duration: '20 min', completed: false, icon: Activity },
      { id: 3, title: 'Diário de gratidão', duration: '10 min', completed: false, icon: Heart },
      { id: 4, title: 'Meditação guiada', duration: '15 min', completed: false, icon: Target }
    ];

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Refúgio Digital
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Acredite no seu potencial todos os dias.</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Bom dia, jean oliveira!
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Seu bem-estar emocional é nossa prioridade.
          </p>
        </div>

        {/* Espaço de Desabafo */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              💬 Espaço de Desabafo
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Um lugar seguro para expressar seus sentimentos.
            </p>
            <button 
               onClick={handleDesabafoClick}
               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
             >
               Quero conversar agora
             </button>
          </div>
        </div>

        {/* Como você está se sentindo hoje? */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 text-center">
            Como você está se sentindo hoje?
          </h3>
          
          {/* Registro Rápido de Humor */}
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl">
            <h4 className="text-lg font-medium text-slate-800 dark:text-white mb-4 text-center">
              Registro Rápido de Humor
            </h4>
            <div className="flex justify-center space-x-4 mb-4">
              {[
                { emoji: '😢', label: 'Muito triste', value: 1 },
                { emoji: '😔', label: 'Triste', value: 3 },
                { emoji: '😐', label: 'Neutro', value: 5 },
                { emoji: '🙂', label: 'Bem', value: 7 },
                { emoji: '😊', label: 'Muito bem', value: 9 }
              ].map((mood) => (
                <button
                   key={mood.value}
                   onClick={() => {
                     setCurrentMood(mood.value);
                     handleMoodRegister();
                   }}
                   className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                     currentMood === mood.value
                       ? 'bg-blue-500 text-white scale-110'
                       : 'bg-white dark:bg-slate-600 hover:bg-blue-100 dark:hover:bg-slate-500'
                   }`}
                 >
                   <span className="text-2xl mb-1">{mood.emoji}</span>
                   <span className="text-xs font-medium">{mood.label}</span>
                 </button>
              ))}
            </div>
            <div className="text-center">
               <button 
                 onClick={() => setShowMoodHistory(true)}
                 className="text-blue-600 hover:text-blue-700 text-sm font-medium"
               >
                 Ver histórico completo →
               </button>
               {moodMessage && (
                 <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                   {moodMessage}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Dias Consecutivos */}
          <button 
            onClick={() => handleQuickAction('dias-consecutivos')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Dias Consecutivos</h3>
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm text-blue-100">Continue assim!</div>
            </div>
          </button>

          {/* Sessões */}
          <button 
            onClick={() => handleQuickAction('sessoes')}
            className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Sessões</h3>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-green-100">Este mês</div>
            </div>
          </button>

          {/* Hábitos */}
          <button 
            onClick={() => handleQuickAction('habitos')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Hábitos</h3>
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-purple-100">Ativos</div>
            </div>
          </button>

          {/* Progresso */}
          <button 
            onClick={() => handleQuickAction('progresso')}
            className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Progresso</h3>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">85%</div>
              <div className="text-sm text-orange-100">Meta semanal</div>
            </div>
          </button>
        </div>

        {/* Mensagem do Dia */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-2xl shadow-lg text-white mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">💜 Mensagem do Dia</h3>
              <p className="text-purple-100 italic mb-4">
                "Cada pequeno passo em direção ao cuidado pessoal é uma vitória. Você está no caminho certo!"
              </p>
              <div className="text-sm text-purple-200">
                Lembre-se: você merece cuidado e atenção.
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Evolução do Humor - Última Semana
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver detalhes
                </button>
              </div>
              
              <div className="flex items-end justify-between h-32 space-x-2">
                {moodData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${(day.value / 10) * 100}%` }}
                    ></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">{day.day}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Média da semana: <span className="font-semibold text-blue-600">7.3/10</span>
                </p>
              </div>
            </div>

            {/* Metas de Hoje */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Metas de Hoje
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {todayGoals.filter(goal => goal.completed).length}/{todayGoals.length} concluídas
                </div>
              </div>
              
              <div className="space-y-4">
                {todayGoals.map((goal) => {
                  const IconComponent = goal.icon;
                  return (
                    <div key={goal.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                      goal.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        goal.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}>
                        {goal.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          goal.completed 
                            ? 'text-green-800 dark:text-green-200 line-through' 
                            : 'text-slate-800 dark:text-white'
                        }`}>
                          {goal.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{goal.duration}</p>
                      </div>
                      {!goal.completed && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Iniciar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Ações Rápidas */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction('respiracao')}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-800 dark:text-white">Respiração Guiada</div>
                    <div className="text-sm text-slate-500">Exercício de 5 minutos</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                
                <button 
                  onClick={() => handleQuickAction('ansiedade')}
                  className="w-full flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-800 dark:text-white">Ansiedade</div>
                    <div className="text-sm text-slate-500">Técnicas de alívio</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                
                <button 
                  onClick={() => handleQuickAction('recursos')}
                  className="w-full flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-800 dark:text-white">Recursos</div>
                    <div className="text-sm text-slate-500">Artigos e dicas profissionais</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* Atividades Recentes */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">
                Atividades Recentes
              </h3>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Registre seu primeiro humor para começar!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Render content based on active tab */}
        {activeTab !== 'dashboard' ? (
          <React.Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            {renderTabContent()}
          </React.Suspense>
        ) : (
          renderDashboardContent()
        )}
        
        {/* Modal do Espaço de Desabafo */}
       {showDesabafo && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Espaço de Desabafo</h3>
               <button 
                 onClick={() => setShowDesabafo(false)}
                 className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
               >
                 ✕
               </button>
             </div>
             <div className="space-y-4">
               <p className="text-slate-600 dark:text-slate-300 text-sm">
                 Este é um espaço seguro para você expressar seus sentimentos. Como você está se sentindo hoje?
               </p>
               <textarea 
                 className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg resize-none h-32 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                 placeholder="Escreva aqui seus pensamentos e sentimentos..."
               />
               <div className="flex space-x-3">
                 <button 
                   onClick={() => setShowDesabafo(false)}
                   className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={() => {
                     setShowDesabafo(false);
                     setMoodMessage('Obrigado por compartilhar. Você não está sozinho! 💙');
                     setTimeout(() => setMoodMessage(''), 4000);
                   }}
                   className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                 >
                   Compartilhar
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {/* Modal do Histórico de Humor */}
        {showMoodHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Histórico de Humor</h3>
                <button 
                  onClick={() => setShowMoodHistory(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { date: 'Hoje', mood: 'Feliz', emoji: '😊', color: 'bg-green-100 text-green-800' },
                  { date: 'Ontem', mood: 'Calmo', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
                  { date: '2 dias atrás', mood: 'Ansioso', emoji: '😰', color: 'bg-yellow-100 text-yellow-800' },
                  { date: '3 dias atrás', mood: 'Triste', emoji: '😢', color: 'bg-red-100 text-red-800' },
                  { date: '4 dias atrás', mood: 'Neutro', emoji: '😐', color: 'bg-gray-100 text-gray-800' },
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{entry.emoji}</span>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">{entry.date}</div>
                        <div className="text-sm text-slate-500">{entry.mood}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.color}`}>
                      {entry.mood}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowMoodHistory(false)}
                className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        
        {/* Modal de Chat estilo WhatsApp */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
              {/* Header do Chat */}
              <div className="bg-green-500 p-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Refúgio Digital</h3>
                    <p className="text-xs text-green-100">Sempre aqui para você</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-green-600 rounded-full transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-green-600 rounded-full transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-green-600 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Área de Mensagens */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-700 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-green-500 text-white rounded-br-md' 
                        : 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' 
                          ? 'text-green-100' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input de Mensagem */}
              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}