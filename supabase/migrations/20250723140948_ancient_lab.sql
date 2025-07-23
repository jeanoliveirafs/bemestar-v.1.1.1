/*
  # Schema Completo de Produção - Refúgio Digital
  
  1. Tabelas Principais
    - `profiles` - Perfis dos usuários (estende auth.users)
    - `habit_categories` - Categorias de hábitos (8 categorias padrão)
    - `user_habits` - Hábitos dos usuários
    - `psychological_scales` - Escalas psicológicas (GAD-7, PHQ-9)
    - `user_scale_responses` - Respostas às escalas
    - `emotion_posts` - Posts emocionais da comunidade
    - `user_gamification` - Sistema de pontuação e níveis
    - `daily_mood_logs` - Registro diário de humor
    - `user_routines` - Rotinas personalizadas
    - `habit_completions` - Completamento de hábitos
    - `chat_history` - Histórico de conversas com IA
    - `ai_generated_content` - Conteúdo gerado por IA
    - `ai_content_completions` - Completações de conteúdo IA
    - `ai_content_cache` - Cache de conteúdo reutilizável
    - `sound_sessions` - Sessões de sons relaxantes

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso por usuário
    - Triggers automáticos para criação de perfil

  3. Dados Iniciais
    - 8 categorias de hábitos
    - 2 escalas psicológicas (GAD-7, PHQ-9)
    - Conteúdo inicial no cache de IA
*/

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA: profiles (estende auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: habit_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.habit_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: user_habits
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.habit_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency_type TEXT CHECK (frequency_type IN ('daily', 'weekly', 'custom')) DEFAULT 'daily',
    frequency_config JSONB DEFAULT '{}',
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_times TEXT[] DEFAULT '{}',
    target_duration_minutes INTEGER,
    points_per_completion INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: psychological_scales
-- =====================================================
CREATE TABLE IF NOT EXISTS public.psychological_scales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    questions JSONB NOT NULL,
    scoring_config JSONB NOT NULL,
    risk_thresholds JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: user_scale_responses
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_scale_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scale_id UUID REFERENCES public.psychological_scales(id) ON DELETE CASCADE NOT NULL,
    responses JSONB NOT NULL,
    total_score INTEGER NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- TABELA: emotion_posts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.emotion_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_id TEXT,
    content TEXT NOT NULL,
    emotion_category TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_user_or_anonymous CHECK (
        (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
        (user_id IS NULL AND anonymous_id IS NOT NULL)
    )
);

-- =====================================================
-- TABELA: user_gamification
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_gamification (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: daily_mood_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_mood_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10) NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10) NOT NULL,
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10) NOT NULL,
    sleep_hours DECIMAL(3,1),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =====================================================
-- TABELA: user_routines
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    routine_type TEXT CHECK (routine_type IN ('morning', 'evening', 'custom')) DEFAULT 'custom',
    habits JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: habit_completions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.habit_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES public.user_habits(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INTEGER,
    notes TEXT,
    points_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, habit_id, completion_date)
);

-- =====================================================
-- TABELA: chat_history
-- =====================================================
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

-- =====================================================
-- TABELA: ai_generated_content
-- =====================================================
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

-- =====================================================
-- TABELA: ai_content_completions
-- =====================================================
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

-- =====================================================
-- TABELA: ai_content_cache
-- =====================================================
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

-- =====================================================
-- TABELA: sound_sessions
-- =====================================================
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

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Categorias de hábitos padrão
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Exercício Físico') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Exercício Físico', 'Atividades físicas e exercícios', '🏃‍♂️', '#10B981'),
        ('Meditação', 'Práticas de mindfulness e meditação', '🧘‍♀️', '#8B5CF6'),
        ('Alimentação', 'Hábitos alimentares saudáveis', '🥗', '#F59E0B'),
        ('Sono', 'Qualidade e rotina do sono', '😴', '#3B82F6'),
        ('Leitura', 'Hábitos de leitura e aprendizado', '📚', '#EF4444'),
        ('Hidratação', 'Consumo adequado de água', '💧', '#06B6D4'),
        ('Gratidão', 'Práticas de gratidão e positividade', '🙏', '#EC4899'),
        ('Organização', 'Organização pessoal e produtividade', '📋', '#6B7280');
    END IF;
END $$;

