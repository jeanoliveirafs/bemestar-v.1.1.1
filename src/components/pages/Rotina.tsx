import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Check, X, Bell, Target, ChevronLeft, ChevronRight } from 'lucide-react';

interface RotinaProps {
  onNavigate: (page: string) => void;
}

interface TarefaRotina {
  id: string;
  titulo: string;
  descricao: string;
  horario: string;
  categoria: string;
  cor: string;
  icone: string;
  dias_semana: number[]; // 0 = domingo, 1 = segunda, etc.
  ativo: boolean;
  criado_em: string;
  notificacao: boolean;
}

interface ExecucaoRotina {
  id: string;
  tarefa_id: string;
  data: string;
  horario_execucao?: string;
  concluido: boolean;
  observacoes?: string;
}

const Rotina: React.FC<RotinaProps> = ({ onNavigate }) => {
  const [tarefas, setTarefas] = useState<TarefaRotina[]>([]);
  const [execucoes, setExecucoes] = useState<ExecucaoRotina[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<TarefaRotina | null>(null);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<'calendario' | 'lista'>('calendario');
  const [novaTarefa, setNovaTarefa] = useState<Partial<TarefaRotina>>({
    titulo: '',
    descricao: '',
    horario: '08:00',
    categoria: 'pessoal',
    cor: 'bg-blue-500',
    icone: '📅',
    dias_semana: [1, 2, 3, 4, 5], // Segunda a sexta por padrão
    ativo: true,
    notificacao: true
  });

  const categorias = {
    pessoal: { nome: 'Pessoal', cor: 'bg-blue-500', icone: '👤' },
    trabalho: { nome: 'Trabalho', cor: 'bg-gray-500', icone: '💼' },
    saude: { nome: 'Saúde', cor: 'bg-green-500', icone: '🏥' },
    exercicio: { nome: 'Exercício', cor: 'bg-orange-500', icone: '🏃' },
    estudo: { nome: 'Estudo', cor: 'bg-purple-500', icone: '📚' },
    lazer: { nome: 'Lazer', cor: 'bg-pink-500', icone: '🎮' },
    familia: { nome: 'Família', cor: 'bg-yellow-500', icone: '👨‍👩‍👧‍👦' },
    autocuidado: { nome: 'Autocuidado', cor: 'bg-indigo-500', icone: '🧘' }
  };

  const diasSemana = [
    { id: 0, nome: 'Dom', nomeCompleto: 'Domingo' },
    { id: 1, nome: 'Seg', nomeCompleto: 'Segunda' },
    { id: 2, nome: 'Ter', nomeCompleto: 'Terça' },
    { id: 3, nome: 'Qua', nomeCompleto: 'Quarta' },
    { id: 4, nome: 'Qui', nomeCompleto: 'Quinta' },
    { id: 5, nome: 'Sex', nomeCompleto: 'Sexta' },
    { id: 6, nome: 'Sáb', nomeCompleto: 'Sábado' }
  ];

  const coresDisponiveis = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500'
  ];

  const iconesDisponiveis = [
    '📅', '⏰', '💼', '🏃', '📚', '🧘', '🍽️', '💊',
    '🎯', '🎨', '🎵', '📝', '🏆', '⭐', '🔥', '💎'
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const tarefasSalvas = localStorage.getItem('tarefas_rotina');
    const execucoesSalvas = localStorage.getItem('execucoes_rotina');
    
    if (tarefasSalvas) {
      setTarefas(JSON.parse(tarefasSalvas));
    }
    
    if (execucoesSalvas) {
      setExecucoes(JSON.parse(execucoesSalvas));
    }
  };

  const salvarTarefas = (novasTarefas: TarefaRotina[]) => {
    localStorage.setItem('tarefas_rotina', JSON.stringify(novasTarefas));
    setTarefas(novasTarefas);
  };

  const salvarExecucoes = (novasExecucoes: ExecucaoRotina[]) => {
    localStorage.setItem('execucoes_rotina', JSON.stringify(novasExecucoes));
    setExecucoes(novasExecucoes);
  };

  const adicionarTarefa = () => {
    if (!novaTarefa.titulo) {
      alert('Título é obrigatório');
      return;
    }

    if (!novaTarefa.dias_semana || novaTarefa.dias_semana.length === 0) {
      alert('Selecione pelo menos um dia da semana');
      return;
    }

    const tarefa: TarefaRotina = {
      id: Date.now().toString(),
      titulo: novaTarefa.titulo!,
      descricao: novaTarefa.descricao || '',
      horario: novaTarefa.horario || '08:00',
      categoria: novaTarefa.categoria || 'pessoal',
      cor: novaTarefa.cor || 'bg-blue-500',
      icone: novaTarefa.icone || '📅',
      dias_semana: novaTarefa.dias_semana!,
      ativo: true,
      criado_em: new Date().toISOString(),
      notificacao: novaTarefa.notificacao || false
    };

    salvarTarefas([...tarefas, tarefa]);
    setNovaTarefa({
      titulo: '',
      descricao: '',
      horario: '08:00',
      categoria: 'pessoal',
      cor: 'bg-blue-500',
      icone: '📅',
      dias_semana: [1, 2, 3, 4, 5],
      ativo: true,
      notificacao: true
    });
    setMostrarFormulario(false);
  };

  const editarTarefa = () => {
    if (!tarefaEditando || !tarefaEditando.titulo) {
      alert('Título é obrigatório');
      return;
    }

    if (!tarefaEditando.dias_semana || tarefaEditando.dias_semana.length === 0) {
      alert('Selecione pelo menos um dia da semana');
      return;
    }

    const tarefasAtualizadas = tarefas.map(t => 
      t.id === tarefaEditando.id ? tarefaEditando : t
    );
    
    salvarTarefas(tarefasAtualizadas);
    setTarefaEditando(null);
  };

  const removerTarefa = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta tarefa?')) {
      const tarefasAtualizadas = tarefas.filter(t => t.id !== id);
      const execucoesAtualizadas = execucoes.filter(e => e.tarefa_id !== id);
      
      salvarTarefas(tarefasAtualizadas);
      salvarExecucoes(execucoesAtualizadas);
    }
  };

  const marcarExecucao = (tarefaId: string, data: string, concluido: boolean) => {
    const execucaoExistente = execucoes.find(e => 
      e.tarefa_id === tarefaId && e.data === data
    );

    let novasExecucoes;
    if (execucaoExistente) {
      novasExecucoes = execucoes.map(e => 
        e.id === execucaoExistente.id 
          ? { ...e, concluido, horario_execucao: concluido ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined }
          : e
      );
    } else {
      const novaExecucao: ExecucaoRotina = {
        id: Date.now().toString(),
        tarefa_id: tarefaId,
        data,
        concluido,
        horario_execucao: concluido ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined
      };
      novasExecucoes = [...execucoes, novaExecucao];
    }

    salvarExecucoes(novasExecucoes);
  };

  const obterStatusExecucao = (tarefaId: string, data: string) => {
    const execucao = execucoes.find(e => 
      e.tarefa_id === tarefaId && e.data === data
    );
    return execucao?.concluido || false;
  };

  const obterTarefasDoDia = (data: Date) => {
    const diaSemana = data.getDay();
    return tarefas.filter(t => 
      t.ativo && t.dias_semana.includes(diaSemana)
    ).sort((a, b) => a.horario.localeCompare(b.horario));
  };

  const calcularEstatisticas = () => {
    const hoje = new Date().toDateString();
    const tarefasHoje = obterTarefasDoDia(new Date());
    const execucoesHoje = execucoes.filter(e => e.data === hoje && e.concluido);
    
    const ultimaSemana = new Date();
    ultimaSemana.setDate(ultimaSemana.getDate() - 7);
    
    const execucoesUltimaSemana = execucoes.filter(e => {
      const dataExecucao = new Date(e.data);
      return dataExecucao >= ultimaSemana && e.concluido;
    });

    return {
      tarefasHoje: tarefasHoje.length,
      concluidasHoje: execucoesHoje.length,
      percentualHoje: tarefasHoje.length > 0 ? Math.round((execucoesHoje.length / tarefasHoje.length) * 100) : 0,
      execucoesUltimaSemana: execucoesUltimaSemana.length,
      tarefasAtivas: tarefas.filter(t => t.ativo).length
    };
  };

  const gerarCalendario = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias = [];
    
    // Dias do mês anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const data = new Date(ano, mes, -i);
      dias.push({ data, outroMes: true });
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      dias.push({ data, outroMes: false });
    }
    
    // Dias do próximo mês para completar a grade
    const diasRestantes = 42 - dias.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const data = new Date(ano, mes + 1, dia);
      dias.push({ data, outroMes: true });
    }

    return dias;
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataAtual);
    if (direcao === 'anterior') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else {
      novaData.setMonth(novaData.getMonth() + 1);
    }
    setDataAtual(novaData);
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const estatisticas = calcularEstatisticas();
  const diasCalendario = gerarCalendario();
  const hoje = new Date().toDateString();
  const tarefasHoje = obterTarefasDoDia(new Date());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Rotina Personalizada
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setVisualizacao('calendario')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    visualizacao === 'calendario'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Calendário
                </button>
                <button
                  onClick={() => setVisualizacao('lista')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    visualizacao === 'lista'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Lista
                </button>
              </div>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Organize sua rotina diária e acompanhe seu progresso
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tarefas Hoje</p>
                <p className="text-3xl font-bold text-blue-600">{estatisticas.tarefasHoje}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
                <p className="text-3xl font-bold text-green-600">{estatisticas.concluidasHoje}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso</p>
                <p className="text-3xl font-bold text-yellow-600">{estatisticas.percentualHoje}%</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</p>
                <p className="text-3xl font-bold text-purple-600">{estatisticas.execucoesUltimaSemana}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tarefas Ativas</p>
                <p className="text-3xl font-bold text-indigo-600">{estatisticas.tarefasAtivas}</p>
              </div>
              <Bell className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Visualização Calendário */}
        {visualizacao === 'calendario' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
            {/* Navegação do Calendário */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navegarMes('anterior')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                onClick={() => navegarMes('proximo')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {diasSemana.map((dia) => (
                <div key={dia.id} className="p-2 text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {dia.nome}
                  </span>
                </div>
              ))}
            </div>

            {/* Grade do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {diasCalendario.map((item, index) => {
                const dataStr = item.data.toDateString();
                const tarefasDia = obterTarefasDoDia(item.data);
                const execucoesDia = execucoes.filter(e => e.data === dataStr && e.concluido);
                const isHoje = dataStr === hoje;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                      item.outroMes 
                        ? 'bg-gray-50 dark:bg-slate-700/50' 
                        : 'bg-white dark:bg-slate-800'
                    } ${
                      isHoje ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      item.outroMes 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : isHoje
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.data.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {tarefasDia.slice(0, 3).map((tarefa) => {
                        const concluida = obterStatusExecucao(tarefa.id, dataStr);
                        
                        return (
                          <div
                            key={tarefa.id}
                            className={`text-xs p-1 rounded cursor-pointer transition-all ${
                              concluida
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 line-through'
                                : `${tarefa.cor.replace('bg-', 'bg-').replace('-500', '-100')} dark:${tarefa.cor.replace('bg-', 'bg-').replace('-500', '-900/30')} text-gray-800 dark:text-gray-200`
                            }`}
                            onClick={() => marcarExecucao(tarefa.id, dataStr, !concluida)}
                            title={`${tarefa.titulo} - ${tarefa.horario}`}
                          >
                            <div className="flex items-center">
                              <span className="mr-1">{tarefa.icone}</span>
                              <span className="truncate">{tarefa.titulo}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {tarefasDia.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{tarefasDia.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visualização Lista */}
        {visualizacao === 'lista' && (
          <div className="space-y-6">
            {/* Tarefas de Hoje */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Tarefas de Hoje - {formatarData(new Date())}
              </h2>
              
              {tarefasHoje.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma tarefa para hoje
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aproveite seu dia livre ou adicione novas tarefas à sua rotina!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tarefasHoje.map((tarefa) => {
                    const concluida = obterStatusExecucao(tarefa.id, hoje);
                    
                    return (
                      <div key={tarefa.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
                        <div className={`w-12 h-12 ${tarefa.cor} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                          {tarefa.icone}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${
                              concluida 
                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {tarefa.titulo}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {tarefa.horario}
                              </span>
                              <button
                                onClick={() => setTarefaEditando(tarefa)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removerTarefa(tarefa.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {tarefa.descricao && (
                            <p className={`text-sm mt-1 ${
                              concluida 
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {tarefa.descricao}
                            </p>
                          )}
                          
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              categorias[tarefa.categoria as keyof typeof categorias].cor.replace('bg-', 'bg-').replace('-500', '-100')
                            } text-gray-800 dark:text-gray-200`}>
                              {categorias[tarefa.categoria as keyof typeof categorias].nome}
                            </span>
                            
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>Dias: </span>
                              {tarefa.dias_semana.map(dia => diasSemana[dia].nome).join(', ')}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => marcarExecucao(tarefa.id, hoje, !concluida)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                            concluida
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {concluida ? (
                            <>
                              <Check className="h-4 w-4 inline mr-1" />
                              Concluída
                            </>
                          ) : (
                            'Marcar como Feita'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Todas as Tarefas */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Todas as Tarefas ({tarefas.filter(t => t.ativo).length})
              </h2>
              
              {tarefas.filter(t => t.ativo).length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma tarefa cadastrada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Comece criando sua primeira tarefa e organize sua rotina!
                  </p>
                  <button
                    onClick={() => setMostrarFormulario(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Criar Primeira Tarefa
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tarefas.filter(t => t.ativo).map((tarefa) => (
                    <div key={tarefa.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className={`w-10 h-10 ${tarefa.cor} rounded-full flex items-center justify-center text-white mr-4`}>
                        {tarefa.icone}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {tarefa.titulo}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {tarefa.horario}
                            </span>
                            <button
                              onClick={() => setTarefaEditando(tarefa)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removerTarefa(tarefa.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {tarefa.descricao && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {tarefa.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            categorias[tarefa.categoria as keyof typeof categorias].cor.replace('bg-', 'bg-').replace('-500', '-100')
                          } text-gray-800 dark:text-gray-200`}>
                            {categorias[tarefa.categoria as keyof typeof categorias].nome}
                          </span>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>Dias: </span>
                            {tarefa.dias_semana.map(dia => diasSemana[dia].nome).join(', ')}
                          </div>
                          
                          {tarefa.notificacao && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Bell className="h-3 w-3 mr-1" />
                              Notificação
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Adicionar/Editar Tarefa */}
        {(mostrarFormulario || tarefaEditando) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {tarefaEditando ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={tarefaEditando ? tarefaEditando.titulo : novaTarefa.titulo}
                    onChange={(e) => {
                      if (tarefaEditando) {
                        setTarefaEditando({ ...tarefaEditando, titulo: e.target.value });
                      } else {
                        setNovaTarefa({ ...novaTarefa, titulo: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Ex: Exercitar-se"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={tarefaEditando ? tarefaEditando.descricao : novaTarefa.descricao}
                    onChange={(e) => {
                      if (tarefaEditando) {
                        setTarefaEditando({ ...tarefaEditando, descricao: e.target.value });
                      } else {
                        setNovaTarefa({ ...novaTarefa, descricao: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Descrição opcional da tarefa"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={tarefaEditando ? tarefaEditando.horario : novaTarefa.horario}
                      onChange={(e) => {
                        if (tarefaEditando) {
                          setTarefaEditando({ ...tarefaEditando, horario: e.target.value });
                        } else {
                          setNovaTarefa({ ...novaTarefa, horario: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <select
                      value={tarefaEditando ? tarefaEditando.categoria : novaTarefa.categoria}
                      onChange={(e) => {
                        if (tarefaEditando) {
                          setTarefaEditando({ ...tarefaEditando, categoria: e.target.value });
                        } else {
                          setNovaTarefa({ ...novaTarefa, categoria: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      {Object.entries(categorias).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dias da Semana *
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {diasSemana.map((dia) => {
                      const selecionado = tarefaEditando 
                        ? tarefaEditando.dias_semana.includes(dia.id)
                        : novaTarefa.dias_semana?.includes(dia.id);
                      
                      return (
                        <button
                          key={dia.id}
                          type="button"
                          onClick={() => {
                            const diasAtuais = tarefaEditando ? tarefaEditando.dias_semana : (novaTarefa.dias_semana || []);
                            const novosDias = selecionado
                              ? diasAtuais.filter(d => d !== dia.id)
                              : [...diasAtuais, dia.id];
                            
                            if (tarefaEditando) {
                              setTarefaEditando({ ...tarefaEditando, dias_semana: novosDias });
                            } else {
                              setNovaTarefa({ ...novaTarefa, dias_semana: novosDias });
                            }
                          }}
                          className={`p-2 text-xs font-medium rounded border transition-colors ${
                            selecionado
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {dia.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {coresDisponiveis.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => {
                          if (tarefaEditando) {
                            setTarefaEditando({ ...tarefaEditando, cor });
                          } else {
                            setNovaTarefa({ ...novaTarefa, cor });
                          }
                        }}
                        className={`w-8 h-8 ${cor} rounded-full border-2 ${
                          (tarefaEditando ? tarefaEditando.cor : novaTarefa.cor) === cor
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
                        type="button"
                        onClick={() => {
                          if (tarefaEditando) {
                            setTarefaEditando({ ...tarefaEditando, icone });
                          } else {
                            setNovaTarefa({ ...novaTarefa, icone });
                          }
                        }}
                        className={`w-8 h-8 text-lg border rounded ${
                          (tarefaEditando ? tarefaEditando.icone : novaTarefa.icone) === icone
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {icone}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notificacao"
                    checked={tarefaEditando ? tarefaEditando.notificacao : novaTarefa.notificacao}
                    onChange={(e) => {
                      if (tarefaEditando) {
                        setTarefaEditando({ ...tarefaEditando, notificacao: e.target.checked });
                      } else {
                        setNovaTarefa({ ...novaTarefa, notificacao: e.target.checked });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notificacao" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Ativar notificações
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setTarefaEditando(null);
                    setNovaTarefa({
                      titulo: '',
                      descricao: '',
                      horario: '08:00',
                      categoria: 'pessoal',
                      cor: 'bg-blue-500',
                      icone: '📅',
                      dias_semana: [1, 2, 3, 4, 5],
                      ativo: true,
                      notificacao: true
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={tarefaEditando ? editarTarefa : adicionarTarefa}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {tarefaEditando ? 'Salvar' : 'Criar Tarefa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rotina;