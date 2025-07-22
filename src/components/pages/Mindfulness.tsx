import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock, Heart, Waves, Wind, TreePine, Coffee, Moon, Sun, Settings, BookOpen, Award, Calendar, TrendingUp } from 'lucide-react';

interface MindfulnessProps {
  onNavigate: (page: string) => void;
}

interface SessaoMindfulness {
  id: string;
  tipo: 'meditacao' | 'respiracao' | 'som';
  titulo: string;
  duracao: number; // em segundos
  descricao: string;
  audio?: string;
  instrucoes?: string[];
  data: string;
  concluida: boolean;
}

interface ExercicioRespiracao {
  id: string;
  nome: string;
  descricao: string;
  fases: {
    nome: string;
    duracao: number;
    instrucao: string;
  }[];
  ciclos: number;
  beneficios: string[];
}

interface SomRelaxante {
  id: string;
  nome: string;
  categoria: 'natureza' | 'ambiente' | 'instrumental' | 'branco';
  icone: React.ReactNode;
  descricao: string;
  arquivo: string;
  duracao: string;
}

const Mindfulness: React.FC<MindfulnessProps> = ({ onNavigate }) => {
  const [abaSelecionada, setAbaSelecionada] = useState<'meditacao' | 'respiracao' | 'sons' | 'historico'>('meditacao');
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoMindfulness | null>(null);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [mudo, setMudo] = useState(false);
  const [exercicioRespiracao, setExercicioRespiracao] = useState<ExercicioRespiracao | null>(null);
  const [faseAtual, setFaseAtual] = useState(0);
  const [cicloAtual, setCicloAtual] = useState(0);
  const [tempoFase, setTempoFase] = useState(0);
  const [somAtivo, setSomAtivo] = useState<SomRelaxante | null>(null);
  const [sessoes, setSessoes] = useState<SessaoMindfulness[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    totalSessoes: 0,
    tempoTotal: 0,
    sequenciaAtual: 0,
    melhorSequencia: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const exerciciosRespiracao: ExercicioRespiracao[] = [
    {
      id: '4-7-8',
      nome: 'Respiração 4-7-8',
      descricao: 'Técnica calmante para reduzir ansiedade e promover relaxamento',
      fases: [
        { nome: 'Inspirar', duracao: 4, instrucao: 'Inspire pelo nariz contando até 4' },
        { nome: 'Segurar', duracao: 7, instrucao: 'Segure a respiração contando até 7' },
        { nome: 'Expirar', duracao: 8, instrucao: 'Expire pela boca contando até 8' }
      ],
      ciclos: 4,
      beneficios: ['Reduz ansiedade', 'Melhora o sono', 'Diminui o estresse']
    },
    {
      id: 'quadrada',
      nome: 'Respiração Quadrada',
      descricao: 'Respiração equilibrada para foco e concentração',
      fases: [
        { nome: 'Inspirar', duracao: 4, instrucao: 'Inspire lentamente pelo nariz' },
        { nome: 'Segurar', duracao: 4, instrucao: 'Segure o ar nos pulmões' },
        { nome: 'Expirar', duracao: 4, instrucao: 'Expire lentamente pela boca' },
        { nome: 'Pausar', duracao: 4, instrucao: 'Pause antes da próxima inspiração' }
      ],
      ciclos: 6,
      beneficios: ['Melhora concentração', 'Equilibra sistema nervoso', 'Reduz tensão']
    },
    {
      id: 'triangular',
      nome: 'Respiração Triangular',
      descricao: 'Respiração simples para iniciantes',
      fases: [
        { nome: 'Inspirar', duracao: 3, instrucao: 'Inspire profundamente' },
        { nome: 'Segurar', duracao: 3, instrucao: 'Segure suavemente' },
        { nome: 'Expirar', duracao: 3, instrucao: 'Expire completamente' }
      ],
      ciclos: 8,
      beneficios: ['Ideal para iniciantes', 'Acalma a mente', 'Fácil de praticar']
    }
  ];

  const sonsRelaxantes: SomRelaxante[] = [
    {
      id: 'chuva',
      nome: 'Chuva Suave',
      categoria: 'natureza',
      icone: <Waves className="h-6 w-6" />,
      descricao: 'Som relaxante de chuva caindo',
      arquivo: '/sounds/rain.mp3',
      duracao: '60 min'
    },
    {
      id: 'floresta',
      nome: 'Floresta',
      categoria: 'natureza',
      icone: <TreePine className="h-6 w-6" />,
      descricao: 'Sons da natureza e pássaros',
      arquivo: '/sounds/forest.mp3',
      duracao: '45 min'
    },
    {
      id: 'vento',
      nome: 'Vento Suave',
      categoria: 'natureza',
      icone: <Wind className="h-6 w-6" />,
      descricao: 'Brisa suave entre as árvores',
      arquivo: '/sounds/wind.mp3',
      duracao: '30 min'
    },
    {
      id: 'cafe',
      nome: 'Cafeteria',
      categoria: 'ambiente',
      icone: <Coffee className="h-6 w-6" />,
      descricao: 'Ambiente acolhedor de cafeteria',
      arquivo: '/sounds/cafe.mp3',
      duracao: '90 min'
    },
    {
      id: 'noturno',
      nome: 'Sons Noturnos',
      categoria: 'natureza',
      icone: <Moon className="h-6 w-6" />,
      descricao: 'Grilos e sons da noite',
      arquivo: '/sounds/night.mp3',
      duracao: '120 min'
    },
    {
      id: 'piano',
      nome: 'Piano Suave',
      categoria: 'instrumental',
      icone: <Heart className="h-6 w-6" />,
      descricao: 'Melodias suaves de piano',
      arquivo: '/sounds/piano.mp3',
      duracao: '40 min'
    }
  ];

  const meditacoesGuiadas = [
    {
      id: 'iniciante',
      titulo: 'Meditação para Iniciantes',
      duracao: 300, // 5 minutos
      descricao: 'Uma introdução suave à prática da meditação',
      instrucoes: [
        'Sente-se confortavelmente com as costas retas',
        'Feche os olhos suavemente',
        'Concentre-se na sua respiração natural',
        'Quando a mente divagar, gentilmente retorne ao foco',
        'Mantenha uma atitude de aceitação e paciência'
      ]
    },
    {
      id: 'ansiedade',
      titulo: 'Meditação para Ansiedade',
      duracao: 600, // 10 minutos
      descricao: 'Técnicas específicas para acalmar a mente ansiosa',
      instrucoes: [
        'Reconheça os pensamentos ansiosos sem julgamento',
        'Use a respiração como âncora para o presente',
        'Visualize um lugar seguro e tranquilo',
        'Pratique a aceitação dos sentimentos',
        'Cultive pensamentos de compaixão por si mesmo'
      ]
    },
    {
      id: 'sono',
      titulo: 'Meditação para o Sono',
      duracao: 900, // 15 minutos
      descricao: 'Relaxamento profundo para uma noite tranquila',
      instrucoes: [
        'Deite-se confortavelmente na cama',
        'Relaxe cada parte do corpo progressivamente',
        'Solte as tensões do dia',
        'Visualize cenários pacíficos',
        'Permita-se entrar em um estado de sonolência'
      ]
    },
    {
      id: 'gratidao',
      titulo: 'Meditação da Gratidão',
      duracao: 480, // 8 minutos
      descricao: 'Cultive sentimentos de gratidão e positividade',
      instrucoes: [
        'Reflita sobre três coisas pelas quais é grato',
        'Sinta a emoção da gratidão no seu coração',
        'Expanda essa gratidão para pessoas importantes',
        'Inclua desafios que trouxeram crescimento',
        'Termine enviando gratidão para si mesmo'
      ]
    }
  ];

  useEffect(() => {
    carregarDados();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (sessaoAtiva && tempoRestante > 0 && !pausado) {
      intervalRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            finalizarSessao();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessaoAtiva, tempoRestante, pausado]);

  useEffect(() => {
    if (exercicioRespiracao && tempoFase > 0) {
      const timer = setInterval(() => {
        setTempoFase(prev => {
          if (prev <= 1) {
            proximaFase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exercicioRespiracao, tempoFase]);

  const carregarDados = () => {
    const sessoesSalvas = JSON.parse(localStorage.getItem('sessoes_mindfulness') || '[]');
    setSessoes(sessoesSalvas);
    
    // Calcular estatísticas
    const totalSessoes = sessoesSalvas.length;
    const tempoTotal = sessoesSalvas.reduce((total: number, sessao: SessaoMindfulness) => 
      total + (sessao.concluida ? sessao.duracao : 0), 0
    );
    
    // Calcular sequência atual e melhor sequência
    let sequenciaAtual = 0;
    let melhorSequencia = 0;
    let sequenciaTemp = 0;
    
    const hoje = new Date();
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const sessaoDia = sessoesSalvas.find((s: SessaoMindfulness) => 
        s.data.startsWith(dataStr) && s.concluida
      );
      
      if (sessaoDia) {
        sequenciaTemp++;
        if (i === 0) sequenciaAtual = sequenciaTemp;
      } else {
        melhorSequencia = Math.max(melhorSequencia, sequenciaTemp);
        sequenciaTemp = 0;
      }
    }
    
    melhorSequencia = Math.max(melhorSequencia, sequenciaTemp);
    
    setEstatisticas({
      totalSessoes,
      tempoTotal,
      sequenciaAtual,
      melhorSequencia
    });
  };

  const iniciarMeditacao = (meditacao: any) => {
    const novaSessao: SessaoMindfulness = {
      id: Date.now().toString(),
      tipo: 'meditacao',
      titulo: meditacao.titulo,
      duracao: meditacao.duracao,
      descricao: meditacao.descricao,
      instrucoes: meditacao.instrucoes,
      data: new Date().toISOString(),
      concluida: false
    };
    
    setSessaoAtiva(novaSessao);
    setTempoRestante(meditacao.duracao);
    setPausado(false);
  };

  const iniciarExercicioRespiracao = (exercicio: ExercicioRespiracao) => {
    setExercicioRespiracao(exercicio);
    setFaseAtual(0);
    setCicloAtual(0);
    setTempoFase(exercicio.fases[0].duracao);
  };

  const proximaFase = () => {
    if (!exercicioRespiracao) return;
    
    const proximaFaseIndex = (faseAtual + 1) % exercicioRespiracao.fases.length;
    
    if (proximaFaseIndex === 0) {
      const proximoCiclo = cicloAtual + 1;
      if (proximoCiclo >= exercicioRespiracao.ciclos) {
        // Exercício concluído
        finalizarExercicioRespiracao();
        return;
      }
      setCicloAtual(proximoCiclo);
    }
    
    setFaseAtual(proximaFaseIndex);
    setTempoFase(exercicioRespiracao.fases[proximaFaseIndex].duracao);
  };

  const finalizarExercicioRespiracao = () => {
    if (!exercicioRespiracao) return;
    
    const novaSessao: SessaoMindfulness = {
      id: Date.now().toString(),
      tipo: 'respiracao',
      titulo: exercicioRespiracao.nome,
      duracao: exercicioRespiracao.fases.reduce((total, fase) => total + fase.duracao, 0) * exercicioRespiracao.ciclos,
      descricao: exercicioRespiracao.descricao,
      data: new Date().toISOString(),
      concluida: true
    };
    
    salvarSessao(novaSessao);
    setExercicioRespiracao(null);
    setFaseAtual(0);
    setCicloAtual(0);
    setTempoFase(0);
    
    alert('Exercício de respiração concluído! 🎉');
  };

  const pararExercicioRespiracao = () => {
    setExercicioRespiracao(null);
    setFaseAtual(0);
    setCicloAtual(0);
    setTempoFase(0);
  };

  const reproduzirSom = (som: SomRelaxante) => {
    if (somAtivo?.id === som.id) {
      // Parar som atual
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSomAtivo(null);
    } else {
      // Iniciar novo som
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Simular reprodução de áudio (em produção, usar arquivos reais)
      setSomAtivo(som);
      
      // Criar sessão de som
      const novaSessao: SessaoMindfulness = {
        id: Date.now().toString(),
        tipo: 'som',
        titulo: som.nome,
        duracao: 1800, // 30 minutos padrão
        descricao: som.descricao,
        data: new Date().toISOString(),
        concluida: false
      };
      
      setSessaoAtiva(novaSessao);
      setTempoRestante(1800);
    }
  };

  const pausarResumir = () => {
    setPausado(!pausado);
    if (audioRef.current) {
      if (pausado) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const pararSessao = () => {
    setSessaoAtiva(null);
    setTempoRestante(0);
    setPausado(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSomAtivo(null);
  };

  const finalizarSessao = () => {
    if (sessaoAtiva) {
      const sessaoConcluida = {
        ...sessaoAtiva,
        concluida: true
      };
      salvarSessao(sessaoConcluida);
      alert('Sessão concluída! 🧘‍♀️');
    }
    pararSessao();
  };

  const salvarSessao = (sessao: SessaoMindfulness) => {
    const sessoesSalvas = JSON.parse(localStorage.getItem('sessoes_mindfulness') || '[]');
    sessoesSalvas.push(sessao);
    localStorage.setItem('sessoes_mindfulness', JSON.stringify(sessoesSalvas));
    carregarDados();
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatarDuracao = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-purple-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Som e Mindfulness
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo total</p>
                <p className="text-lg font-semibold text-purple-600">
                  {formatarDuracao(estatisticas.tempoTotal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sequência</p>
                <p className="text-lg font-semibold text-green-600">
                  {estatisticas.sequenciaAtual} dias
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Pratique mindfulness, meditação e relaxe com sons da natureza
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Sessões</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.totalSessoes}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Praticado</p>
                <p className="text-2xl font-bold text-blue-600">{formatarDuracao(estatisticas.tempoTotal)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sequência Atual</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.sequenciaAtual}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Melhor Sequência</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.melhorSequencia}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Sessão Ativa */}
        {(sessaoAtiva || exercicioRespiracao) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
            <div className="text-center">
              {sessaoAtiva && (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {sessaoAtiva.titulo}
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 mb-4">
                    {formatarTempo(tempoRestante)}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={pausarResumir}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors"
                    >
                      {pausado ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                    </button>
                    <button
                      onClick={pararSessao}
                      className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </button>
                    {somAtivo && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setMudo(!mudo)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                        >
                          {mudo ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {exercicioRespiracao && (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {exercicioRespiracao.nome}
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ciclo {cicloAtual + 1} de {exercicioRespiracao.ciclos}
                    </p>
                    <p className="text-lg font-medium text-purple-600">
                      {exercicioRespiracao.fases[faseAtual].nome}
                    </p>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {tempoFase}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {exercicioRespiracao.fases[faseAtual].instrucao}
                    </p>
                  </div>
                  <button
                    onClick={pararExercicioRespiracao}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Parar Exercício
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Abas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'meditacao', nome: 'Meditação Guiada', icone: <Heart className="h-5 w-5" /> },
                { id: 'respiracao', nome: 'Exercícios de Respiração', icone: <Wind className="h-5 w-5" /> },
                { id: 'sons', nome: 'Sons Relaxantes', icone: <Volume2 className="h-5 w-5" /> },
                { id: 'historico', nome: 'Histórico', icone: <BookOpen className="h-5 w-5" /> }
              ].map((aba) => (
                <button
                  key={aba.id}
                  onClick={() => setAbaSelecionada(aba.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    abaSelecionada === aba.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {aba.icone}
                  <span>{aba.nome}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Meditação Guiada */}
            {abaSelecionada === 'meditacao' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {meditacoesGuiadas.map((meditacao) => (
                  <div key={meditacao.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {meditacao.titulo}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {formatarDuracao(meditacao.duracao)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {meditacao.descricao}
                    </p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Instruções:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {meditacao.instrucoes.map((instrucao, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {instrucao}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => iniciarMeditacao(meditacao)}
                      disabled={!!sessaoAtiva || !!exercicioRespiracao}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Meditação
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Exercícios de Respiração */}
            {abaSelecionada === 'respiracao' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exerciciosRespiracao.map((exercicio) => (
                  <div key={exercicio.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {exercicio.nome}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {exercicio.descricao}
                    </p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Benefícios:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {exercicio.beneficios.map((beneficio, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {beneficio}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exercicio.ciclos} ciclos • {exercicio.fases.length} fases
                      </p>
                    </div>
                    <button
                      onClick={() => iniciarExercicioRespiracao(exercicio)}
                      disabled={!!sessaoAtiva || !!exercicioRespiracao}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Wind className="h-4 w-4 mr-2" />
                      Iniciar Exercício
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Sons Relaxantes */}
            {abaSelecionada === 'sons' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sonsRelaxantes.map((som) => (
                  <div key={som.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="text-purple-500 mr-3">
                          {som.icone}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {som.nome}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{som.categoria}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {som.duracao}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {som.descricao}
                    </p>
                    <button
                      onClick={() => reproduzirSom(som)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                        somAtivo?.id === som.id
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {somAtivo?.id === som.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Parar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Reproduzir
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Histórico */}
            {abaSelecionada === 'historico' && (
              <div>
                {sessoes.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma sessão registrada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Comece sua jornada de mindfulness hoje!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessoes
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((sessao) => (
                        <div key={sessao.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                sessao.concluida ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {sessao.titulo}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {sessao.tipo === 'meditacao' && '🧘‍♀️ Meditação'}
                                  {sessao.tipo === 'respiracao' && '💨 Respiração'}
                                  {sessao.tipo === 'som' && '🎵 Som Relaxante'}
                                  {' • '}
                                  {new Date(sessao.data).toLocaleDateString('pt-BR')}
                                  {' • '}
                                  {formatarDuracao(sessao.duracao)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${
                                sessao.concluida ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {sessao.concluida ? 'Concluída' : 'Interrompida'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mindfulness;