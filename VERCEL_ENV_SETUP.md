## 📋 Configuração de Variáveis de Ambiente no Vercel

### Pré-requisitos
1. **Projeto Supabase configurado**
   - Execute o script `supabase_migration.sql` no SQL Editor
   - Configure a autenticação (Email/Password)
   - Anote a URL e chave anônima do seu projeto

### Variáveis Necessárias

#### 🔐 Supabase (OBRIGATÓRIO)
```
VITE_SUPABASE_URL=[sua_url_do_projeto_supabase]
VITE_SUPABASE_ANON_KEY=[sua_chave_anonima_supabase]
```

**Como obter:**
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para Settings > API
4. Copie a "Project URL" e "anon public" key

### OpenAI
- `VITE_OPENAI_API_KEY`: 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

### N8N Webhook
- `VITE_N8N_WEBHOOK_URL`: https://webhook.jeanautomationpro.com.br/webhook/bemestar

### Ambiente
- `VITE_APP_ENV`: production

## Como Configurar no Vercel

1. Acesse o painel do Vercel
2. Vá para o projeto importado
3. Clique em "Settings" > "Environment Variables"
4. Adicione cada variável acima
5. Faça um novo deploy para aplicar as mudanças

## Importante

⚠️ **NUNCA** commite chaves de API no código fonte. Elas devem sempre ser configuradas como variáveis de ambiente no painel do Vercel.

## Banco de Dados

Antes de usar a aplicação, execute a migração do banco de dados:
1. Acesse o Supabase SQL Editor
2. Execute o arquivo `backup/migrations/2025-01-27_fixed_production_schema.sql`