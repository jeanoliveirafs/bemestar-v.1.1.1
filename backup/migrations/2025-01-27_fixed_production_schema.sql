-- Migração corrigida para produção - Bem-Estar SaaS
-- Execute este script no SQL Editor do Supabase
-- Data: 2025-01-27
-- Correção: Removido ON CONFLICT para tabelas sem constraints únicos

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis de usuário (estende auth.users)
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

-- Tabela de categorias de hábitos
CREATE TABLE IF NOT EXISTS public.habit_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de hábitos dos usuários
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

-- Tabela de escalas de avaliação psicológica
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

-- Tabela de respostas dos usuários às escalas
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

-- Tabela de posts emocionais
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

-- Tabela de gamificação dos usuários
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

-- Tabela de registro diário de humor
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

-- Tabela de rotinas dos usuários
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

-- Tabela de completamento de hábitos
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

-- Inserir categorias padrão de hábitos (usando INSERT com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Exercício Físico') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Exercício Físico', 'Atividades físicas e exercícios', '🏃‍♂️', '#10B981');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Meditação') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Meditação', 'Práticas de mindfulness e meditação', '🧘‍♀️', '#8B5CF6');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Alimentação') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Alimentação', 'Hábitos alimentares saudáveis', '🥗', '#F59E0B');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Sono') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Sono', 'Qualidade e rotina do sono', '😴', '#3B82F6');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Leitura') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Leitura', 'Hábitos de leitura e aprendizado', '📚', '#EF4444');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Hidratação') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Hidratação', 'Consumo adequado de água', '💧', '#06B6D4');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Gratidão') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Gratidão', 'Práticas de gratidão e positividade', '🙏', '#EC4899');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.habit_categories WHERE name = 'Organização') THEN
        INSERT INTO public.habit_categories (name, description, icon, color) VALUES
        ('Organização', 'Organização pessoal e produtividade', '📋', '#6B7280');
    END IF;
END $$;

-- Inserir escalas psicológicas básicas (usando INSERT com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.psychological_scales WHERE name = 'Escala de Ansiedade GAD-7') THEN
        INSERT INTO public.psychological_scales (name, description, questions, scoring_config, risk_thresholds) VALUES
        ('Escala de Ansiedade GAD-7', 'Escala para avaliação de transtorno de ansiedade generalizada', 
        '[{"id": 1, "text": "Sentir-se nervoso, ansioso ou muito tenso", "type": "likert"}, {"id": 2, "text": "Não conseguir parar ou controlar as preocupações", "type": "likert"}, {"id": 3, "text": "Preocupar-se muito com diferentes coisas", "type": "likert"}, {"id": 4, "text": "Dificuldade para relaxar", "type": "likert"}, {"id": 5, "text": "Ficar tão inquieto que se torna difícil permanecer parado", "type": "likert"}, {"id": 6, "text": "Ficar facilmente aborrecido ou irritado", "type": "likert"}, {"id": 7, "text": "Sentir medo como se algo terrível fosse acontecer", "type": "likert"}]',
        '{"scale": [0, 1, 2, 3], "labels": ["Nunca", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}',
        '{"low": [0, 4], "moderate": [5, 9], "high": [10, 14], "severe": [15, 21]}');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.psychological_scales WHERE name = 'Escala de Depressão PHQ-9') THEN
        INSERT INTO public.psychological_scales (name, description, questions, scoring_config, risk_thresholds) VALUES
        ('Escala de Depressão PHQ-9', 'Escala para avaliação de episódio depressivo maior',
        '[{"id": 1, "text": "Pouco interesse ou prazer em fazer as coisas", "type": "likert"}, {"id": 2, "text": "Sentir-se desanimado, deprimido ou sem esperança", "type": "likert"}, {"id": 3, "text": "Dificuldade para adormecer, continuar dormindo ou dormir demais", "type": "likert"}, {"id": 4, "text": "Sentir-se cansado ou com pouca energia", "type": "likert"}, {"id": 5, "text": "Pouco apetite ou comer demais", "type": "likert"}, {"id": 6, "text": "Sentir-se mal consigo mesmo ou que é um fracasso", "type": "likert"}, {"id": 7, "text": "Dificuldade para se concentrar", "type": "likert"}, {"id": 8, "text": "Mover-se ou falar tão devagar que outras pessoas notaram", "type": "likert"}, {"id": 9, "text": "Pensamentos de que seria melhor estar morto", "type": "likert"}]',
        '{"scale": [0, 1, 2, 3], "labels": ["Nunca", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}',
        '{"low": [0, 4], "moderate": [5, 9], "high": [10, 14], "severe": [15, 27]}');
    END IF;
END $$;

-- Criar políticas RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scale_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Anonymous posts are viewable" ON public.emotion_posts;
CREATE POLICY "Anonymous posts are viewable" ON public.emotion_posts
    FOR SELECT USING (is_anonymous = true AND is_approved = true);

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

-- Políticas para leitura pública de categorias e escalas
DROP POLICY IF EXISTS "Anyone can view habit categories" ON public.habit_categories;
CREATE POLICY "Anyone can view habit categories" ON public.habit_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view psychological scales" ON public.psychological_scales;
CREATE POLICY "Anyone can view psychological scales" ON public.psychological_scales
    FOR SELECT USING (is_active = true);

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

-- Função para definir completion_date automaticamente
CREATE OR REPLACE FUNCTION public.handle_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completion_date = DATE(NEW.completed_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir completion_date automaticamente
DROP TRIGGER IF EXISTS handle_completion_date_habit_completions ON public.habit_completions;
CREATE TRIGGER handle_completion_date_habit_completions
    BEFORE INSERT OR UPDATE ON public.habit_completions
    FOR EACH ROW EXECUTE FUNCTION public.handle_completion_date();

-- Comentários nas tabelas
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON public.user_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_habits_category_id ON public.user_habits(category_id);
CREATE INDEX IF NOT EXISTS idx_user_scale_responses_user_id ON public.user_scale_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_posts_user_id ON public.emotion_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_posts_created_at ON public.emotion_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_mood_logs_user_date ON public.daily_mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_habit ON public.habit_completions(user_id, habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON public.habit_completions(completed_at);

-- Finalização
SELECT 'Migração corrigida executada com sucesso!' as status;