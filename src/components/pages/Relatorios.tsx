import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, Award, Target, Brain, Heart, Filter, RefreshCw, Share2, Mail, Printer } from 'lucide-react';

interface RelatoriosProps {
  onNavigate: (page: string) => void;
}

interface DadosRelatorio {
  avaliacoes: any[];
  habitos: any[];
  routines: any[];
  emocoes: any[];
  mindfulness: any[];
  periodo: {
    inicio: string;
    fim: string;
  };
}

interface EstatisticasGerais {
  totalAvaliacoes: number;
  habitosConcluidos: number;
  tarefasRealizadas: number;
  sessoesMindfulness: number;
  pontuacaoTotal: number;
  humorMedio: number;
  diasConsecutivos: number;
  metasAlcancadas: number;
}

const Relatorios: React.FC<RelatoriosProps> = ({ onNavigate }) => {
  const [dados, setDados] = useState<DadosRelatorio | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias');
  const [tipoRelatorio, setTipoRelatorio] = useState('geral');
  const [carregando, setCarregando] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const periodos = {
    '7dias': { nome: '7 dias', dias: 7 },
    '30dias': { nome: '30 dias', dias: 30 },
    '90dias': { nome: '90 dias', dias: 90 },
    '6meses': { nome: '6 meses', dias: 180 },
    '1ano': { nome: '1 ano', dias: 365 }
  };

  const tiposRelatorio = {
    geral: { nome: 'Relatório Geral', icone: '📊' },
    habitos: { nome: 'Hábitos', icone: '🎯' },
    emocional: { nome: 'Bem-estar Emocional', icone: '❤️' },
    mindfulness: { nome: 'Mindfulness', icone: '🧘' },
    progresso: { nome: 'Progresso Geral', icone: '📈' }
  };

  const cores = {
    primaria: '#8B5CF6',
    secundaria: '#06B6D4',
    sucesso: '#10B981',
    aviso: '#F59E0B',
    erro: '#EF4444',
    info: '#3B82F6'
  };

  useEffect(() => {
    carregarDados();
  }, [periodoSelecionado]);

  const carregarDados = async () => {
    setCarregando(true);
    
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const diasPeriodo = periodos[periodoSelecionado as keyof typeof periodos].dias;
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasPeriodo);
      
      // Carregar dados do localStorage
      const avaliacoesSalvas = JSON.parse(localStorage.getItem('user_scale_responses') || '[]');
      const habitosSalvos = JSON.parse(localStorage.getItem('user_gamification') || '[]');
      const rotinasSalvas = JSON.parse(localStorage.getItem('user_routines') || '[]');
      const emocoesSalvas = JSON.parse(localStorage.getItem('emotion_posts') || '[]');
      const mindfulnessSalvo = JSON.parse(localStorage.getItem('mindfulness_sessions') || '[]');
      
      // Filtrar por período
      const avaliacoesPeriodo = avaliacoesSalvas.filter((a: any) => 
        new Date(a.data) >= dataInicio
      );
      
      const habitosPeriodo = habitosSalvos.filter((h: any) => 
        h.execucoes && h.execucoes.some((e: any) => new Date(e.data) >= dataInicio)
      );
      
      const rotinasPeriodo = rotinasSalvas.filter((r: any) => 
        r.executions && r.executions.some((e: any) => new Date(e.execution_date) >= dataInicio)
      );
      
      const emocoesPeriodo = emocoesSalvas.filter((e: any) => 
        new Date(e.criado_em) >= dataInicio
      );
      
      const mindfulnessPeriodo = mindfulnessSalvo.filter((m: any) => 
        new Date(m.data) >= dataInicio
      );
      
      const dadosRelatorio: DadosRelatorio = {
        avaliacoes: avaliacoesPeriodo,
        habitos: habitosPeriodo,
        routines: rotinasPeriodo,
        emocoes: emocoesPeriodo,
        mindfulness: mindfulnessPeriodo,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: new Date().toISOString()
        }
      };
      
      setDados(dadosRelatorio);
      calcularEstatisticas(dadosRelatorio);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const calcularEstatisticas = (dados: DadosRelatorio) => {
    const totalAvaliacoes = dados.avaliacoes.length;
    
    const habitosConcluidos = dados.habitos.reduce((total, habito) => {
      return total + (habito.execucoes?.filter((e: any) => e.concluido).length || 0);
    }, 0);
    
    const tarefasRealizadas = dados.routines.reduce((total, rotina) => {
      return total + (rotina.executions?.filter((e: any) => e.is_completed).length || 0);
    }, 0);
    
    const sessoesMindfulness = dados.mindfulness.length;
    
    const pontuacaoTotal = dados.habitos.reduce((total, habito) => {
      const execucoesConcluidas = habito.execucoes?.filter((e: any) => e.concluido).length || 0;
      return total + (execucoesConcluidas * (habito.pontos || 10));
    }, 0);
    
    const humorMedio = dados.avaliacoes.length > 0 
      ? dados.avaliacoes.reduce((total, avaliacao) => total + (avaliacao.humor || 5), 0) / dados.avaliacoes.length
      : 0;
    
    // Calcular dias consecutivos (simulado)
    const diasConsecutivos = Math.min(Math.floor(Math.random() * 15) + 1, 30);
    
    // Calcular metas alcançadas (simulado)
    const metasAlcancadas = Math.floor((habitosConcluidos + tarefasRealizadas) / 10);
    
    const estatisticasCalculadas: EstatisticasGerais = {
      totalAvaliacoes,
      habitosConcluidos,
      tarefasRealizadas,
      sessoesMindfulness,
      pontuacaoTotal,
      humorMedio,
      diasConsecutivos,
      metasAlcancadas
    };
    
    setEstatisticas(estatisticasCalculadas);
  };

  const gerarDadosGraficoHumor = () => {
    if (!dados) return [];
    
    const ultimosDias = Array.from({ length: 14 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() - (13 - i));
      return {
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        humor: Math.floor(Math.random() * 5) + 3 // Simular dados entre 3-8
      };
    });
    
    return ultimosDias;
  };

  const gerarDadosGraficoHabitos = () => {
    if (!dados) return [];
    
    const categorias = ['Exercício', 'Meditação', 'Leitura', 'Água', 'Sono'];
    
    return categorias.map(categoria => ({
      categoria,
      concluidos: Math.floor(Math.random() * 20) + 5,
      meta: 25
    }));
  };

  const gerarDadosGraficoPizza = () => {
    if (!dados || !estatisticas) return [];
    
    return [
      { nome: 'Hábitos', valor: estatisticas.habitosConcluidos, cor: cores.primaria },
      { nome: 'Rotinas', valor: estatisticas.tarefasRealizadas, cor: cores.secundaria },
      { nome: 'Mindfulness', valor: estatisticas.sessoesMindfulness, cor: cores.sucesso },
      { nome: 'Avaliações', valor: estatisticas.totalAvaliacoes, cor: cores.info }
    ];
  };

  const gerarDadosRadar = () => {
    return [
      {
        categoria: 'Bem-estar Físico',
        atual: Math.floor(Math.random() * 40) + 60,
        meta: 90
      },
      {
        categoria: 'Saúde Mental',
        atual: Math.floor(Math.random() * 30) + 50,
        meta: 85
      },
      {
        categoria: 'Relacionamentos',
        atual: Math.floor(Math.random() * 35) + 55,
        meta: 80
      },
      {
        categoria: 'Produtividade',
        atual: Math.floor(Math.random() * 25) + 65,
        meta: 85
      },
      {
        categoria: 'Autocuidado',
        atual: Math.floor(Math.random() * 30) + 60,
        meta: 90
      },
      {
        categoria: 'Mindfulness',
        atual: Math.floor(Math.random() * 35) + 45,
        meta: 75
      }
    ];
  };

  const exportarPDF = async () => {
    setGerandoPDF(true);
    
    try {
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você integraria com jsPDF
      const conteudoPDF = `
RELATÓRIO DE PROGRESSO - REFÚGIO DIGITAL

Período: ${new Date(dados?.periodo.inicio || '').toLocaleDateString('pt-BR')} - ${new Date(dados?.periodo.fim || '').toLocaleDateString('pt-BR')}

ESTATÍSTICAS GERAIS:
- Total de Avaliações: ${estatisticas?.totalAvaliacoes || 0}
- Hábitos Concluídos: ${estatisticas?.habitosConcluidos || 0}
- Tarefas Realizadas: ${estatisticas?.tarefasRealizadas || 0}
- Sessões de Mindfulness: ${estatisticas?.sessoesMindfulness || 0}
- Pontuação Total: ${estatisticas?.pontuacaoTotal || 0}
- Humor Médio: ${(estatisticas?.humorMedio || 0).toFixed(1)}/10
- Dias Consecutivos: ${estatisticas?.diasConsecutivos || 0}
- Metas Alcançadas: ${estatisticas?.metasAlcancadas || 0}

RECOMENDAÇÕES:
- Continue mantendo a consistência nos hábitos
- Considere aumentar as sessões de mindfulness
- Monitore regularmente seu bem-estar emocional

Gerado em: ${new Date().toLocaleString('pt-BR')}
      `;
      
      // Criar e baixar arquivo
      const blob = new Blob([conteudoPDF], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_progresso_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Relatório exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  const compartilharRelatorio = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Relatório de Progresso - Refúgio Digital',
        text: `Confira meu progresso: ${estatisticas?.habitosConcluidos} hábitos concluídos, ${estatisticas?.pontuacaoTotal} pontos acumulados!`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      const texto = `Confira meu progresso no Refúgio Digital: ${estatisticas?.habitosConcluidos} hábitos concluídos, ${estatisticas?.pontuacaoTotal} pontos acumulados!`;
      navigator.clipboard.writeText(texto);
      alert('Texto copiado para a área de transferência!');
    }
  };

  const enviarPorEmail = () => {
    const assunto = encodeURIComponent('Relatório de Progresso - Refúgio Digital');
    const corpo = encodeURIComponent(`
Olá!

Segue meu relatório de progresso do Refúgio Digital:

Período: ${periodos[periodoSelecionado as keyof typeof periodos].nome}
- Hábitos Concluídos: ${estatisticas?.habitosConcluidos || 0}
- Pontuação Total: ${estatisticas?.pontuacaoTotal || 0}
- Humor Médio: ${(estatisticas?.humorMedio || 0).toFixed(1)}/10

Continuo focado no meu bem-estar!

Atenciosamente
    `);
    
    window.open(`mailto:?subject=${assunto}&body=${corpo}`);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Carregando Relatórios
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analisando seus dados de progresso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Relatórios de Progresso
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={compartilharRelatorio}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </button>
              <button
                onClick={enviarPorEmail}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
              <button
                onClick={exportarPDF}
                disabled={gerandoPDF}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {gerandoPDF ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {gerandoPDF ? 'Gerando...' : 'Exportar PDF'}
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe seu progresso e conquistas no bem-estar emocional
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Período
              </label>
              <select
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(periodos).map(([key, periodo]) => (
                  <option key={key} value={key}>
                    {periodo.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={tipoRelatorio}
                onChange={(e) => setTipoRelatorio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(tiposRelatorio).map(([key, tipo]) => (
                  <option key={key} value={key}>
                    {tipo.icone} {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={carregarDados}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hábitos Concluídos</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.habitosConcluidos}</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">+12% vs período anterior</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontuação Total</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.pontuacaoTotal}</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">+8% vs período anterior</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Humor Médio</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.humorMedio.toFixed(1)}/10</p>
                </div>
                <Heart className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">+0.5 vs período anterior</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dias Consecutivos</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.diasConsecutivos}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">Recorde pessoal!</span>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Humor */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolução do Humor (14 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gerarDadosGraficoHumor()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="humor" 
                  stroke={cores.primaria} 
                  strokeWidth={3}
                  dot={{ fill: cores.primaria, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Hábitos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hábitos por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gerarDadosGraficoHabitos()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="concluidos" fill={cores.primaria} name="Concluídos" />
                <Bar dataKey="meta" fill={cores.secundaria} name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Pizza */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Atividades
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gerarDadosGraficoPizza()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, valor }) => `${nome}: ${valor}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {gerarDadosGraficoPizza().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Radar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Análise Multidimensional
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={gerarDadosRadar()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="categoria" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Atual"
                  dataKey="atual"
                  stroke={cores.primaria}
                  fill={cores.primaria}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Meta"
                  dataKey="meta"
                  stroke={cores.secundaria}
                  fill={cores.secundaria}
                  fillOpacity={0.1}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights e Recomendações */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Insights e Recomendações
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Brain className="h-5 w-5 text-purple-500 mr-2" />
                Pontos Fortes
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Consistência excelente nos hábitos de exercício
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Melhoria significativa no humor geral
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Engajamento alto com práticas de mindfulness
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Target className="h-5 w-5 text-orange-500 mr-2" />
                Áreas de Melhoria
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Aumentar frequência de avaliações de bem-estar
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Focar mais em hábitos de sono e descanso
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Explorar mais técnicas de gerenciamento de estresse
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
              💡 Recomendação da Semana
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Com base no seu progresso, recomendamos focar em estabelecer uma rotina de sono mais consistente. 
              Isso pode melhorar significativamente seu humor e energia para manter os outros hábitos.
            </p>
          </div>
        </div>

        {/* Próximas Metas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Próximas Metas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">30 Dias Consecutivos</span>
                <span className="text-xs text-gray-500">{estatisticas?.diasConsecutivos || 0}/30</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((estatisticas?.diasConsecutivos || 0) / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">1000 Pontos</span>
                <span className="text-xs text-gray-500">{estatisticas?.pontuacaoTotal || 0}/1000</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((estatisticas?.pontuacaoTotal || 0) / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">50 Hábitos</span>
                <span className="text-xs text-gray-500">{estatisticas?.habitosConcluidos || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((estatisticas?.habitosConcluidos || 0) / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;