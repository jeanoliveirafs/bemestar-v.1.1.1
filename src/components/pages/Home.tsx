import React from 'react';
import { 
  Brain, Shield, Award, Bell, Users, Sparkles, 
  PieChart, Music, BarChart3, Heart, Activity,
  ChevronRight, Zap, Target, Coffee
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  onClick: () => void;
}

/**
 * Componente de card para cada funcionalidade
 * @param props - Propriedades do card incluindo título, descrição, ícone e cores
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  gradient, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full`}
    >
      <div className="relative z-10">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        <div className="flex items-center text-white/90 text-sm font-medium">
          <span>Explorar</span>
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

interface HomeProps {
  onNavigate: (page: string) => void;
}

/**
 * Página inicial do aplicativo com cards das funcionalidades
 * @param props - Propriedades incluindo função de navegação
 */
export default function Home({ onNavigate }: HomeProps) {
  // Configuração das funcionalidades com seus respectivos dados
  const features = [
    {
      id: 'painel',
      title: 'Painel de Controle',
      description: 'Visão geral do seu progresso e estatísticas pessoais',
      icon: BarChart3,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'autoavaliacoes',
      title: 'Autoavaliações',
      description: 'Escalas psicológicas para monitorar seu bem-estar mental',
      icon: Brain,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'emergencia',
      title: 'Plano de Emergência',
      description: 'Recursos e contatos para momentos de crise',
      icon: Shield,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'habitos',
      title: 'Gamificação de Hábitos',
      description: 'Transforme hábitos saudáveis em conquistas divertidas',
      icon: Award,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'rotina',
      title: 'Rotina Personalizada',
      description: 'Crie e gerencie sua rotina diária de bem-estar',
      icon: Bell,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'comunidade',
      title: 'Mural de Emoções',
      description: 'Compartilhe experiências com nossa comunidade de apoio',
      icon: Users,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'conteudo-ia',
      title: 'Conteúdo IA',
      description: 'Artigos e recursos personalizados com inteligência artificial',
      icon: Sparkles,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'relatorios',
      title: 'Relatórios de Progresso',
      description: 'Análises detalhadas da sua jornada de bem-estar',
      icon: PieChart,
      color: 'bg-teal-500',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'mindfulness',
      title: 'Som e Mindfulness',
      description: 'Meditações guiadas e exercícios de respiração',
      icon: Music,
      color: 'bg-violet-500',
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  // Estatísticas rápidas para exibir na página inicial
  const quickStats = [
    { label: 'Dias Consecutivos', value: '7', icon: Activity, color: 'text-blue-600' },
    { label: 'Sessões Completas', value: '12', icon: Target, color: 'text-green-600' },
    { label: 'Hábitos Ativos', value: '5', icon: Coffee, color: 'text-purple-600' },
    { label: 'Progresso Semanal', value: '85%', icon: Heart, color: 'text-pink-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Refúgio Digital
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Seu espaço seguro para cuidar da saúde mental e bem-estar emocional
            </p>
          </div>
          
          {/* Mensagem de Boas-vindas */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-2xl text-white mb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta! 👋</h2>
            <p className="text-blue-100">
              Continue sua jornada de autocuidado. Cada pequeno passo importa.
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                <div className={`w-10 h-10 ${stat.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Grid de Funcionalidades */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
            Explore Nossas Funcionalidades
          </h2>
          
          {/* Grid Responsivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color={feature.color}
                gradient={feature.gradient}
                onClick={() => onNavigate(feature.id)}
              />
            ))}
          </div>
        </div>

        {/* Seção de Ação Rápida */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-800 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Pronto para começar sua jornada? 🌟
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Comece registrando como você está se sentindo hoje ou explore nossas ferramentas de bem-estar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('painel')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                Ir para Painel
              </button>
              <button 
                onClick={() => onNavigate('autoavaliacoes')}
                className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 px-8 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Fazer Autoavaliação
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            💜 Cuidar de si mesmo não é egoísmo, é necessidade. Você merece bem-estar.
          </p>
        </div>
      </div>
    </div>
  );
}