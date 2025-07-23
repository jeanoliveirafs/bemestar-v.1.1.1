# 🗄️ Instruções de Configuração do Supabase

## ✅ Status: Schema Completo Pronto para Execução

O banco de dados foi completamente configurado com todas as funcionalidades do projeto Refúgio Digital.

## 📋 Passo a Passo para Configurar

### 1. Acessar o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto ou crie um novo

### 2. Executar a Migração SQL
1. No painel do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `migrations/2025-01-27_complete_production_schema.sql`
4. Cole no SQL Editor
5. Clique em **"Run"** para executar

### 3. Verificar se Tudo Foi Criado
Após a execução, você deve ver:

#### ✅ 15 Tabelas Criadas:
- `profiles` - Perfis dos usuários
- `habit_categories` - Categorias de hábitos (8 categorias padrão)
- `user_habits` - Hábitos dos usuários
- `psychological_scales` - Escalas psicológicas (GAD-7, PHQ-9)
- `user_scale_responses` - Respostas às escalas
- `emotion_posts` - Posts emocionais
- `user_gamification` - Sistema de pontuação
- `daily_mood_logs` - Registro de humor
- `user_routines` - Rotinas personalizadas
- `habit_completions` - Completamento de hábitos
- `chat_history` - Histórico de chat com IA
- `ai_generated_content` - Conteúdo gerado por IA
- `ai_content_completions` - Completações de conteúdo
- `ai_content_cache` - Cache de conteúdo
- `sound_sessions` - Sessões de sons

#### ✅ Dados Iniciais Inseridos:
- **8 categorias de hábitos**: Exercício, Meditação, Alimentação, Sono, Leitura, Hidratação, Gratidão, Organização
- **2 escalas psicológicas**: GAD-7 (Ansiedade) e PHQ-9 (Depressão)
- **Conteúdo inicial de IA**: 5 itens no cache para começar

#### ✅ Segurança Configurada:
- **RLS (Row Level Security)** habilitado em todas as tabelas
- **Políticas de acesso** configuradas para cada usuário ver apenas seus dados
- **Triggers automáticos** para criação de perfil e gamificação

### 4. Configurar Autenticação
1. Vá para **Authentication > Settings**
2. Configure:
   - **Site URL**: `https://seu-dominio.vercel.app` (ou localhost para desenvolvimento)
   - **Redirect URLs**: `https://seu-dominio.vercel.app/**`
3. Salve as configurações

### 5. Obter Credenciais
1. Vá para **Settings > API**
2. Copie:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## 🔧 Configuração no Projeto

### Variáveis de Ambiente
Atualize o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://yeizisgimwwwvestmhnj.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_OPENAI_API_KEY=sua_chave_openai_aqui
VITE_N8N_WEBHOOK_URL=https://webhook.jeanautomationpro.com.br/webhook/bemestar
VITE_APP_ENV=development
```

## 🧪 Testar a Configuração

### 1. Testar Autenticação
1. Execute `npm run dev`
2. Acesse a aplicação
3. Tente criar uma conta
4. Verifique se o perfil é criado automaticamente na tabela `profiles`

### 2. Testar Funcionalidades
- **Registro de humor**: Deve salvar em `daily_mood_logs`
- **Criação de hábitos**: Deve salvar em `user_habits`
- **Escalas psicológicas**: Deve carregar GAD-7 e PHQ-9
- **Chat com IA**: Deve salvar em `chat_history`
- **Gamificação**: Deve atualizar pontos em `user_gamification`

## 🔍 Verificação SQL

Para verificar se tudo foi criado corretamente, execute estas queries no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar dados iniciais
SELECT 'habit_categories' as tabela, count(*) as registros FROM public.habit_categories
UNION ALL
SELECT 'psychological_scales' as tabela, count(*) as registros FROM public.psychological_scales
UNION ALL
SELECT 'ai_content_cache' as tabela, count(*) as registros FROM public.ai_content_cache;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🚨 Troubleshooting

### Erro de Permissões
- Verifique se você tem permissões de administrador no projeto Supabase
- Confirme que está executando no projeto correto

### Erro de Sintaxe SQL
- Certifique-se de copiar o arquivo SQL completo
- Verifique se não há caracteres especiais corrompidos

### Tabelas Não Aparecem
- Aguarde alguns segundos e recarregue a página
- Verifique a aba "Table Editor" no Supabase

### RLS Não Funciona
- Verifique se as políticas foram criadas em "Authentication > Policies"
- Teste com um usuário autenticado

## ✅ Resultado Final

Após seguir todos os passos, você terá:

1. **Banco de dados completo** com todas as 15 tabelas
2. **Autenticação funcionando** com criação automática de perfil
3. **Segurança configurada** com RLS e políticas
4. **Dados iniciais** para começar a usar
5. **Triggers automáticos** para facilitar o uso

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Confirme que as variáveis de ambiente estão corretas
3. Teste a conexão no código da aplicação

---

**🎉 Parabéns! Seu banco de dados está pronto para produção!**