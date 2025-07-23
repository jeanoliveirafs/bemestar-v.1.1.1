# 🗄️ Comandos SQL para Usar no Supabase

## 📋 Visão Geral

Este guia mostra exatamente quais comandos SQL você deve executar no **SQL Editor do Supabase** para configurar completamente o banco de dados da aplicação Bem-Estar.

## 🚀 Como Executar

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto
- Clique em **"SQL Editor"** no menu lateral

### 2. Execute o Script Completo
- Copie todo o conteúdo do arquivo: `migrations/2025-01-27_fixed_production_schema.sql`
- Cole no SQL Editor
- Clique em **"Run"**

## 📄 Script SQL Completo

```sql
-- Migração corrigida para produção - Bem-Estar SaaS
-- Execute este script no SQL Editor do Supabase
-- Data: 2025-01-27

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
```

## 🔧 Configurações de Segurança (RLS)

```sql
-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scale_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para outras tabelas
CREATE POLICY "Users can manage own habits" ON public.user_habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scale responses" ON public.user_scale_responses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own gamification" ON public.user_gamification
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mood logs" ON public.daily_mood_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own routines" ON public.user_routines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit completions" ON public.habit_completions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para leitura pública
CREATE POLICY "Anyone can view habit categories" ON public.habit_categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view psychological scales" ON public.psychological_scales
    FOR SELECT USING (is_active = true);
```

## 🤖 Triggers e Funções Automáticas

```sql
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
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_habits
    BEFORE UPDATE ON public.user_habits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 📊 Dados Iniciais (Categorias e Escalas)

```sql
-- Inserir categorias padrão de hábitos
INSERT INTO public.habit_categories (name, description, icon, color) VALUES
('Exercício Físico', 'Atividades físicas e exercícios', '🏃‍♂️', '#10B981'),
('Meditação', 'Práticas de mindfulness e meditação', '🧘‍♀️', '#8B5CF6'),
('Alimentação', 'Hábitos alimentares saudáveis', '🥗', '#F59E0B'),
('Sono', 'Qualidade e rotina do sono', '😴', '#3B82F6'),
('Leitura', 'Hábitos de leitura e aprendizado', '📚', '#EF4444'),
('Hidratação', 'Consumo adequado de água', '💧', '#06B6D4'),
('Gratidão', 'Práticas de gratidão e positividade', '🙏', '#EC4899'),
('Organização', 'Organização pessoal e produtividade', '📋', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Inserir escalas psicológicas
INSERT INTO public.psychological_scales (name, description, questions, scoring_config, risk_thresholds) VALUES
('Escala de Ansiedade GAD-7', 'Escala para avaliação de transtorno de ansiedade generalizada', 
'[{"id": 1, "text": "Sentir-se nervoso, ansioso ou muito tenso", "type": "likert"}]',
'{"scale": [0, 1, 2, 3], "labels": ["Nunca", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]}',
'{"low": [0, 4], "moderate": [5, 9], "high": [10, 14], "severe": [15, 21]}')
ON CONFLICT (name) DO NOTHING;
```

## 🔍 Comandos de Verificação

### Verificar se as tabelas foram criadas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar políticas RLS:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Verificar triggers:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### Verificar dados iniciais:
```sql
-- Verificar categorias
SELECT * FROM public.habit_categories;

-- Verificar escalas
SELECT name, description FROM public.psychological_scales;
```

## ⚠️ Importante

1. **Execute o script completo** do arquivo `migrations/2025-01-27_fixed_production_schema.sql`
2. **Não execute parcialmente** - o script foi projetado para ser executado integralmente
3. **Verifique se não há erros** no console do SQL Editor
4. **Teste a autenticação** após executar para garantir que os triggers funcionam

## 🎯 Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste o registro** de um novo usuário
3. **Verifique se o perfil** é criado automaticamente
4. **Configure as variáveis de ambiente** no Vercel
5. **Faça o deploy** da aplicação

## 📱 URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql
- **Documentação**: https://supabase.com/docs

---

**✅ Com este script SQL, seu banco de dados estará completamente configurado para a aplicação Bem-Estar!**