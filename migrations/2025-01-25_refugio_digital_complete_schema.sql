-- =====================================================
-- REFÚGIO DIGITAL - SCHEMA COMPLETO
-- Data: 2025-01-25
-- Descrição: Estrutura completa de tabelas para o SaaS Refúgio Digital
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA: usuarios
-- Descrição: Dados dos usuários do sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    avatar_url TEXT,
    data_nascimento DATE,
    telefone VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: habitos
-- Descrição: Hábitos dos usuários para gamificação
-- =====================================================
CREATE TABLE IF NOT EXISTS habitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    meta_diaria INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, pausado, concluido
    pontos INTEGER DEFAULT 0,
    streak_atual INTEGER DEFAULT 0,
    melhor_streak INTEGER DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50) DEFAULT 'star',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: habito_registros
-- Descrição: Registro diário dos hábitos
-- =====================================================
CREATE TABLE IF NOT EXISTS habito_registros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habito_id UUID REFERENCES habitos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    data_registro DATE NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    progresso INTEGER DEFAULT 0,
    notas TEXT,
    pontos_ganhos INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: avaliacoes
-- Descrição: Autoavaliações psicológicas dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL, -- ansiedade, depressao, estresse, humor_geral
    escala VARCHAR(50) NOT NULL, -- phq9, gad7, pss, custom
    valor INTEGER NOT NULL CHECK (valor >= 1 AND valor <= 10),
    pontuacao_total INTEGER,
    nivel_risco VARCHAR(50), -- baixo, moderado, alto, severo
    respostas JSONB, -- Armazena todas as respostas do questionário
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: rotinas
-- Descrição: Tarefas e rotinas personalizadas
-- =====================================================
CREATE TABLE IF NOT EXISTS rotinas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    horario TIME,
    dias_semana INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=domingo, 7=sábado
    data_inicio DATE DEFAULT CURRENT_DATE,
    data_fim DATE,
    prioridade VARCHAR(20) DEFAULT 'media', -- baixa, media, alta
    cor VARCHAR(7) DEFAULT '#10B981',
    icone VARCHAR(50) DEFAULT 'calendar',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: rotina_execucoes
-- Descrição: Execuções das rotinas
-- =====================================================
CREATE TABLE IF NOT EXISTS rotina_execucoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rotina_id UUID REFERENCES rotinas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    data_execucao DATE NOT NULL,
    horario_execucao TIME,
    concluido BOOLEAN DEFAULT FALSE,
    tempo_gasto INTEGER, -- em minutos
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    notas TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: emocao_posts
-- Descrição: Posts do mural de emoções (comunidade)
-- =====================================================
CREATE TABLE IF NOT EXISTS emocao_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    emocao VARCHAR(50), -- feliz, triste, ansioso, calmo, etc
    anonimo BOOLEAN DEFAULT FALSE,
    moderado BOOLEAN DEFAULT FALSE,
    aprovado BOOLEAN DEFAULT TRUE,
    curtidas INTEGER DEFAULT 0,
    comentarios INTEGER DEFAULT 0,
    tags TEXT[],
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: emocao_reacoes
-- Descrição: Reações aos posts do mural
-- =====================================================
CREATE TABLE IF NOT EXISTS emocao_reacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES emocao_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_reacao VARCHAR(20) NOT NULL, -- curtir, apoiar, abraco
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, tipo_reacao)
);

-- =====================================================
-- TABELA: historico_chat
-- Descrição: Histórico de conversas com IA
-- =====================================================
CREATE TABLE IF NOT EXISTS historico_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    sessao_id UUID DEFAULT uuid_generate_v4(),
    mensagem_usuario TEXT NOT NULL,
    resposta_ia TEXT NOT NULL,
    contexto VARCHAR(100), -- geral, crise, habitos, rotina
    tokens_usados INTEGER,
    tempo_resposta INTEGER, -- em milissegundos
    avaliacao_usuario INTEGER CHECK (avaliacao_usuario >= 1 AND avaliacao_usuario <= 5),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: contatos_emergencia
-- Descrição: Contatos de emergência personalizados
-- =====================================================
CREATE TABLE IF NOT EXISTS contatos_emergencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    relacao VARCHAR(100), -- familia, amigo, terapeuta, medico
    principal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: conteudo_ia_cache
-- Descrição: Cache de conteúdos gerados pela IA
-- =====================================================
CREATE TABLE IF NOT EXISTS conteudo_ia_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_conteudo VARCHAR(100) NOT NULL, -- dica_diaria, exercicio, meditacao
    titulo VARCHAR(255),
    conteudo TEXT NOT NULL,
    tags TEXT[],
    categoria VARCHAR(100),
    popularidade INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: relatorios_progresso
-- Descrição: Relatórios de progresso gerados
-- =====================================================
CREATE TABLE IF NOT EXISTS relatorios_progresso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_relatorio VARCHAR(50) NOT NULL, -- semanal, mensal, trimestral
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    dados_relatorio JSONB NOT NULL,
    insights TEXT[],
    recomendacoes TEXT[],
    arquivo_pdf_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: sessoes_mindfulness
-- Descrição: Sessões de mindfulness e meditação
-- =====================================================
CREATE TABLE IF NOT EXISTS sessoes_mindfulness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_sessao VARCHAR(100) NOT NULL, -- meditacao, respiracao, som_ambiente
    titulo VARCHAR(255),
    duracao_planejada INTEGER, -- em minutos
    duracao_real INTEGER, -- em minutos
    audio_url TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    notas TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: gamificacao_pontos
