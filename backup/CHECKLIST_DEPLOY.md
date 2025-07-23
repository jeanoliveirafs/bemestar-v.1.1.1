# ✅ Checklist de Deploy - Refúgio Digital

## 📋 Pré-Deploy (Desenvolvimento Local)

### 1. Configuração do Supabase
- [ ] Conta criada no Supabase
- [ ] Projeto criado com nome `refugio-digital`
- [ ] Script SQL executado (`migrations/2025-01-25_refugio_digital_complete_schema.sql`)
- [ ] Todas as 15 tabelas criadas corretamente
- [ ] URLs de produção configuradas
- [ ] Credenciais copiadas (URL + anon key)

### 2. Preparação do Código
- [ ] Dependências atualizadas (`npm install`)
- [ ] Build funcionando (`npm run build`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Arquivos desnecessários removidos
- [ ] `.gitignore` atualizado

## 🐙 Configuração do GitHub

### 1. Repositório
- [ ] Repositório criado no GitHub
- [ ] Nome: `refugio-digital` (ou similar)
- [ ] Visibilidade: Private (recomendado)
- [ ] README.md atualizado

### 2. Push Inicial
```bash
# Execute estes comandos:
git init
git add .
git commit -m "feat: implementação completa do Refúgio Digital"
git remote add origin https://github.com/SEU_USUARIO/refugio-digital.git
git push -u origin main
```
- [ ] Código enviado para o GitHub
- [ ] Todos os arquivos commitados
- [ ] Variáveis de ambiente configuradas no Vercel

## 🚀 Deploy no Vercel

### 1. Configuração Inicial
- [ ] Conta criada/logada no Vercel
- [ ] Repositório importado do GitHub
- [ ] Framework detectado como "Vite"
- [ ] Nome do projeto: `refugio-digital`

### 2. Configurações de Build
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Install Command**: `npm install`
- [ ] **Framework**: Vite detectado automaticamente

### 3. Variáveis de Ambiente
Adicione estas variáveis no Vercel:
- [ ] `VITE_SUPABASE_URL` = `https://xxxxxxxx.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIs...`
- [ ] `VITE_OPENAI_API_KEY` = `sk-xxxxxxxx...` (opcional)
- [ ] `VITE_APP_NAME` = `Refúgio Digital`
- [ ] `VITE_APP_URL` = `https://refugio-digital.vercel.app`

### 4. Deploy
- [ ] Primeiro deploy executado
- [ ] Build bem-sucedido
- [ ] URL de produção gerada
- [ ] Site acessível na URL

## 🔧 Configuração Pós-Deploy

### 1. Atualizar Supabase
- [ ] URL de produção adicionada no Supabase
- [ ] **Site URL**: `https://refugio-digital.vercel.app`
- [ ] **Redirect URLs**: `https://refugio-digital.vercel.app/**`
- [ ] Configurações salvas

### 2. Testes de Produção
- [ ] Site carrega sem erros
- [ ] Autenticação funcionando
- [ ] Cadastro de usuário funcional
- [ ] Login/logout funcionando
- [ ] Dados sendo salvos no Supabase
- [ ] Todas as páginas acessíveis

## 🔒 Segurança e Performance

### 1. Verificações de Segurança
- [ ] RLS ativo em todas as tabelas
- [ ] Políticas de segurança funcionando
- [ ] Usuários só acessam próprios dados
- [ ] Chaves de API não expostas no frontend
- [ ] HTTPS ativo (automático no Vercel)

### 2. Performance
- [ ] Lighthouse Score > 90
- [ ] Imagens otimizadas
- [ ] Lazy loading implementado
- [ ] Cache configurado
- [ ] Bundle size otimizado

## 📊 Monitoramento

### 1. Analytics
- [ ] Vercel Analytics configurado
- [ ] Supabase Dashboard monitorado
- [ ] Error tracking configurado
- [ ] Performance monitoring ativo

### 2. Logs
- [ ] Logs do Vercel funcionando
- [ ] Logs do Supabase acessíveis
- [ ] Alertas configurados (opcional)

## 🎯 Funcionalidades Testadas

### Core Features
- [ ] **Painel**: Dashboard carregando
- [ ] **Autoavaliações**: Questionários funcionando
- [ ] **Emergência**: Contatos e estratégias
- [ ] **Hábitos**: Gamificação ativa
- [ ] **Rotina**: Calendário funcionando
- [ ] **Comunidade**: Posts e reações
- [ ] **IA**: Chat respondendo (se configurado)
- [ ] **Relatórios**: Gráficos carregando
- [ ] **Mindfulness**: Sessões funcionando

### Navegação
- [ ] Menu lateral funcionando
- [ ] Rotas funcionando
- [ ] Breadcrumbs corretos
- [ ] Links internos funcionando
- [ ] Responsividade mobile

## 🚨 Troubleshooting

### Problemas Comuns

**Build falha no Vercel:**
- [ ] Verificar logs de build no painel do Vercel
- [ ] Confirmar dependências no package.json
- [ ] Verificar variáveis de ambiente no Vercel
- [ ] Confirmar configurações de build

**Erro de CORS:**
- [ ] URL configurada no Supabase
- [ ] Protocolo correto (https)
- [ ] Wildcards configurados

**Autenticação não funciona:**
- [ ] URLs corretas no Supabase
- [ ] RLS configurado
- [ ] Políticas ativas
- [ ] Chaves corretas

**Dados não salvam:**
- [ ] Usuário autenticado
- [ ] Políticas RLS corretas
- [ ] Estrutura de tabelas correta
- [ ] Logs do Supabase

## 📝 Pós-Deploy

### 1. Documentação
- [ ] README atualizado com URL de produção
- [ ] Documentação de API atualizada
- [ ] Changelog criado
- [ ] Issues conhecidas documentadas

### 2. Backup e Manutenção
- [ ] Backup do banco configurado
- [ ] Monitoramento de uptime
- [ ] Plano de manutenção definido
- [ ] Processo de rollback documentado

### 3. Marketing e Lançamento
- [ ] Domínio customizado (opcional)
- [ ] SSL certificado
- [ ] SEO básico configurado
- [ ] Meta tags configuradas
- [ ] Favicon adicionado

## 🎉 Finalização

### URLs Importantes
- **Produção**: `https://refugio-digital.vercel.app`
- **Supabase**: `https://app.supabase.com/project/[seu-projeto]`
- **Vercel**: `https://vercel.com/[seu-usuario]/refugio-digital`
- **GitHub**: `https://github.com/[seu-usuario]/refugio-digital`

### Credenciais Importantes
- [ ] Senha do banco Supabase salva
- [ ] Chaves de API documentadas
- [ ] Acessos de admin configurados
- [ ] Backup das configurações feito

---

## 🆘 Suporte

Se algo não funcionar:

1. **Verifique os logs** no Vercel e Supabase
2. **Consulte a documentação** nos arquivos do projeto
3. **Teste localmente** primeiro
4. **Compare com este checklist**

---

**🎊 Parabéns! Seu Refúgio Digital está online e funcionando!**

*Lembre-se de manter as credenciais seguras e fazer backups regulares.*