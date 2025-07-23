# Configuração de Variáveis de Ambiente no Vercel

Após importar o projeto no Vercel via GitHub, configure as seguintes variáveis de ambiente no painel do Vercel:

## Variáveis Obrigatórias

### Supabase
- `VITE_SUPABASE_URL`: https://yeizisgimwwwvestmhnj.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaXppc2dpbXd3d3Zlc3RtaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjExMTUsImV4cCI6MjA2ODUzNzExNX0.GexbZxkm0BqPUlZ9cgH5j-hvzbgF-kx9mr3aiDTqVvA

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