import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Calendar, Save, BarChart3, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AutoavaliacoesProps {
  onNavigate: (page: string) => void;
}

interface Avaliacao {
  id: string;
  tipo: string;
  valor: number;
  respostas: number[];
  criado_em: string;
}

const Autoavaliacoes: React.FC<AutoavaliacoesProps> = ({ onNavigate }) => {
  const [avaliacaoAtiva, setAvaliacaoAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [historico, setHistorico] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(false);

  const escalas = {
    ansiedade: {
      nome: 'Escala de Ansiedade (GAD-7)',
      descricao: 'Avalia sintomas de ansiedade generalizada',
      perguntas: [
        'Sentir-se nervoso, ansioso ou muito tenso',
        'Não conseguir parar ou controlar as preocupações',
        'Preocupar-se muito com diversas coisas',
        'Dificuldade para relaxar',
        'Ficar tão agitado que se torna difícil permanecer parado',
        'Ficar facilmente aborrecido ou irritado',
        'Sentir medo como se algo terrível fosse acontecer'
      ],
      opcoes: [
        { valor: 0, texto: 'Nenhuma vez' },
        { valor: 1, texto: 'Vários dias' },
        { valor: 2, texto: 'Mais da metade dos dias' },
        { valor: 3, texto: 'Quase todos os dias' }
      ],
      interpretacao: {
        0: { nivel: 'Mínima', cor: 'text-green-600', bg: 'bg-green-50' },
        5: { nivel: 'Leve', cor: 'text-yellow-600', bg: 'bg-yellow-50' },
        10: { nivel: 'Moderada', cor: 'text-orange-600', bg: 'bg-orange-50' },
        15: { nivel: 'Severa', cor: 'text-red-600', bg: 'bg-red-50' }
      }
    },
    depressao: {
      nome: 'Escala de Depressão (PHQ-9)',
      descricao: 'Avalia sintomas depressivos',
      perguntas: [
        'Pouco interesse ou prazer em fazer as coisas',
        'Sentir-se desanimado, deprimido ou sem esperança',
        'Dificuldade para adormecer, continuar dormindo ou dormir demais',
        'Sentir-se cansado ou com pouca energia',
        'Falta de apetite ou comer demais',
        'Sentir-se mal consigo mesmo ou que é um fracasso',
        'Dificuldade de concentração',
        'Movimentar-se ou falar lentamente, ou muito agitado',
        'Pensamentos de que seria melhor estar morto'
      ],
      opcoes: [
        { valor: 0, texto: 'Nenhuma vez' },
        { valor: 1, texto: 'Vários dias' },
        { valor: 2, texto: 'Mais da metade dos dias' },
        { valor: 3, texto: 'Quase todos os dias' }
      ],
      interpretacao: {
        0: { nivel: 'Mínima', cor: 'text-green-600', bg: 'bg-green-50' },
        5: { nivel: 'Leve', cor: 'text-yellow-600', bg: 'bg-yellow-50' },
        10: { nivel: 'Moderada', cor: 'text-orange-600', bg: 'bg-orange-50' },
        15: { nivel: 'Moderadamente severa', cor: 'text-red-600', bg: 'bg-red-50' },
        20: { nivel: 'Severa', cor: 'text-red-800', bg: 'bg-red-100' }
      }
    },
    estresse: {
      nome: 'Escala de Estresse Percebido',
      descricao: 'Avalia o nível de estresse percebido',
      perguntas: [
        'Com que frequência você ficou chateado por algo inesperado?',
        'Com que frequência você sentiu que não conseguia controlar as coisas importantes da sua vida?',
        'Com que frequência você se sentiu nervoso e estressado?',
        'Com que frequência você sentiu confiança na sua habilidade para lidar com problemas pessoais?',
        'Com que frequência você sentiu que as coisas estavam acontecendo de acordo com a sua vontade?',
        'Com que frequência você achou que não conseguiria lidar com todas as coisas que tinha que fazer?',
        'Com que frequência você conseguiu controlar as irritações da sua vida?',
        'Com que frequência você sentiu que estava por cima da situação?',
        'Com que frequência você ficou bravo por causa de coisas que estavam fora do seu controle?',
        'Com que frequência você sentiu que as dificuldades se acumularam tanto que você não conseguiria superá-las?'
      ],
      opcoes: [
        { valor: 0, texto: 'Nunca' },
        { valor: 1, texto: 'Quase nunca' },
        { valor: 2, texto: 'Às vezes' },
        { valor: 3, texto: 'Frequentemente' },
        { valor: 4, texto: 'Muito frequentemente' }
      ],
      interpretacao: {
        0: { nivel: 'Baixo', cor: 'text-green-600', bg: 'bg-green-50' },
        14: { nivel: 'Moderado', cor: 'text-yellow-600', bg: 'bg-yellow-50' },
        27: { nivel: 'Alto', cor: 'text-red-600', bg: 'bg-red-50' }
      }
    },
    bemestar: {
      nome: 'Escala de Bem-estar Subjetivo',
      descricao: 'Avalia satisfação com a vida e bem-estar geral',
      perguntas: [
        'Na maioria dos aspectos, minha vida está próxima do meu ideal',
        'As condições da minha vida são excelentes',
        'Estou satisfeito com minha vida',
        'Até agora, tenho conseguido as coisas importantes que quero na vida',
        'Se eu pudesse viver minha vida novamente, não mudaria quase nada'
      ],
      opcoes: [
        { valor: 1, texto: 'Discordo totalmente' },
        { valor: 2, texto: 'Discordo' },
        { valor: 3, texto: 'Discordo ligeiramente' },
        { valor: 4, texto: 'Nem concordo nem discordo' },
        { valor: 5, texto: 'Concordo ligeiramente' },
        { valor: 6, texto: 'Concordo' },
        { valor: 7, texto: 'Concordo totalmente' }
      ],
      interpretacao: {
        5: { nivel: 'Baixo', cor: 'text-red-600', bg: 'bg-red-50' },
        15: { nivel: 'Moderado', cor: 'text-yellow-600', bg: 'bg-yellow-50' },
        25: { nivel: 'Alto', cor: 'text-green-600', bg: 'bg-green-50' }
      }
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = () => {
    const avaliacoesSalvas = localStorage.getItem('user_scale_responses');
    if (avaliacoesSalvas) {
      setHistorico(JSON.parse(avaliacoesSalvas));
    }
  };

  const iniciarAvaliacao = (tipo: string) => {
    setAvaliacaoAtiva(tipo);
    setRespostas(new Array(escalas[tipo as keyof typeof escalas].perguntas.length).fill(-1));
  };

  const atualizarResposta = (indice: number, valor: number) => {
    const novasRespostas = [...respostas];
    novasRespostas[indice] = valor;
    setRespostas(novasRespostas);
  };

  const calcularPontuacao = (tipo: string, respostas: number[]) => {
    if (tipo === 'estresse') {
      // Itens 4, 5, 7, 8 são invertidos na escala de estresse
      const itensInvertidos = [3, 4, 6, 7];
      return respostas.reduce((total, resposta, indice) => {
        if (itensInvertidos.includes(indice)) {
          return total + (4 - resposta);
        }
        return total + resposta;
      }, 0);
    }
    return respostas.reduce((total, resposta) => total + resposta, 0);
  };

  const obterInterpretacao = (tipo: string, pontuacao: number) => {
    const escala = escalas[tipo as keyof typeof escalas];
    const niveis = Object.keys(escala.interpretacao).map(Number).sort((a, b) => b - a);
    
    for (const nivel of niveis) {
      if (pontuacao >= nivel) {
        return escala.interpretacao[nivel as keyof typeof escala.interpretacao];
      }
    }
    
    return escala.interpretacao[0 as keyof typeof escala.interpretacao];
  };

  const salvarAvaliacao = async () => {
    if (!avaliacaoAtiva || respostas.includes(-1)) {
      alert('Por favor, responda todas as perguntas antes de salvar.');
      return;
    }

    setLoading(true);
    
    const pontuacao = calcularPontuacao(avaliacaoAtiva, respostas);
    
    const novaAvaliacao: Avaliacao = {
      id: Date.now().toString(),
      tipo: avaliacaoAtiva,
      valor: pontuacao,
      respostas: respostas,
      criado_em: new Date().toISOString()
    };

    const avaliacoesAtualizadas = [...historico, novaAvaliacao];
    localStorage.setItem('user_scale_responses', JSON.stringify(avaliacoesAtualizadas));
    
    setHistorico(avaliacoesAtualizadas);
    setAvaliacaoAtiva(null);
    setRespostas([]);
    setLoading(false);

    // Verificar se precisa de atenção especial
    const interpretacao = obterInterpretacao(avaliacaoAtiva, pontuacao);
    if (interpretacao.nivel === 'Severa' || interpretacao.nivel === 'Alto') {
      if (confirm('Seus resultados indicam que você pode se beneficiar de apoio profissional. Gostaria de acessar nosso plano de emergência?')) {
        onNavigate('emergencia');
      }
    }
  };

  const prepararDadosGrafico = (tipo: string) => {
    const avaliacoesTipo = historico
      .filter(a => a.tipo === tipo)
      .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
      .slice(-10); // Últimas 10 avaliações

    return {
      labels: avaliacoesTipo.map(a => 
        new Date(a.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      ),
      datasets: [{
        label: escalas[tipo as keyof typeof escalas].nome,
        data: avaliacoesTipo.map(a => a.valor),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

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
        beginAtZero: true
      }
    }
  };

  if (avaliacaoAtiva) {
    const escalaAtual = escalas[avaliacaoAtiva as keyof typeof escalas];
    const progresso = (respostas.filter(r => r !== -1).length / escalaAtual.perguntas.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setAvaliacaoAtiva(null)}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Voltar às escalas
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {escalaAtual.nome}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {escalaAtual.descricao}
            </p>
            
            {/* Barra de Progresso */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Progresso: {Math.round(progresso)}% ({respostas.filter(r => r !== -1).length}/{escalaAtual.perguntas.length})
            </p>
          </div>

          {/* Perguntas */}
          <div className="space-y-6">
            {escalaAtual.perguntas.map((pergunta, indice) => (
              <div key={indice} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {indice + 1}. {pergunta}
                </h3>
                <div className="space-y-2">
                  {escalaAtual.opcoes.map((opcao, opcaoIndice) => (
                    <label key={opcaoIndice} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`pergunta-${indice}`}
                        value={opcao.valor}
                        checked={respostas[indice] === opcao.valor}
                        onChange={() => atualizarResposta(indice, opcao.valor)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{opcao.texto}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Botão Salvar */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={salvarAvaliacao}
              disabled={respostas.includes(-1) || loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Salvando...' : 'Salvar Avaliação'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Autoavaliações Psicológicas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitore seu bem-estar mental com escalas validadas cientificamente
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Avaliações</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{historico.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Este Mês</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {historico.filter(a => {
                    const dataAvaliacao = new Date(a.criado_em);
                    const agora = new Date();
                    return dataAvaliacao.getMonth() === agora.getMonth() && 
                           dataAvaliacao.getFullYear() === agora.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Avaliação</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {historico.length > 0 
                    ? new Date(historico[historico.length - 1].criado_em).toLocaleDateString('pt-BR')
                    : 'Nenhuma'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipos Diferentes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Set(historico.map(a => a.tipo)).size}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Escalas Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(escalas).map(([tipo, escala]) => {
            const ultimaAvaliacao = historico
              .filter(a => a.tipo === tipo)
              .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())[0];
            
            const interpretacao = ultimaAvaliacao 
              ? obterInterpretacao(tipo, ultimaAvaliacao.valor)
              : null;

            return (
              <div key={tipo} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {escala.nome}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {escala.descricao}
                    </p>
                    
                    {ultimaAvaliacao && interpretacao && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${interpretacao.bg} ${interpretacao.cor} mb-4`}>
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Último resultado: {interpretacao.nivel}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {escala.perguntas.length} perguntas • {historico.filter(a => a.tipo === tipo).length} avaliações realizadas
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => iniciarAvaliacao(tipo)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Nova Avaliação
                  </button>
                  
                  {historico.filter(a => a.tipo === tipo).length > 0 && (
                    <button
                      onClick={() => {/* Implementar visualização do histórico */}}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficos de Evolução */}
        {Object.keys(escalas).some(tipo => historico.filter(a => a.tipo === tipo).length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Evolução das Avaliações</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.keys(escalas).map(tipo => {
                const avaliacoesTipo = historico.filter(a => a.tipo === tipo);
                if (avaliacoesTipo.length === 0) return null;

                return (
                  <div key={tipo} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {escalas[tipo as keyof typeof escalas].nome}
                    </h3>
                    <div className="h-64">
                      <Line data={prepararDadosGrafico(tipo)} options={chartOptions} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Autoavaliacoes;