-- ============================================
-- MIGRAÇÃO: Tabelas Ausentes para Chat e IA
-- Data: 27 de Janeiro de 2025
-- Descrição: Adiciona tabelas necessárias para funcionalidades de chat e IA
-- ============================================

-- Habilitar extensão UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: chat_history
-- Descrição: Armazena histórico de conversas com IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'crisis', 'habits', 'emotions', 'routines', 'mindfulness')),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    is_helpful BOOLEAN,
    feedback TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation_type ON public.chat_history(conversation_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- ============================================
-- TABELA: ai_generated_content
-- Descrição: Conteúdo personalizado gerado por IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('tip', 'exercise', 'meditation', 'motivation', 'routine', 'challenge')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    personalization_data JSONB DEFAULT '{}',
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_minutes INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completion_rating INTEGER CHECK (completion_rating >= 1 AND completion_rating <= 5),
    completion_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON public.ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON public.ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_completed ON public.ai_generated_content(is_completed);
CREATE INDEX IF NOT EXISTS idx_ai_content_expires ON public.ai_generated_content(expires_at);

-- ============================================
-- TABELA: ai_content_completions
-- Descrição: Registro de completações de conteúdo IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_content_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_completions_user_id ON public.ai_content_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_completions_content_id ON public.ai_content_completions(content_id);
CREATE INDEX IF NOT EXISTS idx_ai_completions_created_at ON public.ai_content_completions(created_at DESC);

-- ============================================
-- TABELA: ai_content_cache
-- Descrição: Cache de conteúdo IA reutilizável
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_content_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('tip', 'exercise', 'meditation', 'motivation', 'routine', 'challenge')),
    category TEXT,
    title TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    usage_context JSONB DEFAULT '{}',
    popularity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_type ON public.ai_content_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_category ON public.ai_content_cache(category);
