-- =====================================================
-- MIGRAÇÃO COMPLETA PARA SISTEMA DE BEM-ESTAR
-- Data: 22/01/2025
-- Descrição: Criação de todas as tabelas para funcionalidades avançadas
-- =====================================================

-- 1. ESCALAS PSICOLÓGICAS E AUTOAVALIAÇÕES
-- =====================================================

-- Tabela para tipos de escalas/questionários
CREATE TABLE psychological_scales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- PHQ-9, GAD-7, etc.
    description TEXT,
    category VARCHAR(50), -- mood, anxiety, stress, etc.
    total_questions INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    interpretation_ranges JSONB, -- {"mild": [0,4], "moderate": [5,9], "severe": [10,27]}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para perguntas das escalas
CREATE TABLE scale_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scale_id UUID REFERENCES psychological_scales(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    answer_options JSONB NOT NULL, -- [{"value": 0, "text": "Nunca"}, {"value": 1, "text": "Às vezes"}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para respostas dos usuários
CREATE TABLE user_scale_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Referência ao usuário
    scale_id UUID REFERENCES psychological_scales(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- {"question_1": 2, "question_2": 1, ...}
    total_score INTEGER NOT NULL,
    risk_level VARCHAR(20), -- low, moderate, high, severe
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 2. PLANO DE AÇÃO EM CRISES
-- =====================================================

-- Tabela para exercícios de emergência
CREATE TABLE crisis_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- breathing, grounding, audio, video
    content_url TEXT, -- URL para áudio/vídeo
    instructions TEXT NOT NULL,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20), -- easy, medium, hard
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para contatos de emergência do usuário
CREATE TABLE user_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    relationship VARCHAR(50), -- family, friend, therapist, doctor
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registrar uso de planos de crise
CREATE TABLE crisis_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    trigger_reason TEXT,
    exercises_used JSONB, -- IDs dos exercícios utilizados
    contacts_called JSONB, -- IDs dos contatos acionados
    duration_minutes INTEGER,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GAMIFICAÇÃO DE HÁBITOS
-- =====================================================

-- Tabela para tipos de medalhas/conquistas
CREATE TABLE achievement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50), -- nome do ícone
    category VARCHAR(50), -- habits, mood, social, streak
    points_reward INTEGER DEFAULT 0,
    requirements JSONB, -- {"type": "streak", "days": 7, "habit_category": "meditation"}
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para conquistas dos usuários
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    achievement_id UUID REFERENCES achievement_types(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB -- dados específicos do progresso
);

-- Tabela para sistema de pontos e níveis
CREATE TABLE user_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ROTINA PERSONALIZADA COM LEMBRETES
-- =====================================================

-- Tabela para tipos de hábitos
CREATE TABLE habit_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    color_hex VARCHAR(7), -- #FF5733
    default_points INTEGER DEFAULT 10
);

-- Tabela para hábitos personalizados do usuário
CREATE TABLE user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID REFERENCES habit_categories(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    frequency_type VARCHAR(20), -- daily, weekly, custom
    frequency_config JSONB, -- {"days": ["monday", "wednesday"], "times": ["09:00", "18:00"]}
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_times JSONB, -- ["09:00", "18:00"]
    target_duration_minutes INTEGER,
    points_per_completion INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registros de conclusão de hábitos
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    habit_id UUID REFERENCES user_habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
    notes TEXT,
    points_earned INTEGER DEFAULT 0
);

-- 5. MURAL DE EMOÇÕES ANÔNIMAS
-- =====================================================

-- Tabela para posts anônimos
CREATE TABLE emotion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Para moderação, mas não exibido
    anonymous_id VARCHAR(20) NOT NULL, -- ID anônimo gerado (ex: "Usuário#1234")
    content TEXT NOT NULL CHECK (LENGTH(content) <= 280), -- Limite tipo Twitter
    emotion_category VARCHAR(50), -- happy, sad, anxious, grateful, etc.
    is_anonymous BOOLEAN DEFAULT true,
    is_moderated BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para reações aos posts
CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES emotion_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL, -- heart, hug, support, strength, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- 6. CONTEÚDO DINÂMICO GERADO POR IA
-- =====================================================

-- Tabela para conteúdos gerados pela IA
CREATE TABLE ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- NULL para conteúdo geral
    content_type VARCHAR(50), -- exercise, motivation, tip, affirmation
    title VARCHAR(200),
    content TEXT NOT NULL,
    personalization_data JSONB, -- dados usados para personalização
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,2) -- média das avaliações dos usuários
);

-- Tabela para interações do usuário com conteúdo IA
CREATE TABLE user_ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID REFERENCES ai_generated_content(id),
    interaction_type VARCHAR(50), -- viewed, completed, rated, shared
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RELATÓRIOS E MÉTRICAS
-- =====================================================

-- Tabela para registros diários de humor
CREATE TABLE daily_mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    sleep_hours DECIMAL(3,1),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Tabela para metas do usuário
CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- health, habits, mood, social
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20), -- days, hours, points, etc.
    target_date DATE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INTEGRAÇÃO COM SOM E MINDFULNESS