-- Descrição: Sistema de pontos e conquistas
-- =====================================================
CREATE TABLE IF NOT EXISTS gamificacao_pontos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    acao VARCHAR(100) NOT NULL, -- habito_concluido, avaliacao_feita, rotina_cumprida
    pontos INTEGER NOT NULL,
    referencia_id UUID, -- ID da ação que gerou os pontos
    referencia_tipo VARCHAR(50), -- habito, avaliacao, rotina
    multiplicador DECIMAL(3,2) DEFAULT 1.0,
    bonus BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: conquistas
-- Descrição: Conquistas e medalhas do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS conquistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_conquista VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(7),
    raridade VARCHAR(20) DEFAULT 'comum', -- comum, raro, epico, lendario
    pontos_necessarios INTEGER,
    condicoes JSONB, -- Condições para desbloquear
    desbloqueada BOOLEAN DEFAULT FALSE,
    data_desbloqueio TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_habitos_user_id ON habitos(user_id);
CREATE INDEX IF NOT EXISTS idx_habito_registros_user_data ON habito_registros(user_id, data_registro);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_user_tipo ON avaliacoes(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_rotinas_user_ativo ON rotinas(user_id, ativo);
CREATE INDEX IF NOT EXISTS idx_emocao_posts_criado ON emocao_posts(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_historico_chat_user_sessao ON historico_chat(user_id, sessao_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_pontos_user ON gamificacao_pontos(user_id);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habitos_updated_at BEFORE UPDATE ON habitos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rotinas_updated_at BEFORE UPDATE ON rotinas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emocao_posts_updated_at BEFORE UPDATE ON emocao_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contatos_emergencia_updated_at BEFORE UPDATE ON contatos_emergencia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conteudo_ia_cache_updated_at BEFORE UPDATE ON conteudo_ia_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habito_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotina_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emocao_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emocao_reacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_mindfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamificacao_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários só podem ver seus próprios dados
CREATE POLICY "Usuários podem ver apenas seus dados" ON usuarios FOR ALL USING (auth.uid() = id);
CREATE POLICY "Usuários podem gerenciar seus hábitos" ON habitos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar registros de hábitos" ON habito_registros FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar suas avaliações" ON avaliacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar suas rotinas" ON rotinas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar execuções de rotinas" ON rotina_execucoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver posts públicos" ON emocao_posts FOR SELECT USING (aprovado = true);
CREATE POLICY "Usuários podem criar seus posts" ON emocao_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus posts" ON emocao_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus posts" ON emocao_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem reagir a posts" ON emocao_reacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar seu chat" ON historico_chat FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar contatos de emergência" ON contatos_emergencia FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus relatórios" ON relatorios_progresso FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar sessões mindfulness" ON sessoes_mindfulness FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus pontos" ON gamificacao_pontos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver suas conquistas" ON conquistas FOR ALL USING (auth.uid() = user_id);

-- Política para conteúdo IA (público para leitura)
CREATE POLICY "Conteúdo IA é público para leitura" ON conteudo_ia_cache FOR SELECT USING (ativo = true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir contatos de emergência padrão
INSERT INTO contatos_emergencia (id, user_id, nome, telefone, relacao, principal, ativo) VALUES
(uuid_generate_v4(), NULL, 'CVV - Centro de Valorização da Vida', '188', 'apoio_emocional', true, true),
(uuid_generate_v4(), NULL, 'SAMU', '192', 'emergencia_medica', true, true),
(uuid_generate_v4(), NULL, 'Polícia Militar', '190', 'emergencia_seguranca', true, true),
(uuid_generate_v4(), NULL, 'Bombeiros', '193', 'emergencia_geral', true, true),
(uuid_generate_v4(), NULL, 'Disque Denúncia Violência Doméstica', '180', 'violencia_domestica', true, true);

-- Inserir conquistas padrão
INSERT INTO conquistas (id, user_id, tipo_conquista, titulo, descricao, icone, cor, raridade, pontos_necessarios, condicoes) VALUES
(uuid_generate_v4(), NULL, 'primeiro_habito', 'Primeiro Passo', 'Criou seu primeiro hábito', 'star', '#FFD700', 'comum', 0, '{"habitos_criados": 1}'),
(uuid_generate_v4(), NULL, 'streak_7', 'Persistente', 'Manteve um hábito por 7 dias consecutivos', 'fire', '#FF6B35', 'raro', 0, '{"streak_maximo": 7}'),
(uuid_generate_v4(), NULL, 'streak_30', 'Determinado', 'Manteve um hábito por 30 dias consecutivos', 'trophy', '#8B5CF6', 'epico', 0, '{"streak_maximo": 30}'),
(uuid_generate_v4(), NULL, 'avaliacao_primeira', 'Autoconhecimento', 'Fez sua primeira autoavaliação', 'brain', '#10B981', 'comum', 0, '{"avaliacoes_feitas": 1}'),
(uuid_generate_v4(), NULL, 'pontos_100', 'Iniciante', 'Acumulou 100 pontos', 'gem', '#3B82F6', 'comum', 100, '{"pontos_totais": 100}'),
(uuid_generate_v4(), NULL, 'pontos_1000', 'Experiente', 'Acumulou 1000 pontos', 'crown', '#F59E0B', 'raro', 1000, '{"pontos_totais": 1000}');

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Para executar este script no Supabase:
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique se todas as tabelas foram criadas corretamente
-- 6. Configure as variáveis de ambiente no projeto React

-- Variáveis de ambiente necessárias:
-- VITE_SUPABASE_URL=sua_url_do_supabase
-- VITE_SUPABASE_ANON_KEY=sua_chave_anonima
-- VITE_OPENAI_API_KEY=sua_chave_da_openai

COMMIT;