CREATE INDEX IF NOT EXISTS idx_ai_cache_active ON public.ai_content_cache(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_cache_popularity ON public.ai_content_cache(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cache_tags ON public.ai_content_cache USING GIN(tags);

-- ============================================
-- TABELA: sound_sessions
-- Descrição: Sessões de sons relaxantes
-- ============================================
CREATE TABLE IF NOT EXISTS public.sound_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sound_type TEXT NOT NULL CHECK (sound_type IN ('rain', 'ocean', 'forest', 'white_noise', 'meditation', 'binaural')),
    duration_minutes INTEGER NOT NULL,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
    volume_level INTEGER DEFAULT 50 CHECK (volume_level >= 0 AND volume_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sound_sessions_user_id ON public.sound_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sound_sessions_sound_type ON public.sound_sessions(sound_type);
CREATE INDEX IF NOT EXISTS idx_sound_sessions_created_at ON public.sound_sessions(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para chat_history
CREATE POLICY "Users can only access their own chat history" ON public.chat_history
    FOR ALL USING (auth.uid() = user_id);

-- Políticas de segurança para ai_generated_content
CREATE POLICY "Users can only access their own AI content" ON public.ai_generated_content
    FOR ALL USING (auth.uid() = user_id);

-- Políticas de segurança para ai_content_completions
CREATE POLICY "Users can only access their own completions" ON public.ai_content_completions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas de segurança para sound_sessions
CREATE POLICY "Users can only access their own sound sessions" ON public.sound_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Cache de conteúdo IA é público para leitura (todos os usuários autenticados)
CREATE POLICY "AI content cache is readable by all authenticated users" ON public.ai_content_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas administradores podem inserir/atualizar no cache
CREATE POLICY "Only service role can modify AI content cache" ON public.ai_content_cache
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON public.chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_content_updated_at
    BEFORE UPDATE ON public.ai_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_cache_updated_at
    BEFORE UPDATE ON public.ai_content_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS PARA AI_CONTENT_CACHE
-- ============================================

-- Inserir conteúdo inicial no cache
INSERT INTO public.ai_content_cache (content_type, category, title, content, tags, usage_context) VALUES
-- Dicas de bem-estar
('tip', 'mindfulness', 'Respiração Consciente', 'Pare por um momento e concentre-se na sua respiração. Inspire profundamente por 4 segundos, segure por 4 segundos e expire por 6 segundos. Repita 5 vezes.', ARRAY['respiração', 'mindfulness', 'ansiedade'], '{"mood_context": ["stressed", "anxious"], "time_of_day": "any"}'),
('tip', 'productivity', 'Técnica Pomodoro', 'Trabalhe por 25 minutos focado em uma tarefa, depois faça uma pausa de 5 minutos. A cada 4 ciclos, faça uma pausa mais longa de 15-30 minutos.', ARRAY['produtividade', 'foco', 'gestão_tempo'], '{"mood_context": ["unfocused", "overwhelmed"], "time_of_day": "work_hours"}'),
('tip', 'sleep', 'Higiene do Sono', 'Evite telas 1 hora antes de dormir. Mantenha o quarto escuro, silencioso e fresco. Estabeleça uma rotina relaxante antes de deitar.', ARRAY['sono', 'relaxamento', 'saúde'], '{"mood_context": ["tired", "restless"], "time_of_day": "evening"}'),

-- Exercícios
('exercise', 'physical', 'Alongamento Matinal', 'Ao acordar, faça estes movimentos: 1) Estique os braços para cima por 10 segundos, 2) Gire o pescoço suavemente, 3) Toque os dedos dos pés, 4) Faça rotações com os ombros.', ARRAY['alongamento', 'manhã', 'energia'], '{"mood_context": ["tired", "sluggish"], "time_of_day": "morning"}'),
('exercise', 'mental', 'Gratidão Diária', 'Escreva 3 coisas pelas quais você é grato hoje. Podem ser pequenas (um café gostoso) ou grandes (saúde da família). Reflita sobre por que cada uma é importante.', ARRAY['gratidão', 'positividade', 'reflexão'], '{"mood_context": ["sad", "neutral"], "time_of_day": "evening"}'),

-- Meditações
('meditation', 'mindfulness', 'Meditação dos 5 Sentidos', 'Identifique: 5 coisas que você pode ver, 4 que pode tocar, 3 que pode ouvir, 2 que pode cheirar, 1 que pode saborear. Isso ajuda a se conectar com o presente.', ARRAY['mindfulness', 'presente', 'ansiedade'], '{"mood_context": ["anxious", "overwhelmed"], "time_of_day": "any"}'),
('meditation', 'relaxation', 'Relaxamento Progressivo', 'Deite-se confortavelmente. Tensione e relaxe cada grupo muscular: pés, pernas, abdômen, braços, ombros, rosto. Mantenha a tensão por 5 segundos, depois relaxe completamente.', ARRAY['relaxamento', 'tensão', 'corpo'], '{"mood_context": ["stressed", "tense"], "time_of_day": "evening"}'),

-- Motivação
('motivation', 'personal_growth', 'Pequenos Passos', 'Grandes mudanças começam com pequenos passos. Hoje, escolha uma ação simples que te aproxime do seu objetivo. Não precisa ser perfeita, apenas consistente.', ARRAY['motivação', 'crescimento', 'consistência'], '{"mood_context": ["unmotivated", "discouraged"], "time_of_day": "morning"}'),
('motivation', 'resilience', 'Força Interior', 'Você já superou 100% dos seus dias difíceis até agora. Isso prova que você tem a força necessária para enfrentar qualquer desafio que apareça hoje.', ARRAY['força', 'superação', 'confiança'], '{"mood_context": ["sad", "discouraged"], "time_of_day": "any"}');

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

-- Esta migração adiciona todas as tabelas necessárias para:
-- 1. Sistema de chat com IA (chat_history)
-- 2. Conteúdo personalizado gerado por IA (ai_generated_content)
-- 3. Registro de completações (ai_content_completions)
-- 4. Cache de conteúdo reutilizável (ai_content_cache)
-- 5. Sessões de sons relaxantes (sound_sessions)
--
-- Todas as tabelas incluem:
-- - RLS (Row Level Security) habilitado
-- - Políticas de segurança apropriadas
-- - Índices para performance
-- - Triggers para campos updated_at
-- - Dados iniciais no cache
--
-- Para executar esta migração:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este código SQL
-- 4. Execute a migração
-- 5. Verifique se todas as tabelas foram criadas corretamente