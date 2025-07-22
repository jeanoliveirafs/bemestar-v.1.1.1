/**
 * Serviço de integração com ChatGPT API
 * Responsável por gerenciar conversas com IA para bem-estar emocional
 */

import { supabase } from './supabaseClient';

// Tipos para o serviço de chat
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatHistory {
  id: string;
  mensagem_usuario: string;
  resposta_ia: string;
  criado_em: string;
}

export interface ChatResponse {
  response: string;
  tokensUsed: number;
  responseTime: number;
}

/**
 * Configuração do sistema para diferentes contextos
 */
const SYSTEM_PROMPTS = {
  geral: `Você é um assistente especializado em bem-estar emocional e saúde mental. 
    Seu objetivo é oferecer apoio, orientação e recursos para ajudar as pessoas a cuidarem de sua saúde mental.
    Seja empático, acolhedor e sempre incentive a busca por ajuda profissional quando necessário.
    Mantenha suas respostas concisas, práticas e focadas no bem-estar do usuário.`,
  
  crise: `Você é um assistente de apoio em situações de crise emocional. 
    Priorize a segurança do usuário, ofereça apoio imediato e sempre recomende contatos de emergência.
    Se detectar sinais de risco, incentive fortemente a busca por ajuda profissional imediata.
    Seja calmo, acolhedor e focado em estratégias de enfrentamento imediatas.`,
  
  habitos: `Você é um coach especializado em formação de hábitos saudáveis para bem-estar mental.
    Ajude o usuário a criar, manter e otimizar hábitos que promovam saúde mental.
    Ofereça estratégias práticas, motivação e dicas baseadas em evidências científicas.`,
  
  rotina: `Você é um especialista em organização pessoal e rotinas para bem-estar.
    Ajude o usuário a estruturar rotinas que promovam equilíbrio mental e produtividade saudável.
    Foque em estratégias realistas e sustentáveis.`,
  
  mindfulness: `Você é um instrutor de mindfulness e meditação.
    Guie o usuário em práticas de atenção plena, respiração e relaxamento.
    Ofereça exercícios práticos e técnicas para reduzir estresse e ansiedade.`
};

/**
 * Função principal para obter resposta do ChatGPT
 * @param history - Histórico de conversas anteriores
 * @param userMessage - Mensagem atual do usuário
 * @param context - Contexto da conversa (geral, crise, habitos, etc.)
 * @param userId - ID do usuário para salvar no histórico
 */
export async function getChatResponse(
  history: ChatHistory[],
  userMessage: string,
  context: keyof typeof SYSTEM_PROMPTS = 'geral',
  userId?: string
): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    // Preparar mensagens para a API
    const messages: ChatMessage[] = [
      { 
        role: "system", 
        content: SYSTEM_PROMPTS[context] 
      },
      // Adicionar histórico limitado (últimas 10 mensagens para não exceder tokens)
      ...history.slice(-5).flatMap(h => [
        { role: "user" as const, content: h.mensagem_usuario },
        { role: "assistant" as const, content: h.resposta_ia }
      ]),
      { 
        role: "user", 
        content: userMessage 
      }
    ];

    // Fazer chamada para a API do OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Usando modelo mais econômico
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
    const tokensUsed = data.usage?.total_tokens || 0;
    const responseTime = Date.now() - startTime;

    // Salvar no histórico se userId fornecido
    if (userId) {
      await saveToHistory(userId, userMessage, aiResponse, context, tokensUsed, responseTime);
    }

    return {
      response: aiResponse,
      tokensUsed,
      responseTime
    };

  } catch (error) {
    console.error('Erro ao obter resposta do ChatGPT:', error);
    
    // Resposta de fallback
    const fallbackResponse = getFallbackResponse(context);
    const responseTime = Date.now() - startTime;

    // Salvar erro no histórico
    if (userId) {
      await saveToHistory(userId, userMessage, fallbackResponse, context, 0, responseTime);
    }

    return {
      response: fallbackResponse,
      tokensUsed: 0,
      responseTime
    };
  }
}

/**
 * Salvar conversa no histórico do Supabase
 */
async function saveToHistory(
  userId: string,
  userMessage: string,
  aiResponse: string,
  context: string,
  tokensUsed: number,
  responseTime: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('historico_chat')
      .insert({
        user_id: userId,
        mensagem_usuario: userMessage,
        resposta_ia: aiResponse,
        contexto: context,
        tokens_usados: tokensUsed,
        tempo_resposta: responseTime
      });

    if (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
  }
}

/**
 * Obter histórico de conversas do usuário
 */
