import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Award, Heart, Brain, Target, Clock } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PainelProps {
  onNavigate: (page: string) => void;
}

const Painel: React.FC<PainelProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    diasConsecutivos: 0,
    habitosConcluidos: 0,
    avaliacoesFeitas: 0,
    pontuacaoTotal: 0,
    humorMedio: 0,
    metasAlcancadas: 0
  });

  const [chartData, setChartData] = useState({
    humor: {
      labels: [],
      datasets: []
    },
    habitos: {
      labels: [],
      datasets: []
    },
    avaliacoes: {
      labels: [],
      datasets: []
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Carregar dados do localStorage
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
    const habitos = JSON.parse(localStorage.getItem('habitos') || '[]');
    const registrosHumor = JSON.parse(localStorage.getItem('registros_humor') || '[]');
    
    // Calcular estatísticas
    const hoje = new Date().toDateString();
    const habitosHoje = habitos.filter((h: any) => 
      h.ultimaExecucao === hoje && h.concluido
    ).length;
    
    const avaliacoesUltimos7Dias = avaliacoes.filter((a: any) => {
      const dataAvaliacao = new Date(a.criado_em);
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      return dataAvaliacao >= seteDiasAtras;
    }).length;

    const pontuacaoTotal = habitos.reduce((total: number, h: any) => total + (h.pontos || 0), 0);
    
    const humorMedio = registrosHumor.length > 0 
      ? registrosHumor.reduce((sum: number, r: any) => sum + r.valor, 0) / registrosHumor.length
      : 0;

    setStats({
      diasConsecutivos: calcularDiasConsecutivos(habitos),
      habitosConcluidos: habitosHoje,
      avaliacoesFeitas: avaliacoesUltimos7Dias,
      pontuacaoTotal,
      humorMedio: Math.round(humorMedio * 10) / 10,
      metasAlcancadas: habitos.filter((h: any) => h.concluido).length
    });

    // Preparar dados dos gráficos
    prepareChartData(avaliacoes, habitos, registrosHumor);
  };

  const calcularDiasConsecutivos = (habitos: any[]) => {
    // Lógica simplificada para calcular dias consecutivos
    let dias = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toDateString();
      
      const habitosNoDia = habitos.filter(h => h.ultimaExecucao === dataStr && h.concluido);
      
      if (habitosNoDia.length > 0) {
        dias++;
      } else {
        break;
      }
    }
    
    return dias;
  };

  const prepareChartData = (avaliacoes: any[], habitos: any[], registrosHumor: any[]) => {
    // Dados do gráfico de humor (últimos 7 dias)
    const ultimos7Dias = [];
    const valoresHumor = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      ultimos7Dias.push(dataStr);
      
      const registroDia = registrosHumor.find(r => {
        const dataRegistro = new Date(r.criado_em).toDateString();
        return dataRegistro === data.toDateString();
      });
      
      valoresHumor.push(registroDia ? registroDia.valor : 0);
    }

    // Dados do gráfico de hábitos
    const habitosLabels = habitos.slice(0, 5).map(h => h.titulo || 'Hábito');
    const habitosPontos = habitos.slice(0, 5).map(h => h.pontos || 0);

    // Dados do gráfico de avaliações por tipo
    const tiposAvaliacao = ['Ansiedade', 'Depressão', 'Estresse', 'Bem-estar'];
    const contagemTipos = tiposAvaliacao.map(tipo => 
      avaliacoes.filter(a => a.tipo === tipo).length
    );

    setChartData({
      humor: {
        labels: ultimos7Dias,
        datasets: [{
          label: 'Humor Diário',
          data: valoresHumor,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      habitos: {
        labels: habitosLabels,
        datasets: [{
          label: 'Pontos por Hábito',
          data: habitosPontos,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }]
      },
      avaliacoes: {
        labels: tiposAvaliacao,
        datasets: [{
          data: contagemTipos,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ]
        }]
      }
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }: any) => (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100 dark:bg-slate-700">
          <Icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Painel de Controle
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe seu progresso e bem-estar em tempo real
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Dias Consecutivos"
            value={stats.diasConsecutivos}
            subtitle="Mantendo hábitos"
            color="border-green-500"
            onClick={() => onNavigate('habitos')}
          />
          <StatCard
            icon={Award}
            title="Hábitos Hoje"
            value={stats.habitosConcluidos}
            subtitle="Concluídos"
            color="border-blue-500"
            onClick={() => onNavigate('habitos')}
          />
          <StatCard
            icon={Brain}
            title="Avaliações"
            value={stats.avaliacoesFeitas}
            subtitle="Últimos 7 dias"
            color="border-purple-500"
            onClick={() => onNavigate('autoavaliacoes')}
          />
          <StatCard
            icon={Heart}
            title="Humor Médio"
            value={stats.humorMedio}
            subtitle="Escala 1-10"
            color="border-pink-500"
            onClick={() => onNavigate('comunidade')}
          />
          <StatCard
            icon={Target}
            title="Pontuação Total"
            value={stats.pontuacaoTotal}
            subtitle="Pontos acumulados"
            color="border-yellow-500"
            onClick={() => onNavigate('habitos')}
          />
          <StatCard
            icon={TrendingUp}
            title="Metas Alcançadas"
            value={stats.metasAlcancadas}
            subtitle="Este mês"
            color="border-indigo-500"
            onClick={() => onNavigate('relatorios')}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Humor */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Evolução do Humor
            </h3>
            <div className="h-64">
              <Line data={chartData.humor} options={chartOptions} />
            </div>
          </div>

          {/* Gráfico de Hábitos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Pontuação por Hábito
            </h3>
            <div className="h-64">
              <Bar data={chartData.habitos} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Gráfico de Avaliações e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Avaliações */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Avaliações por Tipo
            </h3>
            <div className="h-64">
              <Doughnut data={chartData.avaliacoes} options={doughnutOptions} />
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate('autoavaliacoes')}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
              >
                <Brain className="h-6 w-6 text-purple-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Nova Avaliação</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registre seu estado atual</p>
              </button>
              
              <button
                onClick={() => onNavigate('habitos')}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
              >
                <Award className="h-6 w-6 text-green-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Marcar Hábito</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete um hábito hoje</p>
              </button>
              
              <button
                onClick={() => onNavigate('comunidade')}
                className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-left"
              >
                <Heart className="h-6 w-6 text-pink-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Registrar Humor</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Como você está se sentindo?</p>
              </button>
              
              <button
                onClick={() => onNavigate('emergencia')}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
              >
                <Target className="h-6 w-6 text-red-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Preciso de Ajuda</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acesso rápido ao suporte</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Painel;