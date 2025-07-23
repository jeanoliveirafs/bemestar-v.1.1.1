# 🔧 Correção da Migração do Supabase - Bem-Estar SaaS

## ❌ Problema Identificado

O erro `ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification` ocorreu porque o arquivo de migração anterior usava `ON CONFLICT DO NOTHING` em tabelas que não possuíam constraints únicos definidos.

## ✅ Solução Implementada

Criamos um novo arquivo de migração corrigido: `2025-01-27_fixed_production_schema.sql`

### Principais Correções:

1. **Adicionado UNIQUE constraints** nas tabelas:
   - `habit_categories.name` - agora é UNIQUE
   - `psychological_scales.name` - agora é UNIQUE

2. **Substituído ON CONFLICT por verificações condicionais**:
   - Removido `ON CONFLICT DO NOTHING`
   - Implementado blocos `DO $$ ... END $$` com `IF NOT EXISTS`

3. **Adicionado DROP POLICY IF EXISTS**:
   - Evita erros de políticas já existentes
   - Permite re-execução segura da migração

## 🚀 Como Executar a Migração Corrigida

### Passo 1: Acessar o Supabase Dashboard
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar a Migração
1. Copie todo o conteúdo do arquivo `migrations/2025-01-27_fixed_production_schema.sql`
2. Cole no SQL Editor
3. Clique em **"Run"** ou pressione `Ctrl + Enter`

### Passo 4: Verificar a Execução
Após a execução, você deve ver:
- ✅ Mensagem de sucesso: "Migração corrigida executada com sucesso!"
- ✅ Todas as tabelas criadas
- ✅ Dados iniciais inseridos
- ✅ Políticas RLS configuradas

## 📋 Verificação das Tabelas Criadas

Para verificar se tudo foi criado corretamente, execute esta query:

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
SELECT 'psychological_scales' as tabela, count(*) as registros FROM public.psychological_scales;
```

## 🔐 Configuração das Variáveis de Ambiente

Após a migração, configure as variáveis no Vercel:

### No Vercel Dashboard:
1. Acesse seu projeto no Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_OPENAI_API_KEY=sua-chave-openai
VITE_N8N_WEBHOOK_URL=sua-url-webhook-n8n
```

## 🛠️ Comandos para Deploy

Após configurar as variáveis:

```bash
# Build local para testar
npm run build

# Deploy no Vercel
npm run deploy
# ou
vercel --prod
```

## 📊 Estrutura do Banco Criada

### Tabelas Principais:
- ✅ `profiles` - Perfis dos usuários
- ✅ `habit_categories` - Categorias de hábitos (8 categorias padrão)
- ✅ `user_habits` - Hábitos dos usuários
- ✅ `psychological_scales` - Escalas GAD-7 e PHQ-9
- ✅ `user_scale_responses` - Respostas às escalas
- ✅ `emotion_posts` - Posts emocionais
- ✅ `user_gamification` - Sistema de pontuação
- ✅ `daily_mood_logs` - Registro diário de humor
- ✅ `user_routines` - Rotinas personalizadas
- ✅ `habit_completions` - Completamento de hábitos

### Funcionalidades Automáticas:
- ✅ **Triggers**: Criação automática de perfil e gamificação
- ✅ **RLS**: Políticas de segurança por usuário
- ✅ **Índices**: Otimização de performance
- ✅ **Constraints**: Validação de dados

## 🔍 Troubleshooting

### Se ainda houver erros:

1. **Limpar tabelas existentes** (se necessário):
```sql
-- CUIDADO: Isso apaga todos os dados!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. **Executar novamente** a migração corrigida

3. **Verificar permissões** do usuário no Supabase

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Confirme as variáveis de ambiente
3. Teste a conexão com o banco

---

**✨ Após seguir estes passos, sua aplicação estará pronta para produção com autenticação completa e dados reais do Supabase!**