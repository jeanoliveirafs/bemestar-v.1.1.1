# 🧘‍♀️ Refúgio Digital

> **Plataforma SaaS de Bem-estar Mental e Autocuidado**

Uma aplicação completa para apoio à saúde mental, oferecendo ferramentas de autoavaliação, gamificação de hábitos, planos de emergência, rotinas personalizadas e muito mais.

## 🌟 Funcionalidades

### 📊 **Painel Principal**
- Dashboard com estatísticas de progresso
- Gráficos de evolução do humor
- Métricas de hábitos e conquistas
- Ações rápidas para funcionalidades principais

### 📋 **Autoavaliações Psicológicas**
- **GAD-7**: Escala de Ansiedade Generalizada
- **PHQ-9**: Questionário de Saúde do Paciente (Depressão)
- **Estresse Percebido**: Avaliação de níveis de estresse
- **Bem-estar Subjetivo**: Medição da satisfação com a vida
- Histórico e gráficos de evolução

### 🆘 **Plano de Emergência**
- Contatos de crise (CVV, SAMU, Polícia, etc.)
- Estratégias de enfrentamento
- Contatos pessoais de apoio
- Recursos e links úteis

### 🎮 **Gamificação de Hábitos**
- Sistema de pontuação e conquistas
- Categorias: Físico, Mental, Social, Espiritual
- Sequências e estatísticas
- Gráficos de progresso

### 📅 **Rotina Personalizada**
- Calendário interativo
- Gerenciamento de tarefas diárias
- Estatísticas de cumprimento
- Visualização em calendário ou lista

### 💭 **Mural de Emoções (Comunidade)**
- Compartilhamento de sentimentos
- Sistema de reações e comentários
- Moderação de conteúdo
- Filtros por emoção e categoria

### 🤖 **Assistente IA**
- Chat inteligente com contextos específicos
- Geração de conteúdo personalizado
- Dicas, exercícios e meditações
- Detecção de sinais de crise

### 📈 **Relatórios de Progresso**
- Análises multidimensionais
- Gráficos detalhados
- Exportação e compartilhamento
- Insights personalizados

### 🧘 **Som e Mindfulness**
- Sessões de meditação guiada
- Exercícios de respiração
- Sons relaxantes
- Estatísticas de prática

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **Chart.js** - Gráficos
- **Recharts** - Visualizações avançadas

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

### Integrações
- **OpenAI API** - Assistente de IA
- **Vercel** - Deploy e hosting
- **GitHub** - Controle de versão

## 🚀 Deploy no Vercel via GitHub

### Pré-requisitos
- Conta no GitHub
- Conta no Vercel
- Conta no Supabase (banco de dados já configurado)

### 1. Preparação do Repositório
O projeto já está otimizado para deploy no Vercel:
- ✅ Arquivos desnecessários movidos para `/backup`
- ✅ Variáveis sensíveis removidas do código
- ✅ Configuração do Vercel (`vercel.json`) pronta
- ✅ Scripts de build configurados

### 2. Deploy Automático
1. **Push para GitHub**: Faça commit e push do projeto
2. **Import no Vercel**: 
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Import Project"
   - Conecte seu repositório GitHub
   - Selecione este projeto
3. **Configuração Automática**: O Vercel detectará automaticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3. Configurar Variáveis de Ambiente
Após o import, configure as variáveis no painel do Vercel:

**Settings > Environment Variables:**
```
VITE_SUPABASE_URL=https://yeizisgimwwwvestmhnj.supabase.co
VITE_SUPABASE_ANON_KEY=[sua_chave_anon]
VITE_OPENAI_API_KEY=[sua_chave_openai]
VITE_N8N_WEBHOOK_URL=[sua_url_webhook]
VITE_APP_ENV=production
```

📋 **Consulte `VERCEL_ENV_SETUP.md` para os valores completos das variáveis**

### 4. Configurar Banco de Dados
1. Acesse o [Supabase SQL Editor](https://supabase.com/dashboard)
2. Execute o script: `backup/migrations/2025-01-27_fixed_production_schema.sql`
3. Verifique se as tabelas foram criadas corretamente

### 5. Deploy Final
- O Vercel fará deploy automático após configurar as variáveis
- Acesse a URL fornecida pelo Vercel
- ✅ Aplicação pronta para uso!

## 📦 Estrutura Otimizada para Deploy

## 📁 Estrutura do Projeto

```
refugio-digital/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── Painel.tsx     # Dashboard principal
│   │   ├── Autoavaliacoes.tsx
│   │   ├── Emergencia.tsx
│   │   ├── Habitos.tsx
│   │   ├── Rotina.tsx
│   │   ├── Comunidade.tsx
│   │   ├── ConteudoIA.tsx
│   │   ├── Relatorios.tsx
│   │   └── Mindfulness.tsx
│   ├── lib/               # Configurações e utilitários
│   │   ├── supabaseClient.ts
│   │   └── chatgptService.ts
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Ponto de entrada
├── migrations/            # Scripts SQL do banco
├── DEPLOY_GUIDE.md        # Guia de deploy
└── README.md              # Este arquivo
```

## 🔒 Segurança

- **Row Level Security (RLS)** ativo em todas as tabelas
- **Autenticação JWT** via Supabase
- **Políticas de acesso** granulares
- **Validação de entrada** em todos os formulários
- **Moderação de conteúdo** no mural de emoções

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📊 Monitoramento

- **Vercel Analytics** - Métricas de performance
- **Supabase Dashboard** - Logs e métricas do banco
- **Error Boundaries** - Captura de erros React
- **Console logs** estruturados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Documentação**: Consulte os arquivos de documentação
- **Issues**: Reporte bugs no GitHub Issues
- **Discussões**: Use GitHub Discussions para dúvidas

## 🎯 Roadmap

- [ ] Notificações push
- [ ] App mobile (React Native)
- [ ] Integração com wearables
- [ ] Análise de sentimentos avançada
- [ ] Grupos de apoio
- [ ] Profissionais parceiros
- [ ] Planos premium

---

**💚 Desenvolvido com carinho para promover o bem-estar mental**

*"Cuidar da mente é um ato de amor próprio"*