-- =====================================================

-- Tabela para sons ambiente
CREATE TABLE ambient_sounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- nature, urban, white_noise, music
    file_url TEXT NOT NULL,
    duration_seconds INTEGER,
    is_premium BOOLEAN DEFAULT false,
    mood_tags JSONB, -- ["relaxing", "energizing", "focus"]
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões de mindfulness
CREATE TABLE mindfulness_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_type VARCHAR(50), -- meditation, breathing, body_scan
    sound_id UUID REFERENCES ambient_sounds(id),
    duration_minutes INTEGER NOT NULL,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_scale_responses_user_id ON user_scale_responses(user_id);
CREATE INDEX idx_user_scale_responses_completed_at ON user_scale_responses(completed_at);
CREATE INDEX idx_crisis_activations_user_id ON crisis_activations(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at);
CREATE INDEX idx_emotion_posts_created_at ON emotion_posts(created_at);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_daily_mood_logs_user_id_date ON daily_mood_logs(user_id, date);
CREATE INDEX idx_mindfulness_sessions_user_id ON mindfulness_sessions(user_id);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir escalas psicológicas padrão
INSERT INTO psychological_scales (name, description, category, total_questions, max_score, interpretation_ranges) VALUES
('PHQ-9', 'Patient Health Questionnaire - Depressão', 'mood', 9, 27, '{"minimal": [0,4], "mild": [5,9], "moderate": [10,14], "moderately_severe": [15,19], "severe": [20,27]}'),
('GAD-7', 'Generalized Anxiety Disorder Scale', 'anxiety', 7, 21, '{"minimal": [0,4], "mild": [5,9], "moderate": [10,14], "severe": [15,21]}'),
('PSS-10', 'Perceived Stress Scale', 'stress', 10, 40, '{"low": [0,13], "moderate": [14,26], "high": [27,40]}');

-- Inserir categorias de hábitos
INSERT INTO habit_categories (name, description, icon_name, color_hex, default_points) VALUES
('Meditação', 'Práticas de mindfulness e meditação', 'brain', '#8B5CF6', 15),
('Exercício', 'Atividades físicas e movimento', 'activity', '#10B981', 20),
('Sono', 'Hábitos relacionados ao sono', 'moon', '#3B82F6', 10),
('Alimentação', 'Hábitos alimentares saudáveis', 'apple', '#F59E0B', 10),
('Social', 'Conexões sociais e relacionamentos', 'users', '#EF4444', 15),
('Criatividade', 'Atividades criativas e hobbies', 'palette', '#EC4899', 12);

-- Inserir tipos de conquistas
INSERT INTO achievement_types (name, description, icon_name, category, points_reward, requirements, rarity) VALUES
('Primeiro Passo', 'Complete seu primeiro hábito', 'star', 'habits', 50, '{"type": "first_habit"}', 'common'),
('Semana Consistente', 'Complete hábitos por 7 dias seguidos', 'calendar', 'streak', 100, '{"type": "streak", "days": 7}', 'rare'),
('Mestre da Meditação', 'Complete 30 sessões de meditação', 'brain', 'habits', 200, '{"type": "habit_count", "category": "Meditação", "count": 30}', 'epic'),
('Apoiador da Comunidade', 'Reaja a 50 posts no mural de emoções', 'heart', 'social', 150, '{"type": "reactions", "count": 50}', 'rare');

-- Inserir exercícios de crise
INSERT INTO crisis_exercises (title, description, type, instructions, duration_minutes, difficulty_level) VALUES
('Respiração 4-7-8', 'Técnica de respiração para acalmar a ansiedade', 'breathing', 'Inspire por 4 segundos, segure por 7, expire por 8. Repita 4 vezes.', 5, 'easy'),
('Técnica 5-4-3-2-1', 'Grounding para ataques de pânico', 'grounding', 'Identifique: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia.', 10, 'easy'),
('Meditação de Emergência', 'Meditação guiada para momentos de crise', 'audio', 'Siga a meditação guiada focando na respiração e no momento presente.', 15, 'medium');

-- Inserir sons ambiente
INSERT INTO ambient_sounds (name, description, category, file_url, duration_seconds, mood_tags) VALUES
('Chuva Suave', 'Som relaxante de chuva leve', 'nature', '/sounds/rain.mp3', 3600, '["relaxing", "sleep", "focus"]'),
('Floresta Tropical', 'Sons da natureza com pássaros', 'nature', '/sounds/forest.mp3', 3600, '["energizing", "nature", "morning"]'),
('Ondas do Mar', 'Som das ondas quebrando na praia', 'nature', '/sounds/ocean.mp3', 3600, '["relaxing", "meditation", "peace"]'),
('Ruído Branco', 'Ruído branco para concentração', 'white_noise', '/sounds/white_noise.mp3', 3600, '["focus", "study", "concentration"]');

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Para executar esta migração no Supabase:
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 
-- Ou via Supabase CLI:
-- supabase db reset
-- supabase db push