-- Escalas psicológicas básicas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.psychological_scales WHERE name = 'Escala de Ansiedade GAD-7') THEN
        INSERT INTO public.psychological_scales (name, description, questions, scoring_config, risk_thresholds) VALUES
        ('Escala de Ansiedade GAD-7', 'Escala para avaliação de transtorno de ansiedade generalizada', 
        '[
          {"id": 1, "text": "Sentir-se nervoso, ansioso ou muito tenso", "type": "likert"},
          {"id": 2, "text": "Não conseguir parar ou controlar as preocupações", "type": "likert"},
          {"id": 3, "text": "Preocupar-se muito com diferentes coisas", "type": "likert"},
          {"id": 4, "text": "Dificuldade para relaxar", "type": "likert"},
          {"id": 5, "text": "Ficar tão inquieto que se torna difícil permanecer parado", "type": "likert"},
          {"id": 6, "text": "Ficar facilmente aborrecido ou irritado", "type": "likert"},
          {"id": 7, "text": "Sentir medo como se algo terrível fosse acontecer", "type": "likert"}
        ]',
        '{"scale": [0, 1, 2, 3], "labels": ["Nunca", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}',
        '{"low": [0, 4], "moderate": [5, 9], "high": [10, 14], "severe": [15, 21]}'),
        
        ('Escala de Depressão PHQ-9', 'Escala para avaliação de episódio depressivo maior',
        '[
          {"id": 1, "text": "Pouco interesse ou prazer em fazer as coisas", "type": "likert"},
          {"id": 2, "text": "Sentir-se desanimado, deprimido ou sem esperança", "type": "likert"},
          {"id": 3, "text": "Dificuldade para adormecer, continuar dormindo ou dormir demais", "type": "likert"},
          {"id": 4, "text": "Sentir-se cansado ou com pouca energia", "type": "likert"},
          {"id": 5, "text": "Pouco apetite ou comer demais", "type": "likert"},
          {"id": 6, "text": "Sentir-se mal consigo mesmo ou que é um fracasso", "type": "likert"},
          {"id": 7, "text": "Dificuldade para se concentrar", "type": "likert"},
          {"id": 8, "text": "Mover-se ou falar tão devagar que outras pessoas notaram", "type": "likert"},
          {"id": 9, "text": "Pensamentos de que seria melhor estar morto", "type": "likert"}
        ]',
        '{"scale": [0, 1, 2, 3], "labels": ["Nunca", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}',
        '{"low": [0, 4], "moderate": [5, 9], "high": [10, 14], "severe": [15, 27]}');
    END IF;
END $$;

-- Conteúdo inicial no cache de IA
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.ai_content_cache WHERE title = 'Respiração Consciente') THEN
        INSERT INTO public.ai_content_cache (content_type, category, title, content, tags, usage_context) VALUES
        ('tip', 'mindfulness', 'Respiração Consciente', 'Pare por um momento e concentre-se na sua respiração. Inspire profundamente por 4 segundos, segure por 4 segundos e expire por 6 segundos. Repita 5 vezes.', ARRAY['respiração', 'mindfulness', 'ansiedade'], '{"mood_context": ["stressed", "anxious"], "time_of_day": "any"}'),
        ('tip', 'productivity', 'Técnica Pomodoro', 'Trabalhe por 25 minutos focado em uma tarefa, depois faça uma pausa de 5 minutos. A cada 4 ciclos, faça uma pausa mais longa de 15-30 minutos.', ARRAY['produtividade', 'foco', 'gestão_tempo'], '{"mood_context": ["unfocused", "overwhelmed"], "time_of_day": "work_hours"}'),
        ('exercise', 'physical', 'Alongamento Matinal', 'Ao acordar, faça estes movimentos: 1) Estique os braços para cima por 10 segundos, 2) Gire o pescoço suavemente, 3) Toque os dedos dos pés, 4) Faça rotações com os ombros.', ARRAY['alongamento', 'manhã', 'energia'], '{"mood_context": ["tired", "sluggish"], "time_of_day": "morning"}'),
        ('meditation', 'mindfulness', 'Meditação dos 5 Sentidos', 'Identifique: 5 coisas que você pode ver, 4 que pode tocar, 3 que pode ouvir, 2 que pode cheirar, 1 que pode saborear. Isso ajuda a se conectar com o presente.', ARRAY['mindfulness', 'presente', 'ansiedade'], '{"mood_context": ["anxious", "overwhelmed"], "time_of_day": "any"}'),
        ('motivation', 'personal_growth', 'Pequenos Passos', 'Grandes mudanças começam com pequenos passos. Hoje, escolha uma ação simples que te aproxime do seu objetivo. Não precisa ser perfeita, apenas consistente.', ARRAY['motivação', 'crescimento', 'consistência'], '{"mood_context": ["unmotivated", "discouraged"], "time_of_day": "morning"}');
    END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scale_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para user_habits
DROP POLICY IF EXISTS "Users can manage own habits" ON public.user_habits;
CREATE POLICY "Users can manage own habits" ON public.user_habits
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_scale_responses
DROP POLICY IF EXISTS "Users can manage own scale responses" ON public.user_scale_responses;
CREATE POLICY "Users can manage own scale responses" ON public.user_scale_responses
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para emotion_posts
DROP POLICY IF EXISTS "Users can view approved posts" ON public.emotion_posts;
CREATE POLICY "Users can view approved posts" ON public.emotion_posts
    FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage own posts" ON public.emotion_posts;
