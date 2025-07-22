/**
 * Componente para Mural de Emoções Anônimas (Comunidade Segura)
 * Feed onde usuários postam frases curtas anônimas sobre como se sentem
 * Outros usuários podem reagir com emojis de apoio
 */

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Shield, Flag, Send, Filter, Sparkles, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface EmotionPost {
  id: string;
  content: string;
  emotion_category: 'happy' | 'sad' | 'anxious' | 'grateful' | 'frustrated' | 'hopeful' | 'lonely' | 'excited';
  is_anonymous: boolean;
  is_moderated: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reaction_count: number;
  comment_count: number;
  user_reaction?: string;
}

interface EmotionReaction {
  id: string;
  post_id: string;
  reaction_type: string;
  created_at: string;
}

interface EmotionComment {
  id: string;
  post_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

interface ModerationReport {
  id: string;
  post_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const EmotionWall: React.FC = () => {
  const [posts, setPosts] = useState<EmotionPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionPost['emotion_category']>('happy');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [filterBy, setFilterBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showComments, setShowComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, EmotionComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const emotionCategories = {
    happy: { name: 'Feliz', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    sad: { name: 'Triste', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
    anxious: { name: 'Ansioso', emoji: '😰', color: 'bg-orange-100 text-orange-800' },
    grateful: { name: 'Grato', emoji: '🙏', color: 'bg-green-100 text-green-800' },
    frustrated: { name: 'Frustrado', emoji: '😤', color: 'bg-red-100 text-red-800' },
    hopeful: { name: 'Esperançoso', emoji: '🌟', color: 'bg-purple-100 text-purple-800' },
    lonely: { name: 'Sozinho', emoji: '😔', color: 'bg-gray-100 text-gray-800' },
    excited: { name: 'Animado', emoji: '🎉', color: 'bg-pink-100 text-pink-800' }
  };

  const reactionEmojis = {
    heart: '❤️',
    hug: '🤗',
    support: '💪',
    pray: '🙏',
    star: '⭐',
    rainbow: '🌈'
  };

  const reportReasons = [
    'Conteúdo ofensivo',
    'Spam',
    'Informações pessoais',
    'Conteúdo inadequado',
    'Assédio',
    'Outro'
  ];

  useEffect(() => {
    loadPosts();
  }, [filterBy, selectedCategory]);

  /**
   * Carrega posts do mural
   */
  const loadPosts = async () => {
    try {
      let query = supabase
        .from('emotion_posts')
        .select(`
          *,
          emotion_reactions(count),
          emotion_comments(count)
        `)
        .eq('moderation_status', 'approved')
        .eq('is_moderated', true);

      // Filtrar por categoria
      if (selectedCategory !== 'all') {
        query = query.eq('emotion_category', selectedCategory);
      }

      // Ordenar por filtro
      switch (filterBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('reaction_count', { ascending: false });
          break;
        case 'trending':
          // Posts com mais reações nas últimas 24h
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query
            .gte('created_at', yesterday.toISOString())
            .order('reaction_count', { ascending: false });
          break;
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;

      // Processar dados
      const processedPosts = data?.map(post => ({
        ...post,
        reaction_count: post.emotion_reactions?.[0]?.count || 0,
        comment_count: post.emotion_comments?.[0]?.count || 0
      })) || [];

      setPosts(processedPosts);
      
      // Carregar reações do usuário
      await loadUserReactions(processedPosts.map(p => p.id));
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  /**
   * Carrega reações do usuário atual
   */
  const loadUserReactions = async (postIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || postIds.length === 0) return;

      const { data, error } = await supabase
        .from('emotion_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (error) throw error;

      // Atualizar posts com reações do usuário
      setPosts(prev => prev.map(post => {
        const userReaction = data?.find(r => r.post_id === post.id);
        return {
          ...post,
          user_reaction: userReaction?.reaction_type
        };
      }));
    } catch (error) {
      console.error('Erro ao carregar reações do usuário:', error);
    }
  };

  /**
   * Cria novo post
   */
  const createPost = async () => {
    if (!newPost.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('emotion_posts')
        .insert({
          user_id: user.id,
          content: newPost.trim(),
          emotion_category: selectedEmotion,
          is_anonymous: isAnonymous,
          moderation_status: 'pending', // Requer moderação
          is_moderated: false
        });

      if (error) throw error;
      
      setNewPost('');
      
      // Mostrar mensagem de sucesso
      alert('Post enviado! Será revisado antes de aparecer no mural.');
      
      // Recarregar posts se não estiver pendente de moderação
      if (!isAnonymous) {
        loadPosts();
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao enviar post. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona reação a um post
   */
  const addReaction = async (postId: string, reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se já reagiu
      const existingReaction = posts.find(p => p.id === postId)?.user_reaction;
      
      if (existingReaction === reactionType) {
        // Remover reação
        const { error } = await supabase
          .from('emotion_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // Adicionar/atualizar reação
        const { error } = await supabase
          .from('emotion_reactions')
          .upsert({
            user_id: user.id,
            post_id: postId,
            reaction_type: reactionType
          });

        if (error) throw error;
      }

      // Atualizar contadores
      await updateReactionCount(postId);
      loadPosts();
    } catch (error) {
      console.error('Erro ao reagir:', error);
    }
  };

  /**
   * Atualiza contador de reações
   */
  const updateReactionCount = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('emotion_reactions')
        .select('id')
        .eq('post_id', postId);

      if (error) throw error;

      await supabase
        .from('emotion_posts')
        .update({ reaction_count: data?.length || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Erro ao atualizar contador:', error);
    }
  };

  /**
   * Carrega comentários de um post
   */
  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('emotion_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setComments(prev => ({
        ...prev,
        [postId]: data || []
      }));
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  /**
   * Adiciona comentário
   */
  const addComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('emotion_comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
          is_anonymous: true // Comentários sempre anônimos
        });

      if (error) throw error;
      
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
      
      // Atualizar contador de comentários
      await updateCommentCount(postId);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  /**
   * Atualiza contador de comentários
   */
  const updateCommentCount = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('emotion_comments')
        .select('id')
        .eq('post_id', postId);

      if (error) throw error;

      await supabase
        .from('emotion_posts')
        .update({ comment_count: data?.length || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Erro ao atualizar contador:', error);
    }
  };

  /**
   * Reporta post para moderação
   */
  const reportPost = async (postId: string) => {
    if (!reportReason.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('moderation_reports')
        .insert({
          user_id: user.id,
          post_id: postId,
          reason: reportReason,
          description: reportDescription.trim(),
          status: 'pending'
        });

      if (error) throw error;
      
      setShowReportModal(null);
      setReportReason('');
      setReportDescription('');
      
      alert('Obrigado pelo reporte. Nossa equipe irá revisar.');
    } catch (error) {
      console.error('Erro ao reportar post:', error);
    }
  };

  /**
   * Alterna visualização de comentários
   */
  const toggleComments = (postId: string) => {
    const newShowComments = new Set(showComments);
    
    if (newShowComments.has(postId)) {
      newShowComments.delete(postId);
    } else {
      newShowComments.add(postId);
      loadComments(postId);
    }
    
    setShowComments(newShowComments);
  };

  /**
   * Formata tempo relativo
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Users className="w-8 h-8 mr-3 text-purple-600" />
          Mural de Emoções
        </h1>
        <p className="text-gray-600 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-green-600" />
          Compartilhe seus sentimentos de forma anônima e segura
        </p>
      </div>

      {/* Formulário de Novo Post */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Como você está se sentindo?
        </h3>
        
        <div className="space-y-4">
          {/* Seletor de Emoção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria da emoção
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(emotionCategories).map(([key, emotion]) => (
                <button
                  key={key}
                  onClick={() => setSelectedEmotion(key as EmotionPost['emotion_category'])}
                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                    selectedEmotion === key
                      ? 'bg-purple-600 text-white'
                      : emotion.color
                  }`}
                >
                  {emotion.emoji} {emotion.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Área de Texto */}
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Compartilhe como você está se sentindo... (máximo 280 caracteres)"
            className="w-full border rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={280}
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Postar anonimamente</span>
              </label>
              <span className="text-xs text-gray-500">
                {newPost.length}/280
              </span>
            </div>
            
            <button
              onClick={createPost}
              disabled={isLoading || !newPost.trim()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Compartilhar'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          {/* Filtro por Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">Todas as emoções</option>
            {Object.entries(emotionCategories).map(([key, emotion]) => (
              <option key={key} value={key}>
                {emotion.emoji} {emotion.name}
              </option>
            ))}
          </select>
          
          {/* Filtro por Popularidade */}
          <div className="flex rounded-lg border overflow-hidden">
            {[
              { key: 'recent', label: 'Recentes', icon: null },
              { key: 'popular', label: 'Populares', icon: Heart },
              { key: 'trending', label: 'Em alta', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterBy(key as any)}
                className={`px-3 py-1 text-sm flex items-center ${
                  filterBy === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {posts.map((post) => {
          const emotion = emotionCategories[post.emotion_category];
          const isShowingComments = showComments.has(post.id);
          
          return (
            <div key={post.id} className="bg-white rounded-lg border p-6">
              {/* Header do Post */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${emotion.color}`}>
                    {emotion.emoji} {emotion.name}
                  </span>
                  {post.is_anonymous && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Anônimo
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(post.created_at)}
                  </span>
                  <button
                    onClick={() => setShowReportModal(post.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Reportar"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Conteúdo */}
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
              
              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  {/* Reações */}
                  <div className="flex items-center space-x-1">
                    {Object.entries(reactionEmojis).map(([key, emoji]) => (
                      <button
                        key={key}
                        onClick={() => addReaction(post.id, key)}
                        className={`p-2 rounded-full transition-colors ${
                          post.user_reaction === key
                            ? 'bg-purple-100 text-purple-600'
                            : 'hover:bg-gray-100'
                        }`}
                        title={`Reagir com ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  {/* Contador de Reações */}
                  {post.reaction_count > 0 && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      {post.reaction_count}
                    </span>
                  )}
                </div>
                
                {/* Comentários */}
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center text-sm text-gray-600 hover:text-purple-600"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comment_count} comentários
                </button>
              </div>
              
              {/* Seção de Comentários */}
              {isShowingComments && (
                <div className="mt-4 pt-4 border-t">
                  {/* Lista de Comentários */}
                  <div className="space-y-3 mb-4">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            Anônimo
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Adicionar Comentário */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Deixe uma mensagem de apoio..."
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      maxLength={200}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nenhum post encontrado para os filtros selecionados
            </p>
            <p className="text-sm text-gray-500">
              Seja o primeiro a compartilhar seus sentimentos!
            </p>
          </div>
        )}
      </div>

      {/* Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reportar Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do reporte
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Selecione um motivo</option>
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição adicional (opcional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Forneça mais detalhes se necessário..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => reportPost(showReportModal)}
                disabled={!reportReason}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionWall;