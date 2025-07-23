# 🌟 Bem-Estar SaaS - Estrutura Completa do Projeto

## 📋 Visão Geral da Aplicação

**Nome**: Bem-Estar SaaS (Refúgio Digital)
**Tipo**: Aplicação Web de Saúde Mental e Bem-Estar
**Objetivo**: Plataforma completa para monitoramento de saúde mental, criação de hábitos saudáveis e suporte emocional

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Componentes customizados
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend/Database
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### Deploy e Infraestrutura
- **Hosting**: Vercel
- **CI/CD**: Git automático com scripts customizados
- **Environment**: Node.js

### Ferramentas de Desenvolvimento
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **CSS Processing**: PostCSS

## 📁 Estrutura de Arquivos

```
bem-estarv1/project/
├── 📄 Arquivos de Configuração
│   ├── package.json              # Dependências e scripts
│   ├── vite.config.ts            # Configuração do Vite
│   ├── tailwind.config.js        # Configuração do Tailwind
│   ├── tsconfig.json             # Configuração TypeScript
│   ├── eslint.config.js          # Configuração ESLint
│   ├── postcss.config.js         # Configuração PostCSS
│   └── vercel.json               # Configuração Vercel
│
├── 🗂️ Código Fonte (src/)
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Estilos globais
│   ├── vite-env.d.ts            # Tipos Vite
│   │
│   ├── 🧩 components/            # Componentes React
│   │   ├── Auth/                 # Autenticação
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   ├── features/             # Funcionalidades principais
│   │   │   ├── Dashboard/        # Dashboard principal
│   │   │   ├── Habits/           # Sistema de hábitos
│   │   │   ├── MoodTracking/     # Rastreamento de humor
│   │   │   ├── Emotions/         # Posts emocionais
│   │   │   ├── Assessments/      # Avaliações psicológicas
│   │   │   ├── Routines/         # Rotinas personalizadas
│   │   │   ├── Gamification/     # Sistema de pontuação
│   │   │   └── Profile/          # Perfil do usuário
│   │   │
│   │   ├── layout/               # Layout e navegação
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── pages/                # Páginas da aplicação
│   │   │   ├── HomePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HabitsPage.tsx
│   │   │   ├── EmotionsPage.tsx
│   │   │   ├── AssessmentsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   └── ui/                   # Componentes UI reutilizáveis
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── 🎣 hooks/                 # Custom Hooks
│   │   ├── useAuth.ts            # Hook de autenticação
│   │   ├── useHabits.ts          # Hook de hábitos
│   │   ├── useEmotions.ts        # Hook de posts emocionais
│   │   ├── useRoutines.ts        # Hook de rotinas
│   │   └── useChat.ts            # Hook de chat/IA
│   │
│   ├── 📚 lib/                   # Bibliotecas e utilitários
│   │   ├── supabaseClient.ts     # Cliente Supabase
│   │   └── chatgptService.ts     # Serviço ChatGPT
│   │
│   └── 🏷️ types/                # Definições TypeScript
│       └── index.ts              # Tipos da aplicação
│
├── 🗄️ migrations/               # Migrações do banco
│   ├── 2025-01-22_bem_estar_complete_schema.sql
│   ├── 2025-01-25_complete_database_schema.sql
│   ├── 2025-01-25_refugio_digital_complete_schema.sql
│   └── 2025-01-27_fixed_production_schema.sql
│
├── 📖 docs/                     # Documentação
│   └── API_ENDPOINTS.md
│
├── 🤖 Automação
│   ├── git-auto.cjs             # Script Git automático
│   └── deploy-vercel.js         # Script deploy Vercel
│
└── 📋 Documentação
    ├── README.md
    ├── SUPABASE_SQL_COMMANDS.md
    ├── GIT_AUTO_GUIDE.md
    ├── DEPLOY_RAPIDO_VERCEL.md
    └── ESTRUTURA_PROJETO_COMPLETA.md
```

## 🗃️ Estrutura do Banco de Dados (PostgreSQL/Supabase)

### Tabelas Principais

#### 1. **profiles** - Perfis dos Usuários
```sql
- id (UUID, PK, FK para auth.users)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- avatar_url (TEXT)
- date_of_birth (DATE)
- gender (TEXT)
- phone (TEXT)
- emergency_contact_name (TEXT)
- emergency_contact_phone (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 2. **habit_categories** - Categorias de Hábitos
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE)
- description (TEXT)
- icon (TEXT)
- color (TEXT)
- created_at (TIMESTAMP)
```

#### 3. **user_habits** - Hábitos dos Usuários
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- category_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- frequency_type (TEXT: daily/weekly/custom)
- frequency_config (JSONB)
- reminder_enabled (BOOLEAN)
- reminder_times (TEXT[])
- target_duration_minutes (INTEGER)
- points_per_completion (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 4. **psychological_scales** - Escalas Psicológicas
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE)
- description (TEXT)
- questions (JSONB)
- scoring_config (JSONB)
- risk_thresholds (JSONB)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 5. **user_scale_responses** - Respostas às Escalas
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- scale_id (UUID, FK)
- responses (JSONB)
- total_score (INTEGER)
- risk_level (TEXT: low/moderate/high/severe)
- completed_at (TIMESTAMP)
- notes (TEXT)
```

#### 6. **emotion_posts** - Posts Emocionais
```sql
- id (UUID, PK)
- user_id (UUID, FK, nullable)
- anonymous_id (TEXT, nullable)
- content (TEXT)
- emotion_category (TEXT)
- is_anonymous (BOOLEAN)
- is_moderated (BOOLEAN)
- is_approved (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 7. **user_gamification** - Sistema de Gamificação
```sql
- id (UUID, PK)
- user_id (UUID, FK, UNIQUE)
- total_points (INTEGER)
- current_level (INTEGER)
- points_to_next_level (INTEGER)
- streak_days (INTEGER)
- longest_streak (INTEGER)
- last_activity_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### 8. **daily_mood_logs** - Registro Diário de Humor
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- date (DATE)
- mood_score (INTEGER 1-10)
- energy_level (INTEGER 1-10)
- sleep_quality (INTEGER 1-10)
- sleep_hours (DECIMAL)
- stress_level (INTEGER 1-10)
- notes (TEXT)
- created_at (TIMESTAMP)
- UNIQUE(user_id, date)
```

#### 9. **user_routines** - Rotinas dos Usuários
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- routine_type (TEXT: morning/evening/custom)
- habits (JSONB)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 10. **habit_completions** - Completamento de Hábitos
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- habit_id (UUID, FK)
- completed_at (TIMESTAMP)
- completion_date (DATE)
- duration_minutes (INTEGER)
- notes (TEXT)
- points_earned (INTEGER)
- UNIQUE(user_id, habit_id, completion_date)
```

## 🔐 Sistema de Segurança

### Row Level Security (RLS)
- **Habilitado** em todas as tabelas de usuário
- **Políticas** que garantem que usuários só acessem seus próprios dados
- **Leitura pública** apenas para categorias e escalas psicológicas

### Autenticação
- **Supabase Auth** com email/senha
- **JWT tokens** para sessões
- **Triggers automáticos** para criação de perfil

## ⚙️ Funcionalidades da Aplicação

### 🏠 Dashboard Principal
- **Visão geral** do progresso do usuário
- **Métricas** de hábitos, humor e bem-estar
- **Gráficos** de evolução temporal
- **Resumo** de atividades recentes

### 🎯 Sistema de Hábitos
- **Criação** de hábitos personalizados
- **Categorização** (Exercício, Meditação, Alimentação, etc.)
- **Frequência** configurável (diário, semanal, customizado)
- **Lembretes** com horários específicos
- **Tracking** de completamento
- **Pontuação** por hábito completado

### 😊 Rastreamento de Humor
- **Registro diário** de humor (1-10)
- **Níveis de energia** e qualidade do sono
- **Stress level** e horas de sono
- **Notas** pessoais sobre o dia
- **Histórico** e tendências

### 💭 Posts Emocionais
- **Compartilhamento** de sentimentos
- **Modo anônimo** disponível
- **Categorização** por emoções
- **Moderação** de conteúdo
- **Feed** comunitário

### 📊 Avaliações Psicológicas
- **Escalas validadas** (GAD-7, PHQ-9)
- **Questionários** estruturados
- **Scoring automático**
- **Níveis de risco** (baixo, moderado, alto, severo)
- **Histórico** de avaliações

### 🔄 Rotinas Personalizadas
- **Rotinas matinais** e noturnas
- **Combinação** de múltiplos hábitos
- **Sequenciamento** de atividades
- **Templates** pré-definidos

### 🎮 Sistema de Gamificação
- **Pontos** por atividades completadas
- **Níveis** de progresso
- **Streaks** de dias consecutivos
- **Conquistas** e badges
- **Ranking** pessoal

### 👤 Perfil do Usuário
- **Informações pessoais**
- **Configurações** de privacidade
- **Contato de emergência**
- **Preferências** da aplicação

## 🚀 Scripts e Automação

### Scripts NPM Disponíveis
```json
{
  "dev": "vite",                    // Servidor desenvolvimento
  "build": "vite build",           // Build produção
  "preview": "vite preview",       // Preview build
  "lint": "eslint .",              // Linting código
  "deploy:quick": "node deploy-vercel.js", // Deploy rápido
  "git:auto": "node git-auto.cjs", // Commit automático
  "update": "npm run git:auto",    // Alias para commit
  "git:deploy": "npm run git:auto && npm run deploy:quick" // Commit + Deploy
}
```

### Automação Git
- **Commits automáticos** com mensagens padronizadas
- **Push automático** para GitHub
- **Integração** com deploy Vercel
- **Verificações** de repositório

## 🌐 URLs e Deploy

### Desenvolvimento
- **Local**: http://localhost:5173
- **Preview**: http://localhost:4173

### Produção
- **Vercel**: https://bemestar-v-1-1-1-[hash].vercel.app
- **GitHub**: https://github.com/jeanoliveirafs/bemestar-v.1.1.1

## 📦 Dependências Principais

### Produção
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "lucide-react": "^0.263.1"
}
```

### Desenvolvimento
```json
{
  "@vitejs/plugin-react": "^4.0.3",
  "typescript": "^5.0.2",
  "vite": "^4.4.5",
  "tailwindcss": "^3.3.0",
  "eslint": "^8.45.0"
}
```

## 🎯 Objetivos da Aplicação

### Principais
1. **Monitoramento** de saúde mental
2. **Criação** de hábitos saudáveis
3. **Suporte emocional** comunitário
4. **Avaliação** psicológica básica
5. **Gamificação** para engajamento

### Secundários
1. **Relatórios** de progresso
2. **Insights** baseados em dados
3. **Integração** com profissionais
4. **Recursos educacionais**
5. **Comunidade** de apoio

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Vercel (para deploy)

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_OPENAI_API_KEY=sua_chave_openai (opcional)
```

### Comandos de Setup
```bash
npm install                    # Instalar dependências
npm run dev                    # Iniciar desenvolvimento
npm run build                  # Build para produção
npm run deploy:quick           # Deploy no Vercel
```

---

**📝 Resumo**: Esta é uma aplicação completa de saúde mental e bem-estar construída com React/TypeScript + Supabase, focada em ajudar usuários a monitorar seu bem-estar, criar hábitos saudáveis e receber suporte emocional através de uma plataforma gamificada e segura.