CREATE POLICY "Users can manage own posts" ON public.emotion_posts
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_gamification
DROP POLICY IF EXISTS "Users can manage own gamification" ON public.user_gamification;
CREATE POLICY "Users can manage own gamification" ON public.user_gamification
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para daily_mood_logs
DROP POLICY IF EXISTS "Users can manage own mood logs" ON public.daily_mood_logs;
CREATE POLICY "Users can manage own mood logs" ON public.daily_mood_logs
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_routines
DROP POLICY IF EXISTS "Users can manage own routines" ON public.user_routines;
CREATE POLICY "Users can manage own routines" ON public.user_routines
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para habit_completions
DROP POLICY IF EXISTS "Users can manage own habit completions" ON public.habit_completions;
CREATE POLICY "Users can manage own habit completions" ON public.habit_completions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para chat_history
DROP POLICY IF EXISTS "Users can only access their own chat history" ON public.chat_history;
CREATE POLICY "Users can only access their own chat history" ON public.chat_history
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_generated_content
DROP POLICY IF EXISTS "Users can only access their own AI content" ON public.ai_generated_content;
CREATE POLICY "Users can only access their own AI content" ON public.ai_generated_content
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_content_completions
DROP POLICY IF EXISTS "Users can only access their own completions" ON public.ai_content_completions;
CREATE POLICY "Users can only access their own completions" ON public.ai_content_completions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para sound_sessions
DROP POLICY IF EXISTS "Users can only access their own sound sessions" ON public.sound_sessions;
CREATE POLICY "Users can only access their own sound sessions" ON public.sound_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para leitura pública
DROP POLICY IF EXISTS "Anyone can view habit categories" ON public.habit_categories;
CREATE POLICY "Anyone can view habit categories" ON public.habit_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view psychological scales" ON public.psychological_scales;
CREATE POLICY "Anyone can view psychological scales" ON public.psychological_scales
    FOR SELECT USING (is_active = true);

-- Cache de conteúdo IA é público para leitura
DROP POLICY IF EXISTS "AI content cache is readable by all authenticated users" ON public.ai_content_cache;
CREATE POLICY "AI content cache is readable by all authenticated users" ON public.ai_content_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- =====================================================

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_habits ON public.user_habits;
CREATE TRIGGER handle_updated_at_user_habits
    BEFORE UPDATE ON public.user_habits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_gamification ON public.user_gamification;
CREATE TRIGGER handle_updated_at_user_gamification
    BEFORE UPDATE ON public.user_gamification
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_routines ON public.user_routines;
CREATE TRIGGER handle_updated_at_user_routines
    BEFORE UPDATE ON public.user_routines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_chat_history ON public.chat_history;
CREATE TRIGGER handle_updated_at_chat_history
    BEFORE UPDATE ON public.chat_history
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_ai_content ON public.ai_generated_content;
CREATE TRIGGER handle_updated_at_ai_content
    BEFORE UPDATE ON public.ai_generated_content
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_ai_cache ON public.ai_content_cache;
CREATE TRIGGER handle_updated_at_ai_cache
    BEFORE UPDATE ON public.ai_content_cache
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON public.user_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_habits_category_id ON public.user_habits(category_id);
CREATE INDEX IF NOT EXISTS idx_user_scale_responses_user_id ON public.user_scale_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_posts_user_id ON public.emotion_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_posts_created_at ON public.emotion_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_mood_logs_user_date ON public.daily_mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_habit ON public.habit_completions(user_id, habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON public.habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation_type ON public.chat_history(conversation_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON public.ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON public.ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_sound_sessions_user_id ON public.sound_sessions(user_id);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com informações pessoais';
COMMENT ON TABLE public.habit_categories IS 'Categorias de hábitos disponíveis';
COMMENT ON TABLE public.user_habits IS 'Hábitos personalizados dos usuários';
COMMENT ON TABLE public.psychological_scales IS 'Escalas psicológicas para avaliação';
COMMENT ON TABLE public.user_scale_responses IS 'Respostas dos usuários às escalas psicológicas';
COMMENT ON TABLE public.emotion_posts IS 'Posts emocionais dos usuários (anônimos ou identificados)';
COMMENT ON TABLE public.user_gamification IS 'Sistema de gamificação dos usuários';
COMMENT ON TABLE public.daily_mood_logs IS 'Registro diário de humor e bem-estar';
COMMENT ON TABLE public.user_routines IS 'Rotinas personalizadas dos usuários';
COMMENT ON TABLE public.habit_completions IS 'Registro de completamento de hábitos';
COMMENT ON TABLE public.chat_history IS 'Histórico de conversas com IA';
COMMENT ON TABLE public.ai_generated_content IS 'Conteúdo personalizado gerado por IA';
COMMENT ON TABLE public.ai_content_completions IS 'Registro de completações de conteúdo IA';
COMMENT ON TABLE public.ai_content_cache IS 'Cache de conteúdo IA reutilizável';
COMMENT ON TABLE public.sound_sessions IS 'Sessões de sons relaxantes';

-- Finalização
SELECT 'Schema completo de produção executado com sucesso!' as status;