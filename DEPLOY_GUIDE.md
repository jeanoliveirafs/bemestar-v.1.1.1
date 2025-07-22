# 🚀 Guia de Deploy - Refúgio Digital

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com)
- Chave da API do OpenAI (opcional, para funcionalidade de IA)

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Preencha:
   - **Name**: `refugio-digital`
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: `South America (São Paulo)` ou mais próxima
5. Clique em "Create new project"
6. Aguarde a criação (pode levar alguns minutos)

### 2. Executar Script SQL

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `migrations/2025-01-25_refugio_digital_complete_schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** para executar
6. Verifique se todas as tabelas foram criadas em **Database > Tables**

### 3. Configurar Autenticação

1. Vá para **Authentication > Settings**
2. Em **Site URL**, adicione:
   - Para desenvolvimento: `http://localhost:5174`
   - Para produção: `https://seu-dominio.vercel.app`
3. Em **Redirect URLs**, adicione as mesmas URLs
4. Salve as configurações

### 4. Obter Credenciais

1. Vá para **Settings > API**
2. Anote as seguintes informações:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (use apenas no backend)

## 🔧 Configuração do Projeto

### 1. Atualizar Variáveis de Ambiente

Crie/atualize o arquivo `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (opcional)
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurações do App
VITE_APP_NAME="Refúgio Digital"
VITE_APP_URL=https://seu-dominio.vercel.app
```

### 2. Atualizar Configuração do Supabase

O arquivo `src/lib/supabaseClient.ts` já está configurado para usar as variáveis de ambiente.

## 📱 Deploy no Vercel

### 1. Preparar Repositório GitHub

1. Crie um novo repositório no GitHub:
   - Nome: `refugio-digital`
   - Visibilidade: Private (recomendado)

2. No terminal do projeto, execute:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/refugio-digital.git

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: implementação completa do Refúgio Digital"

# Push para GitHub
git push -u origin main
```

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Clique em "Import" no seu repositório `refugio-digital`
4. Configure o projeto:
   - **Project Name**: `refugio-digital`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Configurar Variáveis de Ambiente no Vercel

1. Na página de configuração do projeto, vá para **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = https://yeizisgimwwwvestmhnj.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaXppc2dpbXd3d3Zlc3RtaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjExMTUsImV4cCI6MjA2ODUzNzExNX0.GexbZxkm0BqPUlZ9cgH5j-hvzbgF-kx9mr3aiDTqVvA
VITE_OPENAI_API_KEY = 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
VITE_APP_NAME = appbemestarnovo
VITE_APP_URL = https://appbemestarnovo.vercel.app
```

3. Clique em **"Deploy"**

### 4. Atualizar URL no Supabase

1. Após o deploy, copie a URL do Vercel (ex: `https://refugio-digital.vercel.app`)
2. Volte ao Supabase > **Authentication > Settings**
3. Atualize:
   - **Site URL**: `https://refugio-digital.vercel.app`
   - **Redirect URLs**: `https://refugio-digital.vercel.app/**`

## 🔒 Configurações de Segurança

### 1. Row Level Security (RLS)

O RLS já está configurado no script SQL. Todas as tabelas têm políticas que garantem que usuários só acessem seus próprios dados.

### 2. Configurações Adicionais

1. No Supabase, vá para **Authentication > Settings**
2. Configure:
   - **Enable email confirmations**: ✅
   - **Enable secure email change**: ✅
   - **Enable phone confirmations**: ❌ (opcional)

## 📊 Monitoramento

### 1. Logs do Vercel

- Acesse o painel do Vercel
- Vá para **Functions** para ver logs de API
- Monitore **Analytics** para métricas de uso

### 2. Logs do Supabase

- Acesse **Logs** no painel do Supabase
- Monitore queries e autenticação
- Configure alertas se necessário

## 🚀 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Deploy manual (se necessário)
vercel --prod

# Logs do Vercel
vercel logs
```

## 🔧 Troubleshooting

### Erro de CORS
- Verifique se a URL está configurada corretamente no Supabase
- Confirme que as variáveis de ambiente estão corretas

### Erro de Autenticação
- Verifique se o RLS está ativo
- Confirme que as políticas estão corretas
- Teste com usuário autenticado

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme que as variáveis de ambiente estão definidas
- Teste o build localmente: `npm run build`

### Performance
- Use `React.lazy()` para lazy loading (já implementado)
- Otimize imagens e assets
- Configure cache headers no Vercel

## 📝 Próximos Passos

1. **Domínio Customizado**: Configure um domínio próprio no Vercel
2. **Analytics**: Integre Google Analytics ou Vercel Analytics
3. **Monitoring**: Configure Sentry para monitoramento de erros
4. **Backup**: Configure backup automático do Supabase
5. **CI/CD**: Configure GitHub Actions para testes automáticos

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel e Supabase
2. Confirme que todas as variáveis de ambiente estão corretas
3. Teste localmente primeiro
4. Consulte a documentação oficial do [Supabase](https://supabase.com/docs) e [Vercel](https://vercel.com/docs)

---

**🎉 Parabéns! Seu Refúgio Digital está online!**

Acesse: `https://refugio-digital.vercel.app`