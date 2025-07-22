import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Filter, Search, Flag, Smile, Frown, Meh, Users, TrendingUp, Clock } from 'lucide-react';

interface ComunidadeProps {
  onNavigate: (page: string) => void;
}

interface PostEmocao {
  id: string;
  user_id: string;
  autor: string;
  avatar: string;
  texto: string;
  emocao: 'feliz' | 'triste' | 'ansioso' | 'calmo' | 'irritado' | 'esperancoso' | 'confuso' | 'grato';
  categoria: string;
  criado_em: string;
  curtidas: number;
  comentarios: number;
  compartilhamentos: number;
  moderado: boolean;
  tags: string[];
}

interface Reacao {
  id: string;
  post_id: string;
  user_id: string;
  tipo: 'curtida' | 'apoio' | 'abraco' | 'forca';
  criado_em: string;
}

interface Comentario {
  id: string;
  post_id: string;
  user_id: string;
  autor: string;
  texto: string;
  criado_em: string;
}

const Comunidade: React.FC<ComunidadeProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<PostEmocao[]>([]);
  const [reacoes, setReacoes] = useState<Reacao[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroEmocao, setFiltroEmocao] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [novoPost, setNovoPost] = useState({
    texto: '',
    emocao: 'feliz' as const,
    categoria: 'geral',
    tags: [] as string[],
    anonimo: false
  });
  const [novoComentario, setNovoComentario] = useState('');
  const [postComentando, setPostComentando] = useState<string | null>(null);

  const emocoes = {
    feliz: { nome: 'Feliz', icone: '😊', cor: 'text-yellow-500' },
    triste: { nome: 'Triste', icone: '😢', cor: 'text-blue-500' },
    ansioso: { nome: 'Ansioso', icone: '😰', cor: 'text-orange-500' },
    calmo: { nome: 'Calmo', icone: '😌', cor: 'text-green-500' },
    irritado: { nome: 'Irritado', icone: '😠', cor: 'text-red-500' },
    esperancoso: { nome: 'Esperançoso', icone: '🌟', cor: 'text-purple-500' },
    confuso: { nome: 'Confuso', icone: '😕', cor: 'text-gray-500' },
    grato: { nome: 'Grato', icone: '🙏', cor: 'text-pink-500' }
  };

  const categorias = {
    geral: { nome: 'Geral', cor: 'bg-gray-100 text-gray-800' },
    trabalho: { nome: 'Trabalho', cor: 'bg-blue-100 text-blue-800' },
    relacionamentos: { nome: 'Relacionamentos', cor: 'bg-pink-100 text-pink-800' },
    saude: { nome: 'Saúde Mental', cor: 'bg-green-100 text-green-800' },
    familia: { nome: 'Família', cor: 'bg-yellow-100 text-yellow-800' },
    estudos: { nome: 'Estudos', cor: 'bg-purple-100 text-purple-800' },
    autocuidado: { nome: 'Autocuidado', cor: 'bg-indigo-100 text-indigo-800' },
    conquistas: { nome: 'Conquistas', cor: 'bg-orange-100 text-orange-800' }
  };

  const tiposReacao = {
    curtida: { nome: 'Curtir', icone: '❤️', cor: 'text-red-500' },
    apoio: { nome: 'Apoio', icone: '🤗', cor: 'text-blue-500' },
    abraco: { nome: 'Abraço', icone: '🫂', cor: 'text-yellow-500' },
    forca: { nome: 'Força', icone: '💪', cor: 'text-green-500' }
  };

  const palavrasProibidas = [
    'suicidio', 'suicídio', 'matar', 'morrer', 'morte', 'acabar com tudo',
    'não aguento mais', 'quero morrer', 'fim da vida'
  ];

  useEffect(() => {
    carregarDados();
    inicializarPostsExemplo();
  }, []);

  const carregarDados = () => {
    const postsSalvos = localStorage.getItem('posts_emocao');
    const reacoesSalvas = localStorage.getItem('reacoes_posts');
    const comentariosSalvos = localStorage.getItem('comentarios_posts');
    
    if (postsSalvos) {
      setPosts(JSON.parse(postsSalvos));
    }
    
    if (reacoesSalvas) {
      setReacoes(JSON.parse(reacoesSalvas));
    }
    
    if (comentariosSalvos) {
      setComentarios(JSON.parse(comentariosSalvos));
    }
  };

  const inicializarPostsExemplo = () => {
    const postsSalvos = localStorage.getItem('posts_emocao');
    if (!postsSalvos) {
      const postsExemplo: PostEmocao[] = [
        {
          id: '1',
          user_id: 'user1',
          autor: 'Maria Silva',
          avatar: '👩',
          texto: 'Hoje consegui completar minha primeira semana de exercícios! Estou me sentindo muito mais disposta e confiante. Pequenos passos fazem toda a diferença! 💪',
          emocao: 'feliz',
          categoria: 'conquistas',
          criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          curtidas: 12,
          comentarios: 3,
          compartilhamentos: 2,
          moderado: true,
          tags: ['exercicio', 'conquista', 'motivacao']
        },
        {
          id: '2',
          user_id: 'user2',
          autor: 'João Santos',
          avatar: '👨',
          texto: 'Às vezes me sinto sobrecarregado com o trabalho e as responsabilidades. Alguém mais passa por isso? Como vocês lidam com a pressão do dia a dia?',
          emocao: 'ansioso',
          categoria: 'trabalho',
          criado_em: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          curtidas: 8,
          comentarios: 5,
          compartilhamentos: 1,
          moderado: true,
          tags: ['trabalho', 'pressao', 'ajuda']
        },
        {
          id: '3',
          user_id: 'user3',
          autor: 'Ana Costa',
          avatar: '👩‍🦱',
          texto: 'Gratidão define meu dia hoje! Consegui ter uma conversa importante com minha família e me sinto muito mais leve. A comunicação realmente cura! 🙏',
          emocao: 'grato',
          categoria: 'familia',
          criado_em: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          curtidas: 15,
          comentarios: 4,
          compartilhamentos: 3,
          moderado: true,
          tags: ['gratidao', 'familia', 'comunicacao']
        }
      ];
      
      localStorage.setItem('posts_emocao', JSON.stringify(postsExemplo));
      setPosts(postsExemplo);
    }
  };

  const salvarPosts = (novosPosts: PostEmocao[]) => {
    localStorage.setItem('posts_emocao', JSON.stringify(novosPosts));
    setPosts(novosPosts);
  };

  const salvarReacoes = (novasReacoes: Reacao[]) => {
    localStorage.setItem('reacoes_posts', JSON.stringify(novasReacoes));
    setReacoes(novasReacoes);
  };

  const salvarComentarios = (novosComentarios: Comentario[]) => {
    localStorage.setItem('comentarios_posts', JSON.stringify(novosComentarios));
    setComentarios(novosComentarios);
  };

  const moderarTexto = (texto: string): boolean => {
    const textoLower = texto.toLowerCase();
    return !palavrasProibidas.some(palavra => textoLower.includes(palavra));
  };

  const criarPost = () => {
    if (!novoPost.texto.trim()) {
      alert('Por favor, escreva algo para compartilhar');
      return;
    }

    if (!moderarTexto(novoPost.texto)) {
      alert('Detectamos conteúdo que pode indicar risco. Por favor, procure ajuda profissional ou entre em contato com o CVV: 188');
      return;
    }

    const post: PostEmocao = {
      id: Date.now().toString(),
      user_id: 'current_user',
      autor: novoPost.anonimo ? 'Usuário Anônimo' : 'Você',
      avatar: novoPost.anonimo ? '👤' : '😊',
      texto: novoPost.texto,
      emocao: novoPost.emocao,
      categoria: novoPost.categoria,
      criado_em: new Date().toISOString(),
      curtidas: 0,
      comentarios: 0,
      compartilhamentos: 0,
      moderado: true,
      tags: novoPost.tags
    };

    salvarPosts([post, ...posts]);
    setNovoPost({
      texto: '',
      emocao: 'feliz',
      categoria: 'geral',
      tags: [],
      anonimo: false
    });
    setMostrarFormulario(false);
  };

  const reagirPost = (postId: string, tipoReacao: keyof typeof tiposReacao) => {
    const reacaoExistente = reacoes.find(r => 
      r.post_id === postId && r.user_id === 'current_user' && r.tipo === tipoReacao
    );

    let novasReacoes;
    if (reacaoExistente) {
      // Remove a reação
      novasReacoes = reacoes.filter(r => r.id !== reacaoExistente.id);
    } else {
      // Remove outras reações do mesmo usuário para este post
      const reacoesSemUsuario = reacoes.filter(r => 
        !(r.post_id === postId && r.user_id === 'current_user')
      );
      
      // Adiciona nova reação
      const novaReacao: Reacao = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: 'current_user',
        tipo: tipoReacao,
        criado_em: new Date().toISOString()
      };
      
      novasReacoes = [...reacoesSemUsuario, novaReacao];
    }

    salvarReacoes(novasReacoes);
    
    // Atualizar contador no post
    const postsAtualizados = posts.map(post => {
      if (post.id === postId) {
        const totalReacoes = novasReacoes.filter(r => r.post_id === postId).length;
        return { ...post, curtidas: totalReacoes };
      }
      return post;
    });
    
    salvarPosts(postsAtualizados);
  };

  const adicionarComentario = (postId: string) => {
    if (!novoComentario.trim()) return;

    if (!moderarTexto(novoComentario)) {
      alert('Detectamos conteúdo que pode indicar risco. Por favor, procure ajuda profissional.');
      return;
    }

    const comentario: Comentario = {
      id: Date.now().toString(),
      post_id: postId,
      user_id: 'current_user',
      autor: 'Você',
      texto: novoComentario,
      criado_em: new Date().toISOString()
    };

    salvarComentarios([...comentarios, comentario]);
    
    // Atualizar contador no post
    const postsAtualizados = posts.map(post => {
      if (post.id === postId) {
        return { ...post, comentarios: post.comentarios + 1 };
      }
      return post;
    });
    
    salvarPosts(postsAtualizados);
    setNovoComentario('');
    setPostComentando(null);
  };

  const obterReacaoUsuario = (postId: string) => {
    return reacoes.find(r => r.post_id === postId && r.user_id === 'current_user');
  };

  const obterComentariosPost = (postId: string) => {
    return comentarios.filter(c => c.post_id === postId);
  };

  const formatarTempo = (dataISO: string) => {
    const agora = new Date();
    const data = new Date(dataISO);
    const diffMs = agora.getTime() - data.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    
    if (diffHoras < 1) {
      return `${diffMinutos}m`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h`;
    } else {
      const diffDias = Math.floor(diffHoras / 24);
      return `${diffDias}d`;
    }
  };

  const filtrarPosts = () => {
    return posts.filter(post => {
      const matchEmocao = filtroEmocao === 'todos' || post.emocao === filtroEmocao;
      const matchCategoria = filtroCategoria === 'todos' || post.categoria === filtroCategoria;
      const matchBusca = busca === '' || 
        post.texto.toLowerCase().includes(busca.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));
      
      return matchEmocao && matchCategoria && matchBusca && post.moderado;
    });
  };

  const calcularEstatisticas = () => {
    const totalPosts = posts.length;
    const postsHoje = posts.filter(p => {
      const hoje = new Date().toDateString();
      const dataPost = new Date(p.criado_em).toDateString();
      return dataPost === hoje;
    }).length;
    
    const emocaoMaisComum = Object.keys(emocoes).reduce((a, b) => 
      posts.filter(p => p.emocao === a).length > posts.filter(p => p.emocao === b).length ? a : b
    );
    
    const totalReacoes = reacoes.length;
    
    return {
      totalPosts,
      postsHoje,
      emocaoMaisComum,
      totalReacoes
    };
  };

  const postsFiltrados = filtrarPosts();
  const estatisticas = calcularEstatisticas();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mural de Emoções
              </h1>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compartilhar
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Compartilhe suas emoções e conecte-se com uma comunidade acolhedora
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Posts</p>
                <p className="text-3xl font-bold text-purple-600">{estatisticas.totalPosts}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts Hoje</p>
                <p className="text-3xl font-bold text-blue-600">{estatisticas.postsHoje}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emoção Comum</p>
                <p className="text-2xl font-bold text-green-600">
                  {emocoes[estatisticas.emocaoMaisComum as keyof typeof emocoes]?.icone}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reações</p>
                <p className="text-3xl font-bold text-red-600">{estatisticas.totalReacoes}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar posts..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filtroEmocao}
              onChange={(e) => setFiltroEmocao(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="todos">Todas as emoções</option>
              {Object.entries(emocoes).map(([key, emocao]) => (
                <option key={key} value={key}>
                  {emocao.icone} {emocao.nome}
                </option>
              ))}
            </select>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="todos">Todas as categorias</option>
              {Object.entries(categorias).map(([key, categoria]) => (
                <option key={key} value={key}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feed de Posts */}
        <div className="space-y-6">
          {postsFiltrados.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {posts.length === 0 
                  ? 'Seja o primeiro a compartilhar suas emoções!'
                  : 'Tente ajustar os filtros ou fazer uma nova busca.'
                }
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Compartilhar Agora
              </button>
            </div>
          ) : (
            postsFiltrados.map((post) => {
              const reacaoUsuario = obterReacaoUsuario(post.id);
              const comentariosPost = obterComentariosPost(post.id);
              
              return (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  {/* Cabeçalho do Post */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg mr-3">
                        {post.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {post.autor}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatarTempo(post.criado_em)}</span>
                          <span>•</span>
                          <span className={emocoes[post.emocao].cor}>
                            {emocoes[post.emocao].icone} {emocoes[post.emocao].nome}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        categorias[post.categoria as keyof typeof categorias].cor
                      }`}>
                        {categorias[post.categoria as keyof typeof categorias].nome}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Flag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Conteúdo do Post */}
                  <div className="mb-4">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {post.texto}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      {Object.entries(tiposReacao).map(([tipo, reacao]) => (
                        <button
                          key={tipo}
                          onClick={() => reagirPost(post.id, tipo as keyof typeof tiposReacao)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${
                            reacaoUsuario?.tipo === tipo
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{reacao.icone}</span>
                          <span className="text-sm">{reacao.nome}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{post.curtidas} reações</span>
                      <button
                        onClick={() => setPostComentando(postComentando === post.id ? null : post.id)}
                        className="hover:text-purple-500 transition-colors"
                      >
                        {post.comentarios} comentários
                      </button>
                      <span>{post.compartilhamentos} compartilhamentos</span>
                    </div>
                  </div>
                  
                  {/* Seção de Comentários */}
                  {postComentando === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3 mb-4">
                        {comentariosPost.map((comentario) => (
                          <div key={comentario.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm">
                              😊
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {comentario.autor}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatarTempo(comentario.criado_em)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {comentario.texto}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                          😊
                        </div>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            value={novoComentario}
                            onChange={(e) => setNovoComentario(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                adicionarComentario(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => adicionarComentario(post.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Novo Post */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compartilhar Emoção
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Como você está se sentindo?
                  </label>
                  <textarea
                    value={novoPost.texto}
                    onChange={(e) => setNovoPost({ ...novoPost, texto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    rows={4}
                    placeholder="Compartilhe seus sentimentos, conquistas ou desafios..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Emoção
                    </label>
                    <select
                      value={novoPost.emocao}
                      onChange={(e) => setNovoPost({ ...novoPost, emocao: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {Object.entries(emocoes).map(([key, emocao]) => (
                        <option key={key} value={key}>
                          {emocao.icone} {emocao.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <select
                      value={novoPost.categoria}
                      onChange={(e) => setNovoPost({ ...novoPost, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      {Object.entries(categorias).map(([key, categoria]) => (
                        <option key={key} value={key}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: motivacao, trabalho, familia (separadas por vírgula)"
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setNovoPost({ ...novoPost, tags });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonimo"
                    checked={novoPost.anonimo}
                    onChange={(e) => setNovoPost({ ...novoPost, anonimo: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonimo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Postar anonimamente
                  </label>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 <strong>Lembre-se:</strong> Este é um espaço seguro para compartilhar. 
                    Se você estiver em crise, procure ajuda profissional ou ligue para o CVV: 188.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNovoPost({
                      texto: '',
                      emocao: 'feliz',
                      categoria: 'geral',
                      tags: [],
                      anonimo: false
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarPost}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunidade;