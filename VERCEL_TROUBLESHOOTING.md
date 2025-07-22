# 🔧 Guia de Solução de Problemas - Vercel Deploy

## ❌ Problemas Comuns e Soluções

### 1. Erro de Variáveis de Ambiente

**Problema:** Deploy falha por variáveis de ambiente não configuradas

**Solução:**
1. Acesse o painel do Vercel: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione APENAS estas 3 variáveis:

```
VITE_SUPABASE_URL=https://yeizisgimwwwvestmhnj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaXppc2dpbXd3d3Zlc3RtaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjExMTUsImV4cCI6MjA2ODUzNzExNX0.GexbZxkm0BqPUlZ9cgH5j-hvzbgF-kx9mr3aiDTqVvA
VITE_OPENAI_API_KEY=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
```

5. Clique em **Save** para cada variável
6. Vá em **Deployments** e clique em **Redeploy**

### 2. Projeto Não Sincroniza com GitHub

**Problema:** Vercel não puxa as atualizações do GitHub

**Solução Passo a Passo:**

#### Opção A: Reconectar o Repositório
1. No Vercel, vá em **Settings** → **Git**
2. Clique em **Disconnect** (se conectado)
3. Clique em **Connect Git Repository**
4. Selecione GitHub
5. Escolha o repositório: `jeanoliveirafs/bemestar-v.1.1.1`
6. Clique em **Import**

#### Opção B: Deploy Manual
1. Acesse: https://vercel.com/new
2. Clique em **Import Git Repository**
3. Cole a URL: `https://github.com/jeanoliveirafs/bemestar-v.1.1.1`
4. Clique em **Import**
5. Configure as variáveis de ambiente (ver seção 1)
6. Clique em **Deploy**

### 3. Deploy Falha Completamente

**Checklist de Verificação:**

- [ ] Repositório GitHub está público ou Vercel tem acesso
- [ ] Branch `main` existe e tem commits
- [ ] Arquivo `package.json` está na raiz do projeto
- [ ] Todas as 3 variáveis de ambiente estão configuradas
- [ ] Não há caracteres especiais nas variáveis

### 4. Como Forçar um Novo Deploy

1. **Via Vercel Dashboard:**
   - Vá em **Deployments**
   - Clique nos 3 pontos do último deploy
   - Selecione **Redeploy**

2. **Via GitHub:**
   - Faça qualquer alteração no código
   - Commit e push para a branch `main`
   - O deploy será automático

### 5. Verificar se o Deploy Funcionou

**URLs para Testar:**
- Dashboard Vercel: https://vercel.com/dashboard
- Seu projeto: https://[seu-projeto].vercel.app
- GitHub: https://github.com/jeanoliveirafs/bemestar-v.1.1.1

### 6. Logs de Debug

**Para ver erros detalhados:**
1. No Vercel, vá em **Deployments**
2. Clique no deploy que falhou
3. Vá na aba **Function Logs**
4. Procure por mensagens de erro em vermelho

## 🆘 Se Nada Funcionar

**Solução Drástica - Criar Novo Projeto:**

1. Delete o projeto atual no Vercel
2. Vá em https://vercel.com/new
3. Importe novamente o repositório GitHub
4. Configure as 3 variáveis de ambiente
5. Deploy

## 📞 Contatos de Suporte

- **Vercel Support:** https://vercel.com/help
- **GitHub Issues:** https://github.com/jeanoliveirafs/bemestar-v.1.1.1/issues

---

**✅ Última atualização:** Janeiro 2025
**🔗 Repositório:** https://github.com/jeanoliveirafs/bemestar-v.1.1.1