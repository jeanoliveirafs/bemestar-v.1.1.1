# 🚀 Instruções de Deploy no Vercel - appbemestarnovo

## 📋 Pré-requisitos
- Conta no Vercel (https://vercel.com)
- Repositório GitHub: https://github.com/jeanoliveirafs/bemestar-v.1.1.1.git
- Projeto Supabase configurado

## 🔧 Passo a Passo para Deploy

### 1. Importar Projeto no Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Conecte sua conta GitHub se necessário
4. Selecione o repositório: `jeanoliveirafs/bemestar-v.1.1.1`
5. Configure o projeto:
   - **Project Name**: `appbemestarnovo`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Configurar Variáveis de Ambiente
Na seção **Environment Variables**, adicione:

```
VITE_SUPABASE_URL=https://yeizisgimwwwvestmhnj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaXppc2dpbXd3d3Zlc3RtaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjExMTUsImV4cCI6MjA2ODUzNzExNX0.GexbZxkm0BqPUlZ9cgH5j-hvzbgF-kx9mr3aiDTqVvA
VITE_OPENAI_API_KEY=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
VITE_APP_NAME=appbemestarnovo
VITE_APP_URL=https://appbemestarnovo.vercel.app
```

### 3. Deploy
1. Clique em **"Deploy"**
2. Aguarde o build completar (aproximadamente 2-3 minutos)
3. Após o deploy, sua aplicação estará disponível em: **https://appbemestarnovo.vercel.app**

### 4. Configurar Domínio Personalizado (Opcional)
Se desejar usar um domínio personalizado:
1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções do Vercel

### 5. Configurar Supabase para Produção
No painel do Supabase (https://supabase.com/dashboard):
1. Vá em **Authentication > Settings**
2. Em **Site URL**, adicione: `https://appbemestarnovo.vercel.app`
3. Em **Redirect URLs**, adicione: `https://appbemestarnovo.vercel.app/**`

## ✅ Verificações Pós-Deploy

### Teste as Funcionalidades:
- [ ] Página inicial carrega corretamente
- [ ] Navegação entre páginas funciona
- [ ] Conexão com Supabase está ativa
- [ ] Funcionalidades de IA respondem (se configuradas)
- [ ] Responsividade em dispositivos móveis

### URLs Importantes:
- **Aplicação**: https://appbemestarnovo.vercel.app
- **Dashboard Vercel**: https://vercel.com/dashboard
- **Repositório GitHub**: https://github.com/jeanoliveirafs/bemestar-v.1.1.1
- **Supabase Dashboard**: https://supabase.com/dashboard/project/yeizisgimwwwvestmhnj

## 🔄 Atualizações Futuras
Para atualizar a aplicação:
1. Faça push das alterações para o repositório GitHub
2. O Vercel fará deploy automático da branch `main`
3. Monitore o progresso no dashboard do Vercel

## 🆘 Troubleshooting

### Build Falha:
- Verifique se todas as dependências estão no `package.json`
- Confirme se as variáveis de ambiente estão configuradas
- Verifique os logs de build no dashboard do Vercel

### Erro 404:
- Confirme se o `vercel.json` está configurado corretamente
- Verifique se as rotas estão definidas no React Router

### Problemas de Conexão:
- Verifique se as URLs do Supabase estão corretas
- Confirme se as chaves de API são válidas
- Teste a conectividade no console do navegador

---

**Status**: ✅ Pronto para deploy
**Última atualização**: Janeiro 2025