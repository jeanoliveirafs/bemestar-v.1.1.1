# 🚀 Deploy Rápido no Vercel - Guia para Testes Online

## 🎯 Para Testar Sempre Online

### ⚡ Deploy Rápido (Recomendado)
```bash
# Deploy direto com confirmação automática
npm run deploy:quick
```

### 🤖 Deploy Automatizado (Com verificações)
```bash
# Deploy com verificações completas
npm run deploy:auto
```

### 🔧 Deploy Manual (Controle total)
```bash
# Build + Deploy manual
npm run build
npx vercel --prod
```

## 🔑 Configuração Inicial (Apenas uma vez)

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Fazer Login no Vercel
```bash
npm run vercel:login
# ou
npx vercel login
```

### 3. Primeiro Deploy
```bash
npm run deploy:quick
```

## 📱 URLs da Aplicação

- **Produção**: https://appbemestarnovo.vercel.app
- **Dashboard Vercel**: https://vercel.com/dashboard
- **Repositório**: https://github.com/jeanoliveirafs/bemestar-v.1.1.1

## 🔄 Fluxo de Trabalho Recomendado

### Para Desenvolvimento e Testes:
1. **Desenvolva localmente**: `npm run dev`
2. **Teste as mudanças**: Verifique se tudo funciona
3. **Deploy rápido**: `npm run deploy:quick`
4. **Teste online**: Acesse https://appbemestarnovo.vercel.app
5. **Repita o ciclo**: Faça mais mudanças e deploy novamente

### Comandos Úteis:
```bash
# Ver status dos deploys
npm run vercel:status

# Ver logs do último deploy
npx vercel logs

# Rollback para versão anterior
npx vercel rollback

# Ver domínios configurados
npx vercel domains
```

## ⚠️ Dicas Importantes

### ✅ Antes de cada Deploy:
- [ ] Teste localmente com `npm run dev`
- [ ] Verifique se não há erros no console
- [ ] Confirme que a autenticação funciona
- [ ] Teste em dispositivos móveis (responsividade)

### 🚨 Em caso de Erro:
1. **Build falha**: Verifique erros no terminal
2. **Deploy falha**: Veja logs com `npx vercel logs`
3. **App não carrega**: Verifique variáveis de ambiente
4. **Supabase não conecta**: Confirme URLs no vercel.json

## 🎨 Configuração Atual

### Variáveis de Ambiente (já configuradas):
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_OPENAI_API_KEY`
- ✅ `VITE_N8N_WEBHOOK_URL`
- ✅ `VITE_APP_ENV=production`

### Framework: Vite + React + TypeScript
### Banco: Supabase (PostgreSQL)
### Estilo: Tailwind CSS
### Deploy: Vercel (automático)

## 🔥 Deploy Ultra-Rápido (1 comando)

```bash
# Para mudanças rápidas - sem verificações
npm run build && npx vercel --prod --yes
```

---

**💡 Dica**: Salve este arquivo nos favoritos para acesso rápido aos comandos!

**🎯 Objetivo**: Testar sempre online com o mínimo de fricção possível.

**⏱️ Tempo médio de deploy**: 2-3 minutos

**🌐 URL sempre atualizada**: https://appbemestarnovo.vercel.app