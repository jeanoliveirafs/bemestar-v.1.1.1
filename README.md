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

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/refugio-digital.git
cd refugio-digital
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
As variáveis de ambiente são configuradas diretamente no Vercel para produção:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yeizisgimwwwvestmhnj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
VITE_APP_ENV=production
```

### 4. Configure o Banco de Dados
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `migrations/2025-01-25_refugio_digital_complete_schema.sql`
3. Configure a autenticação e URLs permitidas

### 5. Deploy
O projeto é executado diretamente em produção através do Vercel. Consulte o arquivo `DEPLOY_GUIDE.md` para instruções completas.

## 📦 Deploy

Para instruções completas de deploy no Vercel, consulte o arquivo `DEPLOY_GUIDE.md`.

### Deploy Rápido
1. Faça push para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático! 🚀

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