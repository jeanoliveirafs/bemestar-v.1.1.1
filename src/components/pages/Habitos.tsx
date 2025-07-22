import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Target, Calendar, Flame, Star, Edit, Trash2, Check, X } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface HabitosProps {
  onNavigate: (page: string) => void;
}

interface Habito {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  frequencia: 'diario' | 'semanal' | 'mensal';
  meta: number;
  pontos: number;
  cor: string;
  icone: string;
  criado_em: string;
  ativo: boolean;
  sequencia_atual: number;
  melhor_sequencia: number;
  total_execucoes: number;
  ultima_execucao?: string;
}

interface RegistroHabito {
  id: string;
  habito_id: string;
  data: string;
  concluido: boolean;
  observacoes?: string;
}

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  condicao: string;
  desbloqueada: boolean;
  data_desbloqueio?: string;
}

const Habitos: React.FC<HabitosProps> = ({ onNavigate }) => {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [registros, setRegistros] = useState<RegistroHabito[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [habitoEditando, setHabitoEditando] = useState<Habito | null>(null);
  const [novoHabito, setNovoHabito] = useState<Partial<Habito>>({
    titulo: '',
    descricao: '',
    categoria: 'saude',
    frequencia: 'diario',
    meta: 1,
    pontos: 10,
    cor: 'bg-blue-500',
    icone: '💪',
    ativo: true
  });

  const categorias = {
    saude: { nome: 'Saúde', cor: 'bg-green-500', icone: '🏥' },
    exercicio: { nome: 'Exercício', cor: 'bg-orange-500', icone: '🏃' },
    alimentacao: { nome: 'Alimentação', cor: 'bg-yellow-500', icone: '🥗' },
    sono: { nome: 'Sono', cor: 'bg-purple-500', icone: '😴' },
    mindfulness: { nome: 'Mindfulness', cor: 'bg-pink-500', icone: '🧘' },
    social: { nome: 'Social', cor: 'bg-blue-500', icone: '👥' },
    trabalho: { nome: 'Trabalho', cor: 'bg-gray-500', icone: '💼' },
    hobby: { nome: 'Hobby', cor: 'bg-indigo-500', icone: '🎨' }
  };

  const coresDisponiveis = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500'
  ];

  const iconesDisponiveis = [
    '💪', '🏃', '🥗', '💧', '📚', '🧘', '😴', '🎯',
    '🌱', '🎨', '🎵', '📝', '🏆', '⭐', '🔥', '💎'
  ];

  useEffect(() => {
    carregarDados();
    inicializarConquistas();
  }, []);

  const carregarDados = () => {
    const habitosSalvos = localStorage.getItem('habitos');
    const registrosSalvos = localStorage.getItem('registros_habitos');
    
    if (habitosSalvos) {
      setHabitos(JSON.parse(habitosSalvos));
    }
    
    if (registrosSalvos) {
      setRegistros(JSON.parse(registrosSalvos));
    }
  };

  const inicializarConquistas = () => {
    const conquistasPadrao: Conquista[] = [
      {
        id: '1',
        titulo: 'Primeiro Passo',
        descricao: 'Complete seu primeiro hábito',
        icone: '🎯',
        cor: 'bg-green-500',
        condicao: 'primeiro_habito',
        desbloqueada: false
      },
      {
        id: '2',
        titulo: 'Sequência de 3',
        descricao: 'Mantenha um hábito por 3 dias consecutivos',
        icone: '🔥',
        cor: 'bg-orange-500',
        condicao: 'sequencia_3',
        desbloqueada: false
      },
      {
        id: '3',
        titulo: 'Sequência de 7',
        descricao: 'Mantenha um hábito por 7 dias consecutivos',
        icone: '⭐',
        cor: 'bg-yellow-500',
        condicao: 'sequencia_7',
        desbloqueada: false
      },
      {
        id: '4',
        titulo: 'Colecionador',
        descricao: 'Tenha 5 hábitos ativos',
        icone: '📚',
        cor: 'bg-blue-500',
        condicao: 'cinco_habitos',
        desbloqueada: false
      },
      {
        id: '5',
        titulo: 'Mestre dos Hábitos',
        descricao: 'Acumule 1000 pontos',
        icone: '👑',
        cor: 'bg-purple-500',
        condicao: 'mil_pontos',
        desbloqueada: false
      },
      {
        id: '6',
        titulo: 'Sequência de 30',
        descricao: 'Mantenha um hábito por 30 dias consecutivos',
        icone: '💎',
        cor: 'bg-indigo-500',
        condicao: 'sequencia_30',
        desbloqueada: false
      }
    ];

    const conquistasSalvas = localStorage.getItem('conquistas');
    if (conquistasSalvas) {
      setConquistas(JSON.parse(conquistasSalvas));
    } else {
      setConquistas(conquistasPadrao);
      localStorage.setItem('conquistas', JSON.stringify(conquistasPadrao));
    }
  };

  const salvarHabitos = (novosHabitos: Habito[]) => {
    localStorage.setItem('habitos', JSON.stringify(novosHabitos));
    setHabitos(novosHabitos);
  };

  const salvarRegistros = (novosRegistros: RegistroHabito[]) => {
    localStorage.setItem('registros_habitos', JSON.stringify(novosRegistros));
    setRegistros(novosRegistros);
  };

  const adicionarHabito = () => {
    if (!novoHabito.titulo) {
      alert('Título é obrigatório');
      return;
    }

    const habito: Habito = {
      id: Date.now().toString(),
      titulo: novoHabito.titulo!,
      descricao: novoHabito.descricao || '',
      categoria: novoHabito.categoria || 'saude',
      frequencia: novoHabito.frequencia || 'diario',
      meta: novoHabito.meta || 1,
      pontos: novoHabito.pontos || 10,
      cor: novoHabito.cor || 'bg-blue-500',
      icone: novoHabito.icone || '💪',
      criado_em: new Date().toISOString(),
      ativo: true,
      sequencia_atual: 0,
      melhor_sequencia: 0,
      total_execucoes: 0
    };

    salvarHabitos([...habitos, habito]);
    setNovoHabito({
      titulo: '',
      descricao: '',
      categoria: 'saude',
      frequencia: 'diario',
      meta: 1,
      pontos: 10,
      cor: 'bg-blue-500',
      icone: '💪',
      ativo: true
    });
    setMostrarFormulario(false);
    verificarConquistas();
  };

  const editarHabito = () => {
    if (!habitoEditando || !habitoEditando.titulo) {
      alert('Título é obrigatório');
      return;
    }

    const habitosAtualizados = habitos.map(h => 
      h.id === habitoEditando.id ? habitoEditando : h
    );
    
    salvarHabitos(habitosAtualizados);
    setHabitoEditando(null);
  };

  const removerHabito = (id: string) => {
    if (confirm('Tem certeza que deseja remover este hábito?')) {
      const habitosAtualizados = habitos.filter(h => h.id !== id);
      const registrosAtualizados = registros.filter(r => r.habito_id !== id);
      
      salvarHabitos(habitosAtualizados);
      salvarRegistros(registrosAtualizados);
    }
  };

  const marcarHabito = (habitoId: string, concluido: boolean) => {
    const hoje = new Date().toDateString();
    const registroExistente = registros.find(r => 
      r.habito_id === habitoId && r.data === hoje
    );

    let novosRegistros;
    if (registroExistente) {
      novosRegistros = registros.map(r => 
        r.id === registroExistente.id ? { ...r, concluido } : r
      );
    } else {
      const novoRegistro: RegistroHabito = {
        id: Date.now().toString(),
        habito_id: habitoId,
        data: hoje,
        concluido
      };
      novosRegistros = [...registros, novoRegistro];
    }

    salvarRegistros(novosRegistros);
    atualizarEstatisticasHabito(habitoId, novosRegistros);
    verificarConquistas();
  };

  const atualizarEstatisticasHabito = (habitoId: string, novosRegistros: RegistroHabito[]) => {
    const habito = habitos.find(h => h.id === habitoId);
    if (!habito) return;

    const registrosHabito = novosRegistros
      .filter(r => r.habito_id === habitoId && r.concluido)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    const totalExecucoes = registrosHabito.length;
    let sequenciaAtual = 0;
    let melhorSequencia = 0;
    let sequenciaTemp = 0;

    // Calcular sequência atual (dos últimos dias)
    const hoje = new Date();
    for (let i = 0; i < 365; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toDateString();
      
      const registroDia = novosRegistros.find(r => 
        r.habito_id === habitoId && r.data === dataStr && r.concluido
      );
      
      if (registroDia) {
        if (i === 0 || sequenciaAtual > 0) {
          sequenciaAtual++;
        }
      } else {
        break;
      }
    }

    // Calcular melhor sequência
    for (const registro of registrosHabito) {
      sequenciaTemp++;
      melhorSequencia = Math.max(melhorSequencia, sequenciaTemp);
    }

    const habitoAtualizado = {
      ...habito,
      total_execucoes: totalExecucoes,
      sequencia_atual: sequenciaAtual,
      melhor_sequencia: melhorSequencia,
      ultima_execucao: registrosHabito.length > 0 ? registrosHabito[registrosHabito.length - 1].data : undefined
    };

    const habitosAtualizados = habitos.map(h => 
      h.id === habitoId ? habitoAtualizado : h
    );
    
    salvarHabitos(habitosAtualizados);
  };

  const verificarConquistas = () => {
    const conquistasAtualizadas = [...conquistas];
    let novasConquistas = false;

    // Verificar primeira execução
    if (registros.some(r => r.concluido) && !conquistas.find(c => c.id === '1')?.desbloqueada) {
      const conquista = conquistasAtualizadas.find(c => c.id === '1');
      if (conquista) {
        conquista.desbloqueada = true;
        conquista.data_desbloqueio = new Date().toISOString();
        novasConquistas = true;
      }
    }

    // Verificar sequências
    habitos.forEach(habito => {
      if (habito.sequencia_atual >= 3 && !conquistas.find(c => c.id === '2')?.desbloqueada) {
        const conquista = conquistasAtualizadas.find(c => c.id === '2');
        if (conquista) {
          conquista.desbloqueada = true;
          conquista.data_desbloqueio = new Date().toISOString();
          novasConquistas = true;
        }
      }
      
      if (habito.sequencia_atual >= 7 && !conquistas.find(c => c.id === '3')?.desbloqueada) {
        const conquista = conquistasAtualizadas.find(c => c.id === '3');
        if (conquista) {
          conquista.desbloqueada = true;
          conquista.data_desbloqueio = new Date().toISOString();
          novasConquistas = true;
        }
      }
      
      if (habito.sequencia_atual >= 30 && !conquistas.find(c => c.id === '6')?.desbloqueada) {
        const conquista = conquistasAtualizadas.find(c => c.id === '6');
        if (conquista) {
          conquista.desbloqueada = true;
          conquista.data_desbloqueio = new Date().toISOString();
          novasConquistas = true;
        }
      }
    });

    // Verificar cinco hábitos
    if (habitos.filter(h => h.ativo).length >= 5 && !conquistas.find(c => c.id === '4')?.desbloqueada) {
      const conquista = conquistasAtualizadas.find(c => c.id === '4');
      if (conquista) {
        conquista.desbloqueada = true;
        conquista.data_desbloqueio = new Date().toISOString();
        novasConquistas = true;
      }
    }

    // Verificar mil pontos
    const totalPontos = habitos.reduce((total, h) => total + (h.total_execucoes * h.pontos), 0);
    if (totalPontos >= 1000 && !conquistas.find(c => c.id === '5')?.desbloqueada) {
      const conquista = conquistasAtualizadas.find(c => c.id === '5');
      if (conquista) {
        conquista.desbloqueada = true;
        conquista.data_desbloqueio = new Date().toISOString();
        novasConquistas = true;
      }
    }

    if (novasConquistas) {
      setConquistas(conquistasAtualizadas);
      localStorage.setItem('conquistas', JSON.stringify(conquistasAtualizadas));
    }
  };

  const obterStatusHoje = (habitoId: string) => {
    const hoje = new Date().toDateString();
    const registro = registros.find(r => 
      r.habito_id === habitoId && r.data === hoje
    );
    return registro?.concluido || false;
  };

  const calcularPontuacaoTotal = () => {
    return habitos.reduce((total, h) => total + (h.total_execucoes * h.pontos), 0);
  };

  const prepararDadosGrafico = () => {
    const categoriaStats = Object.keys(categorias).map(cat => {
      const habitosCategoria = habitos.filter(h => h.categoria === cat);
      const execucoes = habitosCategoria.reduce((total, h) => total + h.total_execucoes, 0);
      return {
        categoria: categorias[cat as keyof typeof categorias].nome,
        execucoes
      };
    }).filter(stat => stat.execucoes > 0);

    return {
      labels: categoriaStats.map(s => s.categoria),
      datasets: [{
        data: categoriaStats.map(s => s.execucoes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ]
      }]
    };
  };

  const chartOptions = {
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gamificação de Hábitos
              </h1>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Hábito
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Transforme seus cuidados diários em conquistas divertidas
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontuação Total</p>
                <p className="text-3xl font-bold text-yellow-600">{calcularPontuacaoTotal()}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hábitos Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{habitos.filter(h => h.ativo).length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Melhor Sequência</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.max(...habitos.map(h => h.melhor_sequencia), 0)}
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conquistas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {conquistas.filter(c => c.desbloqueada).length}/{conquistas.length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Hábitos de Hoje */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-green-500" />
            Hábitos de Hoje
          </h2>
          
          {habitos.filter(h => h.ativo).length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum hábito cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece criando seu primeiro hábito e transforme sua rotina em um jogo!
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Criar Primeiro Hábito
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitos.filter(h => h.ativo).map((habito) => {
                const concluido = obterStatusHoje(habito.id);
                
                return (
                  <div key={habito.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${habito.cor} rounded-full flex items-center justify-center text-white text-xl mr-3`}>
                          {habito.icone}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {habito.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {categorias[habito.categoria as keyof typeof categorias].nome}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setHabitoEditando(habito)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removerHabito(habito.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {habito.descricao && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {habito.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Flame className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {habito.sequencia_atual} dias
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {habito.pontos} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => marcarHabito(habito.id, !concluido)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                        concluido
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {concluido ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Concluído!
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Marcar como Feito
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conquistas e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conquistas */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Conquistas
            </h3>
            <div className="space-y-3">
              {conquistas.map((conquista) => (
                <div key={conquista.id} className={`flex items-center p-3 rounded-lg ${
                  conquista.desbloqueada 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 ${
                    conquista.desbloqueada ? conquista.cor : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {conquista.desbloqueada ? conquista.icone : '🔒'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      conquista.desbloqueada 
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {conquista.titulo}
                    </h4>
                    <p className={`text-sm ${
                      conquista.desbloqueada 
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {conquista.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico por Categoria */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Execuções por Categoria
            </h3>
            <div className="h-64">
              <Doughnut data={prepararDadosGrafico()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Modal de Adicionar/Editar Hábito */}
        {(mostrarFormulario || habitoEditando) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {habitoEditando ? 'Editar Hábito' : 'Novo Hábito'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={habitoEditando ? habitoEditando.titulo : novoHabito.titulo}
                    onChange={(e) => {
                      if (habitoEditando) {
                        setHabitoEditando({ ...habitoEditando, titulo: e.target.value });
                      } else {
                        setNovoHabito({ ...novoHabito, titulo: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Ex: Beber 2L de água"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={habitoEditando ? habitoEditando.descricao : novoHabito.descricao}
                    onChange={(e) => {
                      if (habitoEditando) {
                        setHabitoEditando({ ...habitoEditando, descricao: e.target.value });
                      } else {
                        setNovoHabito({ ...novoHabito, descricao: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Descrição opcional do hábito"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={habitoEditando ? habitoEditando.categoria : novoHabito.categoria}
                    onChange={(e) => {
                      if (habitoEditando) {
                        setHabitoEditando({ ...habitoEditando, categoria: e.target.value });
                      } else {
                        setNovoHabito({ ...novoHabito, categoria: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {Object.entries(categorias).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pontos por Execução
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={habitoEditando ? habitoEditando.pontos : novoHabito.pontos}
                    onChange={(e) => {
                      if (habitoEditando) {
                        setHabitoEditando({ ...habitoEditando, pontos: parseInt(e.target.value) });
                      } else {
                        setNovoHabito({ ...novoHabito, pontos: parseInt(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {coresDisponiveis.map((cor) => (
                      <button
                        key={cor}
                        onClick={() => {
                          if (habitoEditando) {
                            setHabitoEditando({ ...habitoEditando, cor });
                          } else {
                            setNovoHabito({ ...novoHabito, cor });
                          }
                        }}
                        className={`w-8 h-8 ${cor} rounded-full border-2 ${
                          (habitoEditando ? habitoEditando.cor : novoHabito.cor) === cor
                            ? 'border-gray-900 dark:border-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconesDisponiveis.map((icone) => (
                      <button
                        key={icone}
                        onClick={() => {
                          if (habitoEditando) {
                            setHabitoEditando({ ...habitoEditando, icone });
                          } else {
                            setNovoHabito({ ...novoHabito, icone });
                          }
                        }}
                        className={`w-8 h-8 text-lg border rounded ${
                          (habitoEditando ? habitoEditando.icone : novoHabito.icone) === icone
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {icone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setHabitoEditando(null);
                    setNovoHabito({
                      titulo: '',
                      descricao: '',
                      categoria: 'saude',
                      frequencia: 'diario',
                      meta: 1,
                      pontos: 10,
                      cor: 'bg-blue-500',
                      icone: '💪',
                      ativo: true
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={habitoEditando ? editarHabito : adicionarHabito}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {habitoEditando ? 'Salvar' : 'Criar Hábito'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Habitos;