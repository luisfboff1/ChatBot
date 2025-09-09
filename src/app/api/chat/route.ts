
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { Ollama } from 'ollama';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/db';
import { buildSystemPrompt } from '@/lib/prompt';
import { enhancePromptWithContext } from '@/lib/rag';
import { executeReasoning, formatReasoningForUser } from '@/lib/reasoning';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const langchainOpenAI = process.env.OPENAI_API_KEY ? new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
}) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : new Groq({ apiKey: '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' });
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Função para usar Hugging Face (gratuito)
async function callHuggingFace(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer hf_xxx', // Token público para modelos gratuitos
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 150,
          temperature: 0.7,
          do_sample: true,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'Sem resposta do Hugging Face.';
  } catch (error) {
    console.error('Erro Hugging Face:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const { message, conversationId } = await req.json();
  const tenantId = req.headers.get('x-tenant-id');
  const selectedModel = req.headers.get('x-model') || 'mock';
  
  // Debug: log das variáveis de ambiente
  console.log('GROQ_API_KEY disponível:', !!process.env.GROQ_API_KEY);
  console.log('Modelo selecionado:', selectedModel);
  console.log('Conversation ID:', conversationId);
  
  if (!tenantId) return new NextResponse('Missing x-tenant-id', { status: 400 });
  if (!message || typeof message !== 'string') return new NextResponse('Missing message', { status: 400 });

  // Get or create a conversation
  let conv;
  if (conversationId) {
    // Usar conversa específica
    conv = await prisma.conversation.findFirst({ 
      where: { 
        id: conversationId, 
        tenantId: tenantId // Garantir que pertence ao tenant
      } 
    });
    if (!conv) return new NextResponse('Conversa não encontrada', { status: 404 });
  } else {
    // Criar nova conversa
    conv = await prisma.conversation.create({ 
      data: { 
        tenantId, 
        title: `Nova conversa - ${new Date().toLocaleString('pt-BR')}` 
      } 
    });
  }

  const systemPrompt = await buildSystemPrompt(tenantId);
  
  // Executar reasoning real com ferramentas
  const { reasoning, finalAnswer: reasoningAnswer } = await executeReasoning(
    message, 
    tenantId, 
    conversationId
  );
  
  // Melhorar o prompt com contexto da base de conhecimento
  const enhancedPrompt = await enhancePromptWithContext(systemPrompt, message, tenantId);

  await prisma.message.create({ data: { conversationId: conv.id, role: 'user', text: message } });

  // Buscar histórico da conversa para contexto
  const conversationHistory = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: 'asc' },
    take: 10 // Últimas 10 mensagens para contexto
  });

  // Construir array de mensagens com histórico
  const reasoningContext = formatReasoningForUser(reasoning);
  const finalPrompt = `${enhancedPrompt}\n\n## REASONING EXECUTADO:\n${reasoningContext}\n\n## RESPOSTA BASEADA NO REASONING:\n${reasoningAnswer}\n\n## INSTRUÇÕES FINAIS:\nUse as informações do reasoning acima para fornecer uma resposta completa e personalizada. Se o reasoning já forneceu uma resposta adequada, use-a como base e melhore-a.`;
  
  const messages = [
    { role: 'system' as const, content: finalPrompt },
    ...conversationHistory
      .filter(m => m.role !== 'system') // Remover system messages do histórico
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.text })),
    { role: 'user' as const, content: message }
  ];

  let reply = '';
  
  try {
    switch (selectedModel) {
      case 'openai':
        if (langchainOpenAI) {
          const response = await langchainOpenAI.invoke(messages);
          reply = response.content as string;
        } else {
          reply = 'OpenAI API key não configurada. Adicione OPENAI_API_KEY no arquivo .env';
        }
        break;
        
      case 'groq':
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant', // Modelo gratuito e rápido
            temperature: 0.7,
            max_tokens: 1024,
          });
          reply = chatCompletion.choices[0]?.message?.content || 'Sem resposta do Groq.';
        } catch (groqError) {
          console.error('Erro Groq:', groqError);
          reply = 'Erro no Groq. Verifique sua API key ou tente novamente.';
        }
        break;
        
      case 'huggingface':
        try {
          const fullPrompt = `${systemPrompt}\n\nUsuário: ${message}\nAssistente:`;
          const hfResponse = await callHuggingFace(fullPrompt);
          // Limpar a resposta removendo o prompt original
          reply = hfResponse.replace(fullPrompt, '').trim() || 'Sem resposta do Hugging Face.';
        } catch (hfError) {
          reply = 'Hugging Face temporariamente indisponível. Tente novamente em alguns segundos.';
        }
        break;
        
      case 'ollama':
        try {
          const ollamaResponse = await ollama.chat({
            model: 'llama3.2:3b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ]
          });
          reply = ollamaResponse.message.content || 'Sem resposta do Ollama.';
        } catch (ollamaError) {
          reply = 'Ollama não está rodando. Instale e execute: ollama serve && ollama pull llama3.2:3b';
        }
        break;
        
      case 'mock':
      default:
        reply = generateSmartMockReply(message, systemPrompt);
        break;
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    reply = `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
  }

  // Função para gerar respostas mock mais inteligentes
  function generateSmartMockReply(userMessage: string, systemPrompt: string) {
    const lowerMessage = userMessage.toLowerCase();
    const tenantName = systemPrompt.includes('empresa') ? 
      systemPrompt.match(/empresa (\w+)/)?.[1] || 'nossa empresa' : 
      'nossa empresa';
    
    // Respostas baseadas no contexto
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia')) {
      return `Olá! Sou o assistente da ${tenantName}. Como posso ajudá-lo hoje?`;
    }
    
    if (lowerMessage.includes('tudo bem') || lowerMessage.includes('como está')) {
      return `Tudo ótimo, obrigado por perguntar! Estou aqui para ajudá-lo com qualquer dúvida sobre a ${tenantName}.`;
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return `Claro! Posso ajudá-lo com informações sobre a ${tenantName}, produtos, serviços ou qualquer outra dúvida que tenha. O que gostaria de saber?`;
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu')) {
      return `De nada! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só falar!`;
    }
    
    if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('valor')) {
      return `Para informações sobre preços e valores, recomendo entrar em contato com nossa equipe comercial. Posso ajudá-lo com outras informações sobre a ${tenantName}.`;
    }
    
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('email')) {
      return `Para informações de contato, recomendo acessar nosso site ou entrar em contato com nossa equipe. Posso ajudá-lo com outras informações sobre a ${tenantName}.`;
    }
    
    // Resposta padrão mais inteligente
    return `Entendo sua pergunta sobre "${userMessage}". Como assistente da ${tenantName}, posso ajudá-lo com informações sobre nossos produtos e serviços. Poderia ser mais específico sobre o que gostaria de saber?`;
  }

  await prisma.message.create({ data: { conversationId: conv.id, role: 'assistant', text: reply } });

  return NextResponse.json({ 
    reply, 
    conversationId: conv.id,
    conversationTitle: conv.title 
  });
}
