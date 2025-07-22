import React from 'react';
import { Heart, Shield, Users, Activity, TrendingUp, Brain, Clock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Brain,
      title: 'Avaliação Psicológica',
      description: 'Questionários validados como PHQ-9 e GAD-7 para monitorar sua saúde mental'
    },
    {
      icon: Shield,
      title: 'Plano de Segurança',
      description: 'Crie seu plano personalizado de crise com estratégias e contatos de apoio'
    },
    {
      icon: Heart,
      title: 'Recursos Terapêuticos',
      description: 'Biblioteca completa com exercícios de TCC, mindfulness e técnicas de respiração'
    },
    {
      icon: Users,
      title: 'Comunidade de Apoio',
      description: 'Conecte-se com outras pessoas em grupos de apoio moderados e seguros'
    },
    {
      icon: Activity,
      title: 'Monitoramento Inteligente',
      description: 'Acompanhe padrões de humor, sono e bem-estar com relatórios detalhados'
    },
    {
      icon: Clock,
      title: 'Suporte 24/7',
      description: 'IA terapêutica disponível sempre que você precisar de apoio emocional'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
              Cuidar da sua
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Saúde Mental </span>
              nunca foi tão acessível
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Uma plataforma completa e empática com recursos terapêuticos, comunidade de apoio e 
              monitoramento inteligente para seu bem-estar emocional. Baseado em evidências científicas 
              e projetado com amor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Começar Jornada
              </button>
              
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm">100% Confidencial & Seguro</span>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto border border-blue-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Mood Chart */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Humor Hoje</h3>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Bem-estar</span>
                        <span className="text-green-600 font-medium">8.2/10</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Atividades</h3>
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Respiração: 5 min
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Meditação: 10 min
                      </div>
                    </div>
                  </div>

                  {/* Community */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Comunidade</h3>
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-slate-600 dark:text-slate-400">2 mensagens novas</div>
                      <div className="text-slate-600 dark:text-slate-400">Grupo: Ansiedade</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Preview do seu dashboard personalizado de bem-estar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Recursos Pensados Para Você
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Cada funcionalidade foi desenvolvida com base em evidências científicas e 
              feedback de profissionais da saúde mental
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-600"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Sua Jornada de Bem-Estar Começa Agora
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Junte-se a milhares de pessoas que já transformaram sua saúde mental 
            com nossa plataforma empática e baseada em ciência
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Começar Gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
}