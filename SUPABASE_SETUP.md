# 🗄️ Configuração do Supabase - Passo a Passo

## 1. Criar Conta e Projeto

### Passo 1: Criar Conta
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email

### Passo 2: Criar Novo Projeto
1. No dashboard, clique em "New Project"
2. Selecione sua organização (ou crie uma)
3. Preencha os dados:
   - **Project name**: `refugio-digital`
   - **Database password**: Crie uma senha forte (ANOTE ESTA SENHA!)
   - **Region**: `South America (São Paulo)` ou mais próxima
   - **Pricing plan**: Free (para começar)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos para a criação

## 2. Configurar o Banco de Dados

### Passo 1: Acessar SQL Editor
1. No painel lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 2: Executar Script de Migração
1. Abra o arquivo `migrations/2025-01-25_refugio_digital_complete_schema.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (botão verde)
5. Aguarde a execução (pode levar alguns segundos)
6. Verifique se apareceu "Success. No rows returned" ou similar

### Passo 3: Verificar Tabelas Criadas
1. Vá para **"Table Editor"** no painel lateral
2. Você deve ver as seguintes tabelas:
   - `users`
   - `habits`
   - `habit_records`
   - `psychological_assessments`
   - `user_routines`
   - `routine_executions`
   - `emotion_posts`
   - `emotion_reactions`
   - `chat_history`
   - `emergency_contacts`
   - `ai_content_cache`
   - `progress_reports`
   - `mindfulness_sessions`
   - `gamification_points`
   - `achievements`

## 3. Configurar Autenticação

### Passo 1: Configurar URLs
1. Vá para **"Authentication"** > **"Settings"**
2. Na seção **"Site URL"**, adicione:
   ```
   https://seu-dominio.vercel.app
   ```
3. Na seção **"Redirect URLs"**, adicione:
   ```
   https://seu-dominio.vercel.app/**
   ```
4. Clique em **"Save"**

### Passo 2: Configurar Providers (Opcional)
1. Ainda em **"Authentication"** > **"Settings"**
2. Role até **"Auth Providers"**
3. Configure os providers desejados:
   - **Email**: Já está ativo
   - **Google**: Configure se desejar login social
   - **GitHub**: Configure se desejar login social

## 4. Obter Credenciais

### Passo 1: Acessar Configurações da API
1. Vá para **"Settings"** > **"API"**
2. Você verá as seguintes informações:

### Passo 2: Copiar Credenciais
```
Project URL: https://xxxxxxxxxxxxxxxx.supabase.co
API Key (anon, public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API Key (service_role, secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: 
- Use apenas a **anon key** no frontend
- NUNCA exponha a **service_role key** no frontend
- A **service_role key** é apenas para uso no backend/servidor

## 5. Configurar Variáveis de Ambiente

### Passo 1: Atualizar .env.local
Abra o arquivo `.env.local` e substitua:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration (opcional)
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurações do App
VITE_APP_NAME="Refúgio Digital"
VITE_APP_URL=http://localhost:5174
```

### Passo 2: Exemplo Real
```env
# Exemplo com dados reais (substitua pelos seus)
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNjE4NDAwMCwiZXhwIjoyMDIxNzYwMDAwfQ.example-signature
VITE_OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef
VITE_APP_NAME="Refúgio Digital"
VITE_APP_URL=http://localhost:5174
```

## 6. Deploy em Produção

As variáveis de ambiente são configuradas diretamente no Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_N8N_WEBHOOK_URL`
- `VITE_APP_ENV=production`

Após o deploy, teste o cadastro/login de usuários na aplicação em produção.

## 7. Configurações de Segurança

### Row Level Security (RLS)
O RLS já foi configurado automaticamente pelo script SQL. Cada usuário só pode acessar seus próprios dados.

### Políticas Ativas
Verifique se as políticas estão ativas:
1. Vá para **"Authentication"** > **"Policies"**
2. Você deve ver políticas para cada tabela
3. Todas devem estar **"Enabled"**

## 8. Monitoramento

### Logs
1. Vá para **"Logs"** no painel lateral
2. Monitore:
   - **API**: Requisições à API
   - **Auth**: Tentativas de login
   - **Database**: Queries SQL

### Métricas
1. Vá para **"Reports"**
2. Monitore uso de:
   - Database
   - Auth
   - Storage
   - Edge Functions

## 🚨 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave correta
- Confirme que está usando a **anon key**, não a service_role
- Reinicie o servidor de desenvolvimento

### Erro: "Cross-origin request blocked"
- Verifique se a URL está configurada em Authentication > Settings
- Confirme que a URL está exatamente como no navegador

### Erro: "Row Level Security policy violation"
- Verifique se o usuário está autenticado
- Confirme que as políticas RLS estão ativas
- Teste com um usuário diferente

### Tabelas não aparecem
- Verifique se o script SQL foi executado completamente
- Confirme que não houve erros na execução
- Tente executar o script novamente

## 📞 Suporte

- **Documentação Oficial**: [docs.supabase.com](https://docs.supabase.com)
- **Discord Supabase**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Para problemas específicos do projeto

---

**✅ Pronto! Seu Supabase está configurado e pronto para uso!**