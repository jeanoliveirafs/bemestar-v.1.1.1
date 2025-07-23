# 🔄 Git Automático - Guia de Uso

## 📋 Visão Geral

Este projeto agora inclui scripts automatizados para facilitar commits Git em cada atualização. O sistema permite versionamento contínuo e deploy automático.

## 🚀 Comandos Disponíveis

### Commits Automáticos

```bash
# Commit automático com mensagem padrão
npm run git:auto

# Commit com mensagem personalizada
npm run git:auto "feat: nova funcionalidade de autenticação"

# Commit específico (alias)
npm run git:commit "fix: correção de bug na dashboard"

# Atualização rápida (alias para git:auto)
npm run update
```

### Commit + Deploy Automático

```bash
# Commit + Deploy no Vercel
npm run git:deploy "deploy: nova versão com correções"
```

### Comandos Git Úteis

```bash
# Ver status do repositório
npm run git:status

# Ver últimos 10 commits
npm run git:log
```

## 📝 Tipos de Mensagens de Commit

Use prefixos padronizados para organizar o histórico:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, estilos
- `refactor:` - Refatoração de código
- `test:` - Testes
- `deploy:` - Deploy/configuração
- `chore:` - Tarefas de manutenção

## 🔧 Configuração Inicial

### 1. Configurar Git (se necessário)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 2. Verificar Configuração

O script verifica automaticamente se o Git está configurado corretamente.

## 🌐 URLs Importantes

- **Repositório:** https://github.com/jeanoliveirafs/bemestar-v.1.1.1
- **App Online:** https://appbemestarnovo.vercel.app
- **Dashboard Vercel:** https://vercel.com/dashboard

## 📊 Fluxo de Trabalho Recomendado

### Desenvolvimento Diário

1. **Fazer alterações no código**
2. **Testar localmente:** `npm run dev`
3. **Commit automático:** `npm run update "descrição das mudanças"`
4. **Deploy (opcional):** `npm run git:deploy "versão pronta"`

### Exemplo Prático

```bash
# Após fazer alterações
npm run update "feat: implementação do sistema de gamificação"

# Para deploy imediato
npm run git:deploy "deploy: nova versão com gamificação"
```

## 🛠️ Funcionalidades do Script

### Verificações Automáticas

- ✅ Verifica se é um repositório Git
- ✅ Inicializa repositório se necessário
- ✅ Configura remote origin automaticamente
- ✅ Verifica configuração do usuário Git
- ✅ Lista arquivos modificados
- ✅ Gera mensagens de commit com timestamp

### Processo Automático

1. **Verificação:** Status do repositório
2. **Staging:** `git add .`
3. **Commit:** `git commit -m "mensagem"`
4. **Push:** `git push origin main` (ou master)
5. **Deploy:** (opcional) Vercel deploy

## 🔍 Troubleshooting

### Problemas Comuns

**Erro de autenticação Git:**
```bash
# Configure suas credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

**Erro de remote:**
```bash
# O script configura automaticamente, mas se necessário:
git remote add origin https://github.com/jeanoliveirafs/bemestar-v.1.1.1.git
```

**Erro de branch:**
```bash
# Verificar branch atual
git branch

# Criar e mudar para main se necessário
git checkout -b main
```

## 📈 Benefícios

- ⚡ **Rapidez:** Commits em um comando
- 🔄 **Consistência:** Mensagens padronizadas
- 🚀 **Deploy Automático:** Commit + deploy em um comando
- 📊 **Rastreabilidade:** Histórico organizado
- 🛡️ **Segurança:** Verificações automáticas

## 🎯 Próximos Passos

1. **Teste os comandos:** `npm run git:status`
2. **Faça um commit:** `npm run update "test: testando git automático"`
3. **Verifique o resultado:** https://github.com/jeanoliveirafs/bemestar-v.1.1.1
4. **Deploy se necessário:** `npm run git:deploy "deploy: versão de teste"`

---

**💡 Dica:** Use `npm run update` para commits rápidos no dia a dia!