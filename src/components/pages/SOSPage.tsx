import React, { useState } from 'react';
import { 
  Phone, Heart, Brain, Wind, Users, 
  Clock, AlertTriangle, Shield, MessageCircle,
  Volume2, Pause, Play
} from 'lucide-react';

export default function SOSPage() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const emergencyContacts = [
    { 
      id: 1, 
      name: 'CVV - Centro de Valorização da Vida', 
      number: '188', 
      description: 'Apoio emocional 24h gratuito',
      type: 'hotline'
    },
    { 
      id: 2, 
      name: 'CAPS - Centro de Atenção Psicossocial', 
      number: '0800-644-0011', 
      description: 'Emergência psiquiátrica',
      type: 'medical'
    },
    { 
      id: 3, 
      name: 'SAMU', 
      number: '192', 
      description: 'Emergência médica',
      type: 'emergency'
    }
  ];

  const quickTechniques = [
    {
      title: 'Respiração 4-7-8',
      description: 'Inspire 4s, prenda 7s, expire 8s',
      icon: Wind,
      color: 'bg-blue-500',
      action: () => setBreathingActive(!breathingActive)
    },
    {
      title: 'Técnica 5-4-3-2-1',
      description: 'Grounding para ansiedade',
      icon: Brain,
      color: 'bg-green-500',
      action: () => {}
    },
    {
      title: 'Chat de Apoio',
      description: 'Fale com nossa IA',
      icon: MessageCircle,
      color: 'bg-purple-500',
      action: () => {}
    },
    {
      title: 'Sons Calmantes',
      description: 'Ruído branco e natureza',
      icon: Volume2,
      color: 'bg-teal-500',
      action: () => {}
    }
  ];

  const groundingItems = [
    { sense: '5 coisas que você VÊ', items: ['Celular', 'Mão', 'Parede', '', ''] },
    { sense: '4 coisas que você TOCA', items: ['Celular liso', 'Roupa macia', '', ''] },
    { sense: '3 coisas que você ESCUTA', items: ['Respiração', 'Som ambiente', ''] },
    { sense: '2 coisas que você CHEIRA', items: ['', ''] },
    { sense: '1 coisa que você SENTE (gosto)', items: [''] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-red-900/10 dark:via-slate-900 dark:to-blue-900/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header de Emergência */}
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-xl mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Modo SOS Ativado</h1>
          </div>
          <p className="text-red-100 text-lg">
            Você não está sozinho(a). Estamos aqui para ajudar você neste momento difícil.
          </p>
        </div>

        {/* Contatos de Emergência */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-8 border border-red-100 dark:border-red-900/20">
          <div className="flex items-center space-x-3 mb-6">
            <Phone className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Ajuda Imediata
            </h2>
          </div>
          
          <div className="grid gap-4">
            {emergencyContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => window.open(`tel:${contact.number}`)}
                className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 border border-red-200 dark:border-red-800"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-800 dark:text-white">
                    {contact.name}
                  </div>
                  <div className="text-red-600 font-bold text-lg">{contact.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {contact.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Importante:</strong> Se você está pensando em se machucar, procure ajuda profissional imediatamente. 
              Você merece apoio e cuidado.
            </p>
          </div>
        </div>

        {/* Técnicas Rápidas de Alívio */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-8 border border-blue-100 dark:border-blue-900/20">
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Técnicas de Alívio Imediato
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTechniques.map((technique, index) => {
              const Icon = technique.icon;
              return (
                <button
                  key={index}
                  onClick={technique.action}
                  className={`${technique.color} text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-left`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <div className="font-semibold text-lg mb-2">{technique.title}</div>
                  <div className="text-sm opacity-90">{technique.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercício de Respiração */}
        {breathingActive && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Wind className="w-6 h-6" />
                <h2 className="text-xl font-bold">Respiração 4-7-8</h2>
              </div>
              
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/30 rounded-full animate-pulse flex items-center justify-center">
                  <Wind className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-4 text-lg">
                <p>Inspire pelo nariz por <strong>4 segundos</strong></p>
                <p>Prenda a respiração por <strong>7 segundos</strong></p>
                <p>Expire pela boca por <strong>8 segundos</strong></p>
              </div>
              
              <button
                onClick={() => setBreathingActive(false)}
                className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Parar Exercício
              </button>
            </div>
          </div>
        )}

        {/* Técnica 5-4-3-2-1 de Grounding */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-8 border border-green-100 dark:border-green-900/20">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Técnica de Grounding 5-4-3-2-1
            </h2>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Esta técnica ajuda a trazer você de volta ao momento presente quando se sentir sobrecarregado(a):
          </p>
          
          <div className="space-y-4">
            {groundingItems.map((item, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                  {item.sense}:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {item.items.map((placeholder, itemIndex) => (
                    <input
                      key={itemIndex}
                      type="text"
                      placeholder={placeholder || "Escreva aqui..."}
                      className="px-3 py-2 bg-white dark:bg-slate-700 border border-green-300 dark:border-green-600 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem de Apoio */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="text-center">
            <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Você é Importante
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Seus sentimentos são válidos e você merece apoio. Esta fase difícil vai passar. 
              Você já superou 100% dos seus dias difíceis até agora - você é mais forte do que imagina.
              Continue respirando, continue tentando, você não está sozinho(a).
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Falar com Chat de Apoio
              </button>
              <button className="bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 px-6 py-3 rounded-lg font-semibold border border-purple-200 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors">
                Ver Recursos de Ajuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}