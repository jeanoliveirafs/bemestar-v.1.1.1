-- =====================================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO E TABELA DE USUÁRIOS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA DE PERFIS DE USUÁRIO
-- =====================================================

-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
    occupation TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Preferências de notificação
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Configurações de privacidade
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Status da conta
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando usuário se registra
DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política: Usuários podem inserir apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política: Usuários podem deletar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile"
    ON public.user_profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter perfil do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.user_profiles AS $$
BEGIN
    RETURN (
        SELECT *
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar último login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET last_login_at = NOW()
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é premium
CREATE OR REPLACE FUNCTION public.is_user_premium()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT 
            subscription_status IN ('premium', 'enterprise') 
            AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONFIGURAÇÕES DE AUTENTICAÇÃO
-- =====================================================

-- Configurar confirmação de email (isso deve ser feito no dashboard do Supabase)
-- UPDATE auth.config SET email_confirm_required = true;

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - REMOVER EM PRODUÇÃO)
-- =====================================================

-- Inserir dados de exemplo apenas se não existirem usuários
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM public.user_profiles LIMIT 1) THEN
--         -- Aqui você pode inserir dados de exemplo se necessário
--         NULL;
--     END IF;
-- END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.user_profiles IS 'Perfis de usuário com informações estendidas';
COMMENT ON COLUMN public.user_profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN public.user_profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.user_profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Status da assinatura: free, premium, enterprise';
COMMENT ON COLUMN public.user_profiles.profile_visibility IS 'Visibilidade do perfil: public, private, friends';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'user_profiles table created' as status,
    COUNT(*) as total_profiles
FROM public.user_profiles;

SELECT 
    'RLS policies active' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

SELECT 'Setup completed successfully!' as message;