export async function getChatHistory(
  userId: string,
  limit: number = 20
): Promise<ChatHistory[]> {
  try {
    const { data, error } = await supabase
      .from('historico_chat')
      .select('id, mensagem_usuario, resposta_ia, criado_em')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

/**
 * Gerar conteúdo específico (dicas, exercícios, etc.)
 */
export async function generateContent(
  type: 'dica_diaria' | 'exercicio' | 'meditacao' | 'motivacao',
  userContext?: string
): Promise<string> {
  const prompts = {
    dica_diaria: 'Gere uma dica prática e motivadora para bem-estar mental que possa ser aplicada hoje.',
    exercicio: 'Crie um exercício simples de mindfulness ou relaxamento que pode ser feito em 5-10 minutos.',
    meditacao: 'Descreva uma meditação guiada curta focada em reduzir ansiedade e promover calma.',
    motivacao: 'Escreva uma mensagem motivacional e encorajadora para alguém que está passando por dificuldades emocionais.'
  };

  const contextualPrompt = userContext 
    ? `${prompts[type]} Considere este contexto: ${userContext}`
    : prompts[type];

  try {
    const response = await getChatResponse([], contextualPrompt, 'geral');
    
    // Salvar no cache de conteúdo
    await cacheContent(type, response.response);
    
    return response.response;
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return getFallbackContent(type);
  }
}

/**
 * Salvar conteúdo no cache
 */
async function cacheContent(type: string, content: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('conteudo_ia_cache')
      .insert({
        tipo_conteudo: type,
        conteudo: content,
        ativo: true
      });

    if (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

/**
 * Respostas de fallback quando a API falha
 */
function getFallbackResponse(context: string): string {
  const fallbacks = {
    geral: 'Estou aqui para te apoiar. Que tal tentarmos uma técnica de respiração? Inspire por 4 segundos, segure por 4, expire por 6. Repita algumas vezes.',
    crise: 'Entendo que você está passando por um momento difícil. Lembre-se: você não está sozinho. Se precisar de ajuda imediata, entre em contato com o CVV (188) ou procure um profissional de saúde mental.',
    habitos: 'Formar novos hábitos leva tempo. Comece pequeno: escolha uma ação simples que você possa fazer todos os dias. A consistência é mais importante que a perfeição.',
    rotina: 'Uma boa rotina inclui tempo para autocuidado. Que tal reservar 10 minutos do seu dia para algo que te traz paz?',
    mindfulness: 'Vamos praticar atenção plena: observe sua respiração por alguns momentos. Sinta o ar entrando e saindo. Isso é mindfulness - estar presente no momento atual.'
  };

  return fallbacks[context as keyof typeof fallbacks] || fallbacks.geral;
}

/**
 * Conteúdo de fallback para geração
 */
function getFallbackContent(type: string): string {
  const fallbacks = {
    dica_diaria: 'Pratique a gratidão: anote 3 coisas pelas quais você é grato hoje. Isso ajuda a treinar seu cérebro para focar no positivo.',
    exercicio: 'Exercício de respiração 4-7-8: Inspire por 4 segundos, segure por 7, expire por 8. Repita 4 vezes para reduzir ansiedade.',
    meditacao: 'Sente-se confortavelmente, feche os olhos e foque na sua respiração. Quando pensamentos surgirem, apenas observe-os e volte gentilmente para a respiração.',
    motivacao: 'Você é mais forte do que imagina. Cada dia que você enfrenta é uma prova da sua coragem. Continue, um passo de cada vez.'
  };

  return fallbacks[type as keyof typeof fallbacks] || fallbacks.dica_diaria;
}

/**
 * Detectar sinais de crise em mensagens
 */
export function detectCrisisSignals(message: string): boolean {
  const crisisKeywords = [
    'suicídio', 'suicidio', 'me matar', 'acabar com tudo', 'não aguento mais',
    'quero morrer', 'sem saída', 'sem esperança', 'não vale a pena viver',
    'autolesão', 'me machucar', 'cortar', 'overdose'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Obter resposta de crise automática
 */
export function getCrisisResponse(): string {
  return `🚨 **ATENÇÃO: Detectei que você pode estar passando por um momento de crise.**

**Você não está sozinho(a) e sua vida tem valor.**

**Contatos de emergência:**
• CVV (Centro de Valorização da Vida): 188
• SAMU: 192
• Emergência: 190

**Por favor, procure ajuda imediata:**
• Ligue para um dos números acima
• Vá ao hospital mais próximo
• Entre em contato com um familiar ou amigo
• Procure um profissional de saúde mental

**Lembre-se:** Crises são temporárias, mas a vida é preciosa. Há pessoas que se importam com você e querem ajudar.`;
}

export default {
  getChatResponse,
  getChatHistory,
  generateContent,
  detectCrisisSignals,
  getCrisisResponse
};