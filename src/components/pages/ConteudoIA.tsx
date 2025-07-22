import React, { useState, useEffect } from 'react';
import { Bot, Send, Lightbulb, Heart, Brain, Zap, BookOpen, Star, Download, RefreshCw, MessageSquare, Sparkles, Target, Coffee } from 'lucide-react';

interface ConteudoIAProps {
  onNavigate: (page: string) => void;
}

interface MensagemChat {
  id: string;
  tipo: 'usuario' | 'ia';
  conteudo: string;
  timestamp: string;
  contexto?: string;
}

interface ConteudoGerado {
  id: string;
  tipo: 'dica' | 'exercicio' | 'meditacao' | 'motivacao' | 'artigo';
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  criado_em: string;
  favorito: boolean;
  visualizacoes: number;
}

const ConteudoIA: React.FC<ConteudoIAProps> = ({ onNavigate }) => {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [conteudos, setConteudos] = useState<ConteudoGerado[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState<'chat' | 'conteudos'>('chat');
  const [contextoSelecionado, setContextoSelecionado] = useState('geral');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [gerandoConteudo, setGerandoConteudo] = useState(false);

  const contextos = {
    geral: {
      nome: 'Conversa Geral',
      icone: '💬',
      prompt: 'Você é um assistente de bem-estar emocional especializado em saúde mental. Seja empático, acolhedor e ofereça suporte emocional.'
    },
    crise: {
      nome: 'Apoio em Crise',
      icone: '🆘',
      prompt: 'Você é um assistente especializado em apoio emocional durante crises. Seja muito cuidadoso, empático e sempre recomende buscar ajuda profissional quando necessário.'
    },
    habitos: {
      nome: 'Hábitos Saudáveis',
      icone: '🎯',
      prompt: 'Você é um especialista em formação de hábitos saudáveis e produtividade pessoal. Ofereça dicas práticas e motivação.'
    },
    mindfulness: {
      nome: 'Mindfulness',
      icone: '🧘',
      prompt: 'Você é um instrutor de mindfulness e meditação. Guie o usuário em práticas de atenção plena e relaxamento.'
    },
    motivacao: {
      nome: 'Motivação',
      icone: '⚡',
      prompt: 'Você é um coach motivacional especializado em bem-estar. Inspire e motive o usuário com mensagens positivas e estratégias práticas.'
    }
  };

  const tiposConteudo = {
    dica: { nome: 'Dicas', icone: '💡', cor: 'bg-yellow-100 text-yellow-800' },
    exercicio: { nome: 'Exercícios', icone: '🏃', cor: 'bg-blue-100 text-blue-800' },
    meditacao: { nome: 'Meditação', icone: '🧘', cor: 'bg-purple-100 text-purple-800' },
    motivacao: { nome: 'Motivação', icone: '⚡', cor: 'bg-orange-100 text-orange-800' },
    artigo: { nome: 'Artigos', icone: '📖', cor: 'bg-green-100 text-green-800' }
  };

  useEffect(() => {
    carregarDados();
    inicializarConteudosExemplo();
  }, []);

  const carregarDados = () => {
    const mensagensSalvas = localStorage.getItem('historico_chat_ia');
    const conteudosSalvos = localStorage.getItem('conteudos_ia_gerados');
    
    if (mensagensSalvas) {
      setMensagens(JSON.parse(mensagensSalvas));
    }
    
    if (conteudosSalvos) {
      setConteudos(JSON.parse(conteudosSalvos));
    }
  };

  const inicializarConteudosExemplo = () => {
    const conteudosSalvos = localStorage.getItem('conteudos_ia_gerados');
    if (!conteudosSalvos) {
      const conteudosExemplo: ConteudoGerado[] = [
        {
          id: '1',
          tipo: 'dica',
          titulo: '5 Técnicas de Respiração para Ansiedade',
          conteudo: `1. **Respiração 4-7-8**: Inspire por 4 segundos, segure por 7, expire por 8.\n\n2. **Respiração Quadrada**: Inspire, segure, expire e pause - cada fase por 4 segundos.\n\n3. **Respiração Abdominal**: Coloque uma mão no peito e outra no abdômen. Respire de forma que apenas a mão do abdômen se mova.\n\n4. **Respiração Alternada**: Use o polegar para fechar uma narina, inspire pela outra, depois alterne.\n\n5. **Respiração de Coerência**: Inspire por 5 segundos, expire por 5 segundos, mantendo um ritmo constante.`,
          categoria: 'Técnicas de Relaxamento',
          tags: ['ansiedade', 'respiracao', 'relaxamento'],
          criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          favorito: true,
          visualizacoes: 45
        },
        {
          id: '2',
          tipo: 'exercicio',
          titulo: 'Exercício de Gratidão Diária',
          conteudo: `**Objetivo**: Desenvolver uma mentalidade mais positiva através da prática da gratidão.\n\n**Como fazer**:\n1. Reserve 5 minutos do seu dia\n2. Escreva 3 coisas pelas quais você é grato\n3. Para cada item, escreva o PORQUÊ você é grato\n4. Tente ser específico e detalhado\n\n**Exemplo**:\n- Sou grato pela minha família PORQUE eles me apoiam nos momentos difíceis\n- Sou grato pelo meu trabalho PORQUE me permite crescer profissionalmente\n\n**Dica**: Faça isso sempre no mesmo horário para criar um hábito!`,
          categoria: 'Desenvolvimento Pessoal',
          tags: ['gratidao', 'positividade', 'habito'],
          criado_em: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          favorito: false,
          visualizacoes: 32
        },
        {
          id: '3',
          tipo: 'meditacao',
          titulo: 'Meditação Guiada: Corpo e Mente',
          conteudo: `**Duração**: 10 minutos\n\n**Preparação**:\n- Sente-se confortavelmente\n- Feche os olhos suavemente\n- Respire naturalmente\n\n**Roteiro**:\n\n*Minutos 1-2*: Foque na sua respiração. Sinta o ar entrando e saindo.\n\n*Minutos 3-4*: Escaneie seu corpo dos pés à cabeça. Note qualquer tensão.\n\n*Minutos 5-6*: Visualize uma luz dourada envolvendo seu corpo, trazendo paz.\n\n*Minutos 7-8*: Repita mentalmente: "Estou em paz, estou seguro, estou bem".\n\n*Minutos 9-10*: Gradualmente, volte sua atenção ao ambiente. Abra os olhos lentamente.\n\n**Finalização**: Respire fundo e sorria para si mesmo.`,
          categoria: 'Mindfulness',
          tags: ['meditacao', 'relaxamento', 'mindfulness'],
          criado_em: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          favorito: true,
          visualizacoes: 67
        }
      ];
      
      localStorage.setItem('conteudos_ia_gerados', JSON.stringify(conteudosExemplo));
      setConteudos(conteudosExemplo);
    }
  };

  const salvarMensagens = (novasMensagens: MensagemChat[]) => {
    localStorage.setItem('historico_chat_ia', JSON.stringify(novasMensagens));
    setMensagens(novasMensagens);
  };

  const salvarConteudos = (novosConteudos: ConteudoGerado[]) => {
    localStorage.setItem('conteudos_ia_gerados', JSON.stringify(novosConteudos));
    setConteudos(novosConteudos);
  };

  // Simulação da API do ChatGPT
  const obterRespostaIA = async (mensagem: string, contexto: string): Promise<string> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const respostasFallback = {
      geral: [
        "Entendo como você está se sentindo. É importante reconhecer suas emoções e cuidar de si mesmo. Que tal tentarmos uma técnica de respiração?",
        "Obrigado por compartilhar isso comigo. Lembre-se de que é normal ter altos e baixos. Como posso ajudá-lo hoje?",
        "Suas emoções são válidas e importantes. Vamos trabalhar juntos para encontrar estratégias que funcionem para você."
      ],
      crise: [
        "Percebo que você está passando por um momento difícil. É muito importante que você saiba que não está sozinho. Recomendo fortemente que procure ajuda profissional. O CVV está disponível 24h pelo 188.",
        "Sua segurança é a prioridade. Por favor, considere entrar em contato com um profissional de saúde mental ou ligar para o CVV (188). Enquanto isso, tente respirar profundamente."
      ],
      habitos: [
        "Formar novos hábitos leva tempo - em média 66 dias. Comece pequeno: escolha uma ação simples que você possa fazer todos os dias. Qual hábito você gostaria de desenvolver?",
        "A chave para hábitos duradouros é a consistência, não a perfeição. Que tal começarmos com apenas 2 minutos por dia?"
      ],
      mindfulness: [
        "Vamos praticar um momento de atenção plena. Respire fundo, sinta seus pés no chão e observe 3 coisas que você pode ver ao seu redor. Como se sente agora?",
        "A prática de mindfulness nos ajuda a estar presentes. Que tal fazermos um exercício de respiração consciente juntos?"
      ],
      motivacao: [
        "Você é mais forte do que imagina! Cada pequeno passo que você dá é uma vitória. Qual foi uma conquista sua recente, por menor que seja?",
        "Lembre-se: o progresso não é sempre linear. Você está no caminho certo, mesmo quando não parece. Continue avançando!"
      ]
    };
    
    const respostasContexto = respostasFallback[contexto as keyof typeof respostasFallback] || respostasFallback.geral;
    return respostasContexto[Math.floor(Math.random() * respostasContexto.length)];
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || carregando) return;
    
    const mensagemUsuario: MensagemChat = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: novaMensagem,
      timestamp: new Date().toISOString(),
      contexto: contextoSelecionado
    };
    
    const mensagensAtualizadas = [...mensagens, mensagemUsuario];
    salvarMensagens(mensagensAtualizadas);
    setNovaMensagem('');
    setCarregando(true);
    
    try {
      const respostaIA = await obterRespostaIA(novaMensagem, contextoSelecionado);
      
      const mensagemIA: MensagemChat = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: respostaIA,
        timestamp: new Date().toISOString(),
        contexto: contextoSelecionado
      };
      
      salvarMensagens([...mensagensAtualizadas, mensagemIA]);
    } catch (error) {
      console.error('Erro ao obter resposta da IA:', error);
      
      const mensagemErro: MensagemChat = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes. Se você estiver em crise, ligue para o CVV: 188.',
        timestamp: new Date().toISOString(),
        contexto: contextoSelecionado
      };
      
      salvarMensagens([...mensagensAtualizadas, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  const gerarConteudoPersonalizado = async (tipo: keyof typeof tiposConteudo) => {
    setGerandoConteudo(true);
    
    try {
      // Simular geração de conteúdo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const conteudosExemplo = {
        dica: {
          titulo: 'Técnica 5-4-3-2-1 para Ansiedade',
          conteudo: `Esta é uma técnica de grounding muito eficaz para momentos de ansiedade:\n\n**5** - Nomeie 5 coisas que você pode VER\n**4** - Nomeie 4 coisas que você pode TOCAR\n**3** - Nomeie 3 coisas que você pode OUVIR\n**2** - Nomeie 2 coisas que você pode CHEIRAR\n**1** - Nomeie 1 coisa que você pode SABOREAR\n\nEsta técnica ajuda a trazer sua mente de volta ao presente e reduzir a ansiedade.`,
          categoria: 'Técnicas de Ansiedade'
        },
        exercicio: {
          titulo: 'Caminhada Mindful de 10 Minutos',
          conteudo: `**Preparação**:\n- Escolha um local seguro para caminhar\n- Deixe o celular no silencioso\n- Vista roupas confortáveis\n\n**Durante a caminhada**:\n1. Comece caminhando normalmente\n2. Foque na sensação dos pés tocando o chão\n3. Observe sua respiração natural\n4. Note os sons ao seu redor\n5. Sinta o ar na sua pele\n\n**Benefícios**: Reduz estresse, melhora o humor e aumenta a consciência corporal.`,
          categoria: 'Exercícios Físicos'
        },
        meditacao: {
          titulo: 'Meditação da Autocompaixão',
          conteudo: `**Duração**: 15 minutos\n\n**Posição**: Sentado confortavelmente\n\n**Roteiro**:\n\n*Minutos 1-3*: Respire profundamente e relaxe\n\n*Minutos 4-7*: Coloque a mão no coração e repita:\n"Que eu seja feliz"\n"Que eu seja saudável"\n"Que eu seja em paz"\n\n*Minutos 8-12*: Pense em alguém querido e envie os mesmos desejos\n\n*Minutos 13-15*: Estenda esses desejos para todas as pessoas\n\n**Finalização**: Respire fundo e abra os olhos lentamente.`,
          categoria: 'Meditação Guiada'
        },
        motivacao: {
          titulo: 'Afirmações Poderosas para o Dia',
          conteudo: `**Como usar**: Repita essas afirmações pela manhã, olhando no espelho:\n\n✨ "Eu sou capaz de superar qualquer desafio"\n✨ "Minha presença faz diferença no mundo"\n✨ "Eu mereço amor e respeito"\n✨ "Cada dia é uma nova oportunidade"\n✨ "Eu confio na minha capacidade de crescer"\n✨ "Sou grato pelas experiências que me fortalecem"\n\n**Dica**: Escolha 2-3 afirmações que mais ressoam com você e repita-as durante o dia.`,
          categoria: 'Desenvolvimento Pessoal'
        },
        artigo: {
          titulo: 'A Importância do Autocuidado na Rotina',
          conteudo: `**O que é autocuidado?**\nAutocuidado não é egoísmo - é uma necessidade. É o ato consciente de cuidar da sua saúde física, mental e emocional.\n\n**Tipos de autocuidado**:\n\n🧠 **Mental**: Ler, aprender algo novo, meditar\n💪 **Físico**: Exercitar-se, dormir bem, comer saudável\n❤️ **Emocional**: Expressar sentimentos, buscar apoio\n🤝 **Social**: Conectar-se com pessoas queridas\n🎨 **Criativo**: Desenhar, escrever, tocar música\n\n**Como começar**:\n1. Reserve 15 minutos diários para você\n2. Identifique o que te faz sentir bem\n3. Seja consistente, não perfeito\n4. Ajuste conforme suas necessidades`,
          categoria: 'Bem-estar Geral'
        }
      };
      
      const exemplo = conteudosExemplo[tipo];
      
      const novoConteudo: ConteudoGerado = {
        id: Date.now().toString(),
        tipo,
        titulo: exemplo.titulo,
        conteudo: exemplo.conteudo,
        categoria: exemplo.categoria,
        tags: [tipo, 'ia-gerado', 'personalizado'],
        criado_em: new Date().toISOString(),
        favorito: false,
        visualizacoes: 0
      };
      
      salvarConteudos([novoConteudo, ...conteudos]);
      setAbaSelecionada('conteudos');
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      alert('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setGerandoConteudo(false);
    }
  };

  const toggleFavorito = (id: string) => {
    const conteudosAtualizados = conteudos.map(conteudo => 
      conteudo.id === id ? { ...conteudo, favorito: !conteudo.favorito } : conteudo
    );
    salvarConteudos(conteudosAtualizados);
  };

  const incrementarVisualizacao = (id: string) => {
    const conteudosAtualizados = conteudos.map(conteudo => 
      conteudo.id === id ? { ...conteudo, visualizacoes: conteudo.visualizacoes + 1 } : conteudo
    );
    salvarConteudos(conteudosAtualizados);
  };

  const limparChat = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico do chat?')) {
      setMensagens([]);
      localStorage.removeItem('historico_chat_ia');
    }
  };

  const exportarConteudo = (conteudo: ConteudoGerado) => {
    const texto = `${conteudo.titulo}\n\n${conteudo.conteudo}\n\nCategoria: ${conteudo.categoria}\nTags: ${conteudo.tags.join(', ')}\nCriado em: ${new Date(conteudo.criado_em).toLocaleDateString()}`;
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conteudo.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatarTempo = (dataISO: string) => {
    const agora = new Date();
    const data = new Date(dataISO);
    const diffMs = agora.getTime() - data.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHoras < 1) {
      const diffMinutos = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutos}m atrás`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else {
      const diffDias = Math.floor(diffHoras / 24);
      return `${diffDias}d atrás`;
    }
  };

  const conteudosFiltrados = conteudos.filter(conteudo => 
    filtroTipo === 'todos' || conteudo.tipo === filtroTipo
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-purple-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Conteúdo IA
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAbaSelecionada('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  abaSelecionada === 'chat'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Chat IA
              </button>
              <button
                onClick={() => setAbaSelecionada('conteudos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  abaSelecionada === 'conteudos'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2 inline" />
                Conteúdos
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {abaSelecionada === 'chat' 
              ? 'Converse com nossa IA especializada em bem-estar emocional'
              : 'Explore conteúdos personalizados gerados por IA para seu bem-estar'
            }
          </p>
        </div>

        {abaSelecionada === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de Contextos */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contextos de Conversa
                </h3>
                <div className="space-y-2">
                  {Object.entries(contextos).map(([key, contexto]) => (
                    <button
                      key={key}
                      onClick={() => setContextoSelecionado(key)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        contextoSelecionado === key
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{contexto.icone}</span>
                        <span className="font-medium">{contexto.nome}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={limparChat}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Área do Chat */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col h-[600px]">
                {/* Header do Chat */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg mr-3">
                      🤖
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Assistente de Bem-estar
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contextos[contextoSelecionado as keyof typeof contextos].nome}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mensagens.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Olá! Como posso ajudá-lo hoje?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Escolha um contexto e comece nossa conversa sobre bem-estar.
                      </p>
                    </div>
                  ) : (
                    mensagens.map((mensagem) => (
                      <div
                        key={mensagem.id}
                        className={`flex ${
                          mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            mensagem.tipo === 'usuario'
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{mensagem.conteudo}</p>
                          <p className={`text-xs mt-2 ${
                            mensagem.tipo === 'usuario'
                              ? 'text-purple-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatarTempo(mensagem.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {carregando && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensagem();
                        }
                      }}
                      disabled={carregando}
                    />
                    <button
                      onClick={enviarMensagem}
                      disabled={carregando || !novaMensagem.trim()}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Geração de Conteúdo */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gerar Novo Conteúdo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(tiposConteudo).map(([tipo, info]) => (
                  <button
                    key={tipo}
                    onClick={() => gerarConteudoPersonalizado(tipo as keyof typeof tiposConteudo)}
                    disabled={gerandoConteudo}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <div className="text-2xl mb-2">{info.icone}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {info.nome}
                    </div>
                  </button>
                ))}
              </div>
              
              {gerandoConteudo && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-purple-500 mr-2 animate-spin" />
                    <span className="text-purple-700 dark:text-purple-300">
                      Gerando conteúdo personalizado...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Biblioteca de Conteúdos
                </h3>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="todos">Todos os tipos</option>
                  {Object.entries(tiposConteudo).map(([tipo, info]) => (
                    <option key={tipo} value={tipo}>
                      {info.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Conteúdos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudosFiltrados.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum conteúdo encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Gere novos conteúdos personalizados usando nossa IA.
                  </p>
                </div>
              ) : (
                conteudosFiltrados.map((conteudo) => (
                  <div key={conteudo.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {tiposConteudo[conteudo.tipo].icone}
                        </span>
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tiposConteudo[conteudo.tipo].cor
                          }`}>
                            {tiposConteudo[conteudo.tipo].nome}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorito(conteudo.id)}
                        className={`p-1 rounded transition-colors ${
                          conteudo.favorito
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${
                          conteudo.favorito ? 'fill-current' : ''
                        }`} />
                      </button>
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {conteudo.titulo}
                    </h3>
                    
                    {/* Preview do Conteúdo */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {conteudo.conteudo.substring(0, 150)}...
                    </p>
                    
                    {/* Metadados */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>{conteudo.categoria}</span>
                      <div className="flex items-center space-x-2">
                        <span>{conteudo.visualizacoes} visualizações</span>
                        <span>•</span>
                        <span>{formatarTempo(conteudo.criado_em)}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {conteudo.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          incrementarVisualizacao(conteudo.id);
                          // Aqui você pode abrir um modal ou navegar para uma página de detalhes
                          alert('Funcionalidade de visualização completa será implementada!');
                        }}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver Completo
                      </button>
                      <button
                        onClick={() => exportarConteudo(conteudo)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConteudoIA;