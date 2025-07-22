# API Endpoints - Aplicativo de Bem-Estar

## Visão Geral
Este documento descreve todos os endpoints da API para as 8 novas funcionalidades implementadas no aplicativo de bem-estar e saúde mental.

## Base URL
```
Production: https://your-app.supabase.co/rest/v1/
Development: http://localhost:54321/rest/v1/
```

## Autenticação
Todos os endpoints requerem autenticação via Bearer Token:
```
Authorization: Bearer <supabase_jwt_token>
```

---

## 1. Escalas Psicológicas e Autoavaliações

### Listar Escalas Disponíveis
```http
GET /psychological_scales
```

### Obter Escala Específica
```http
GET /psychological_scales/{scale_id}
```

### Submeter Resposta de Escala
```http
POST /user_scale_responses
Content-Type: application/json

{
  "scale_id": "uuid",
  "responses": {
    "question_1": 3,
    "question_2": 2,
    "question_3": 4
  }
}
```

### Obter Histórico de Respostas
```http
GET /user_scale_responses?user_id=eq.{user_id}&order=created_at.desc
```

### Webhook para n8n - Nova Resposta de Escala
```http
POST /webhooks/scale-response
Content-Type: application/json

{
  "user_id": "uuid",
  "scale_name": "PHQ-9",
  "score": 15,
  "risk_level": "medium",
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 2. Plano de Ação em Crises

### Ativar Modo de Crise
```http
POST /crisis_activations
Content-Type: application/json

{
  "trigger_type": "manual",
  "severity_level": "high",
  "location": "optional"
}
```

### Listar Contatos de Emergência
```http
GET /emergency_contacts?user_id=eq.{user_id}
```

### Adicionar Contato de Emergência
```http
POST /emergency_contacts
Content-Type: application/json

{
  "name": "Dr. Silva",
  "phone": "+5511999999999",
  "relationship": "Psicólogo",
  "is_primary": true
}
```

### Obter Recursos de Crise
```http
GET /crisis_resources?is_active=eq.true
```

### Webhook para n8n - Ativação de Crise
```http
POST /webhooks/crisis-activation
Content-Type: application/json

{
  "user_id": "uuid",
  "severity_level": "high",
  "timestamp": "2025-01-22T10:30:00Z",
  "emergency_contacts": [
    {
      "name": "Dr. Silva",
      "phone": "+5511999999999"
    }
  ]
}
```

---

## 3. Gamificação de Hábitos

### Listar Hábitos do Usuário
```http
GET /user_habits?user_id=eq.{user_id}&is_active=eq.true
```

### Criar Novo Hábito
```http
POST /user_habits
Content-Type: application/json

{
  "name": "Meditar 10 minutos",
  "description": "Prática diária de meditação",
  "category": "mindfulness",
  "target_frequency": 7
}
```

### Registrar Completação de Hábito
```http
POST /habit_completions
Content-Type: application/json

{
  "habit_id": "uuid",
  "completed_at": "2025-01-22T10:30:00Z",
  "notes": "Sessão muito relaxante"
}
```

### Obter Status de Gamificação
```http
GET /user_gamification?user_id=eq.{user_id}
```

### Webhook para n8n - Conquista Desbloqueada
```http
POST /webhooks/achievement-unlocked
Content-Type: application/json

