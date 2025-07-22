# Instruções para Migração do Banco de Dados Supabase

## Problema Identificado
O site no Vercel não está conseguindo conectar com o banco de dados porque as tabelas necessárias não existem no Supabase.

## Solução: Executar a Migração SQL

### Passo 1: Acessar o Supabase Dashboard
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: `yeizisgimwwwvestmhnj`

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar a Migração
1. Abra o arquivo `migrations/2025-01-25_complete_database_schema.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** para executar

### Passo 4: Verificar se as Tabelas foram Criadas
Após executar a migração, você deve ver as seguintes tabelas criadas:

- ✅ `profiles` - Perfis dos usuários
- ✅ `habit_categories` - Categorias de hábitos
- ✅ `user_habits` - Hábitos dos usuários
- ✅ `psychological_scales` - Escalas psicológicas
- ✅ `user_scale_responses` - Respostas às escalas
- ✅ `emotion_posts` - Posts emocionais
- ✅ `user_gamification` - Sistema de gamificação
- ✅ `daily_mood_logs` - Registro diário de humor
- ✅ `user_routines` - Rotinas dos usuários
- ✅ `habit_completions` - Completamento de hábitos

### Passo 5: Verificar as Políticas RLS
A migração também configura automaticamente:
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Políticas de acesso para cada usuário ver apenas seus próprios dados
- ✅ Triggers para criação automática de perfil
- ✅ Funções para atualização automática de timestamps

### Passo 6: Testar a Conexão
Após executar a migração:
1. Aguarde 2-3 minutos para o Vercel fazer o redeploy
2. Acesse: **https://bemestar-v-1-1-1.vercel.app/**
3. Tente fazer cadastro/login
4. Verifique se os dados estão sendo salvos no banco

## Dados Pré-inseridos
A migração já inclui:
- 8 categorias padrão de hábitos (Exercício, Meditação, Alimentação, etc.)
- 2 escalas psicológicas (GAD-7 para ansiedade, PHQ-9 para depressão)

## Credenciais Atualizadas
- **URL**: `https://yeizisgimwwwvestmhnj.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaXppc2dpbXd3d3Zlc3RtaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjExMTUsImV4cCI6MjA2ODUzNzExNX0.GexbZxkm0BqPUlZ9cgH5j-hvzbgF-kx9mr3aiDTqVvA`

## Troubleshooting
Se ainda houver problemas após a migração:
1. Verifique se todas as tabelas foram criadas no Supabase
2. Confirme se as políticas RLS estão ativas
3. Teste a conexão diretamente no SQL Editor
4. Verifique os logs do Vercel para erros específicos

---

**⚠️ IMPORTANTE**: Execute a migração APENAS UMA VEZ. Se executar novamente, use `IF NOT EXISTS` ou remova as linhas de INSERT que podem causar conflito.