{
  "user_id": "uuid",
  "achievement_name": "Meditador Consistente",
  "points_earned": 100,
  "badge_earned": "meditation_master",
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 4. Rotina Personalizada com Lembretes

### Listar Itens da Rotina
```http
GET /routine_items?user_id=eq.{user_id}&is_active=eq.true
```

### Criar Item de Rotina
```http
POST /routine_items
Content-Type: application/json

{
  "title": "Exercício matinal",
  "description": "30 minutos de caminhada",
  "category": "exercise",
  "scheduled_time": "07:00",
  "is_flexible": false,
  "priority": "high"
}
```

### Configurar Lembrete
```http
POST /routine_reminders
Content-Type: application/json

{
  "routine_item_id": "uuid",
  "reminder_time": "06:45",
  "reminder_type": "push_notification",
  "is_smart": true
}
```

### Webhook para n8n - Sugestão de IA para Rotina
```http
POST /webhooks/ai-routine-suggestion
Content-Type: application/json

{
  "user_id": "uuid",
  "current_mood": 6,
  "suggested_activity": "Respiração profunda",
  "reasoning": "Baseado no seu humor atual, uma atividade relaxante seria benéfica",
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 5. Mural de Emoções Anônimas

### Listar Posts do Mural
```http
GET /emotion_posts?order=created_at.desc&limit=20
```

### Criar Post Anônimo
```http
POST /emotion_posts
Content-Type: application/json

{
  "content": "Hoje foi um dia difícil, mas estou tentando manter a esperança",
  "category": "reflection",
  "is_anonymous": true
}
```

### Reagir a Post
```http
POST /emotion_reactions
Content-Type: application/json

{
  "post_id": "uuid",
  "reaction_type": "heart"
}
```

### Comentar em Post
```http
POST /emotion_comments
Content-Type: application/json

{
  "post_id": "uuid",
  "content": "Você não está sozinho! 💙",
  "is_anonymous": true
}
```

### Webhook para n8n - Moderação de Conteúdo
```http
POST /webhooks/content-moderation
Content-Type: application/json

{
  "post_id": "uuid",
  "content": "texto do post",
  "flagged_reason": "inappropriate_content",
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 6. Conteúdo Dinâmico Gerado por IA

### Obter Conteúdo Diário
```http
GET /ai_generated_content?user_id=eq.{user_id}&created_at=gte.{today}
```

### Marcar Conteúdo como Concluído
```http
POST /content_completions
Content-Type: application/json

{
  "content_id": "uuid",
  "completion_time_minutes": 5,
  "rating": 4,
  "feedback": "Muito útil!"
}
```

### Webhook para n8n - Gerar Conteúdo Personalizado
```http
POST /webhooks/generate-ai-content
Content-Type: application/json

{
  "user_id": "uuid",
  "mood_data": {
    "current_mood": 5,
    "recent_activities": ["meditation", "exercise"],
    "stress_level": 7
  },
  "content_preferences": ["motivation", "exercise"],
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 7. Relatórios Visuais de Progresso

### Obter Dados de Humor (Período)
```http
GET /daily_mood_logs?user_id=eq.{user_id}&date=gte.{start_date}&date=lte.{end_date}
```

### Obter Estatísticas de Hábitos
```http
GET /habit_completions?user_id=eq.{user_id}&completed_at=gte.{start_date}
```

### Obter Resumo de Progresso
```http
GET /progress_summaries?user_id=eq.{user_id}&period=eq.{week|month}
```

### Exportar Dados
```http
GET /export/user-data?user_id={user_id}&format=csv&period={week|month|year}
```

### Webhook para n8n - Relatório Semanal
```http
POST /webhooks/weekly-report
Content-Type: application/json

{
  "user_id": "uuid",
  "week_summary": {
    "mood_average": 6.5,
    "habits_completed": 15,
    "streak_count": 7,
    "points_earned": 350
  },
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## 8. Integração com Som e Mindfulness

### Listar Sons Disponíveis
```http
GET /sound_tracks?category=eq.{nature|ambient|meditation}
```

### Iniciar Sessão de Som
```http
POST /sound_sessions
Content-Type: application/json

{
  "sound_track_id": "uuid",
  "planned_duration_minutes": 15,
  "mood_before": 5
}
```

### Finalizar Sessão de Som
```http
PATCH /sound_sessions/{session_id}
Content-Type: application/json

{
  "actual_duration_minutes": 12,
  "mood_after": 7,
  "completed_at": "2025-01-22T10:30:00Z"
}
```

### Obter Sugestões de IA para Sons
```http
GET /ai-sound-suggestions?user_id={user_id}&current_mood={mood_level}
```

### Webhook para n8n - Sugestão de Som Baseada em Humor
```http
POST /webhooks/ai-sound-suggestion
Content-Type: application/json

{
  "user_id": "uuid",
  "current_mood": 4,
  "suggested_sounds": [
    {
      "name": "Chuva Suave",
      "category": "nature",
      "duration": 20,
      "reasoning": "Sons de chuva ajudam a reduzir ansiedade"
    }
  ],
  "timestamp": "2025-01-22T10:30:00Z"
}
```

---

## Integração com n8n

### Configuração de Webhooks

1. **URL Base do n8n**: `https://your-n8n-instance.com/webhook/`
2. **Autenticação**: Header `X-API-Key: your-api-key`
3. **Formato**: JSON
4. **Timeout**: 30 segundos

### Fluxos Principais no n8n

#### 1. Monitoramento de Risco (Escalas Psicológicas)
```
Webhook → Avaliar Score → Se Alto Risco → Notificar Profissional + Ativar Recursos de Crise
```

#### 2. Geração de Conteúdo Personalizado
```
Schedule (Diário) → Buscar Dados do Usuário → OpenAI → Salvar Conteúdo → Notificar Usuário
```

#### 3. Lembretes Inteligentes
```
Schedule → Analisar Padrões → Gerar Sugestões → Enviar Notificação Push
```

#### 4. Relatórios Automáticos
```
Schedule (Semanal) → Coletar Dados → Gerar Gráficos → Enviar por Email
```

### Variáveis de Ambiente para n8n

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
PUSH_NOTIFICATION_KEY=your-push-key
EMAIL_SERVICE_KEY=your-email-key
```

### Exemplos de Automações

#### Detecção de Padrões de Risco
```javascript
// n8n Function Node
const scaleScore = $json.score;
const scaleName = $json.scale_name;

if (scaleName === 'PHQ-9' && scaleScore >= 15) {
  return {
    action: 'alert_professional',
    urgency: 'high',
    message: 'Usuário apresenta sinais de depressão severa'
  };
}

return { action: 'log_only' };
```

#### Geração de Conteúdo Motivacional
```javascript
// n8n OpenAI Node Configuration
const prompt = `
Baseado nos dados do usuário:
- Humor médio: ${$json.mood_average}
- Atividades recentes: ${$json.recent_activities.join(', ')}
- Nível de stress: ${$json.stress_level}

Gere uma mensagem motivacional personalizada de 2-3 frases.
`;
```

---

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `429` - Muitas requisições
- `500` - Erro interno do servidor

## Rate Limiting

- **Usuários autenticados**: 1000 requisições/hora
- **Webhooks**: 100 requisições/minuto
- **Uploads**: 10 arquivos/minuto

## Monitoramento e Logs

Todos os endpoints são monitorados e logados para:
- Performance
- Erros
- Uso de recursos
- Padrões de comportamento
- Detecção de anomalias