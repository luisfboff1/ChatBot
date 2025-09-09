import { prisma } from './db';

// Interface para ferramentas disponíveis
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any, tenantId: string) => Promise<any>;
}

// Interface para reasoning step
export interface ReasoningStep {
  step: number;
  thought: string;
  action: string;
  parameters?: any;
  result?: any;
  success: boolean;
}

// Sistema de ferramentas disponíveis
export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: 'search_knowledge',
    description: 'Busca informações na base de conhecimento do cliente',
    parameters: {
      query: { type: 'string', description: 'Pergunta ou termo de busca' },
      limit: { type: 'number', description: 'Número máximo de resultados', default: 3 }
    },
    execute: async (params, tenantId) => {
      const { searchRelevantDocuments } = await import('./rag');
      return await searchRelevantDocuments(params.query, tenantId, params.limit || 3);
    }
  },
  {
    name: 'get_conversation_history',
    description: 'Obtém histórico de conversas anteriores',
    parameters: {
      conversationId: { type: 'string', description: 'ID da conversa' },
      limit: { type: 'number', description: 'Número máximo de mensagens', default: 10 }
    },
    execute: async (params, tenantId) => {
      const messages = await prisma.message.findMany({
        where: { 
          conversationId: params.conversationId,
          conversation: { tenantId }
        },
        orderBy: { createdAt: 'desc' },
        take: params.limit || 10
      });
      return messages.reverse(); // Ordem cronológica
    }
  },
  {
    name: 'get_tenant_info',
    description: 'Obtém informações específicas do cliente/tenant',
    parameters: {},
    execute: async (params, tenantId) => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          memories: true,
          _count: {
            select: {
              conversations: true,
              documents: true
            }
          }
        }
      });
      return tenant;
    }
  },
  {
    name: 'save_memory',
    description: 'Salva uma informação importante na memória de longo prazo',
    parameters: {
      key: { type: 'string', description: 'Chave da informação' },
      value: { type: 'string', description: 'Valor da informação' }
    },
    execute: async (params, tenantId) => {
      const memory = await prisma.longTermMemory.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: params.key
          }
        },
        update: {
          value: params.value
        },
        create: {
          tenantId,
          key: params.key,
          value: params.value
        }
      });
      return memory;
    }
  },
  {
    name: 'get_memory',
    description: 'Recupera informações da memória de longo prazo',
    parameters: {
      key: { type: 'string', description: 'Chave da informação' }
    },
    execute: async (params, tenantId) => {
      const memory = await prisma.longTermMemory.findUnique({
        where: {
          tenantId_key: {
            tenantId,
            key: params.key
          }
        }
      });
      return memory?.value || null;
    }
  },
  {
    name: 'calculate',
    description: 'Executa cálculos matemáticos simples',
    parameters: {
      expression: { type: 'string', description: 'Expressão matemática (ex: 2+2, 10*5)' }
    },
    execute: async (params, tenantId) => {
      try {
        // Sanitizar expressão para segurança
        const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(sanitized);
        return { expression: params.expression, result };
      } catch (error) {
        return { error: 'Expressão inválida' };
      }
    }
  },
  {
    name: 'web_search',
    description: 'Busca informações na web (simulado)',
    parameters: {
      query: { type: 'string', description: 'Termo de busca' }
    },
    execute: async (params, tenantId) => {
      // Simulação de busca web - em produção, integrar com API real
      return {
        query: params.query,
        results: [
          {
            title: `Resultado para: ${params.query}`,
            snippet: 'Informação encontrada na web...',
            url: 'https://example.com'
          }
        ]
      };
    }
  }
];

// Função para executar reasoning com ferramentas
export async function executeReasoning(
  userMessage: string,
  tenantId: string,
  conversationId?: string
): Promise<{ reasoning: ReasoningStep[], finalAnswer: string }> {
  
  const reasoning: ReasoningStep[] = [];
  let step = 1;
  
  try {
    // Step 1: Analisar a mensagem do usuário
    reasoning.push({
      step: step++,
      thought: `Analisando a mensagem do usuário: "${userMessage}". Preciso entender o que está sendo solicitado e quais ferramentas posso usar para ajudar.`,
      action: 'analyze_user_message',
      success: true
    });

    // Step 2: Buscar informações relevantes na base de conhecimento
    const knowledgeResults = await AVAILABLE_TOOLS[0].execute(
      { query: userMessage, limit: 3 },
      tenantId
    );
    
    reasoning.push({
      step: step++,
      thought: `Buscando informações relevantes na base de conhecimento do cliente sobre: "${userMessage}"`,
      action: 'search_knowledge',
      parameters: { query: userMessage },
      result: knowledgeResults,
      success: true
    });

    // Step 3: Verificar histórico da conversa se disponível
    if (conversationId) {
      const history = await AVAILABLE_TOOLS[1].execute(
        { conversationId, limit: 5 },
        tenantId
      );
      
      reasoning.push({
        step: step++,
        thought: 'Verificando histórico da conversa para contexto adicional',
        action: 'get_conversation_history',
        parameters: { conversationId },
        result: history,
        success: true
      });
    }

    // Step 4: Obter informações do tenant
    const tenantInfo = await AVAILABLE_TOOLS[2].execute({}, tenantId);
    
    reasoning.push({
      step: step++,
      thought: 'Obtendo informações específicas do cliente para personalizar a resposta',
      action: 'get_tenant_info',
      result: tenantInfo,
      success: true
    });

    // Step 5: Verificar se há cálculos necessários
    if (userMessage.match(/\d+[\+\-\*\/]\d+/) || userMessage.includes('calcular')) {
      const mathMatch = userMessage.match(/(\d+[\+\-\*\/]\d+)/);
      if (mathMatch) {
        const calcResult = await AVAILABLE_TOOLS[5].execute(
          { expression: mathMatch[1] },
          tenantId
        );
        
        reasoning.push({
          step: step++,
          thought: `Detectei um cálculo na mensagem: ${mathMatch[1]}`,
          action: 'calculate',
          parameters: { expression: mathMatch[1] },
          result: calcResult,
          success: true
        });
      }
    }

    // Step 6: Salvar informações importantes na memória se necessário
    if (userMessage.includes('lembrar') || userMessage.includes('salvar')) {
      const keyMatch = userMessage.match(/lembrar[:\s]+(.+?)[:\s]+(.+)/i);
      if (keyMatch) {
        const memoryResult = await AVAILABLE_TOOLS[3].execute(
          { key: keyMatch[1].trim(), value: keyMatch[2].trim() },
          tenantId
        );
        
        reasoning.push({
          step: step++,
          thought: `Salvando informação importante na memória: ${keyMatch[1]}`,
          action: 'save_memory',
          parameters: { key: keyMatch[1], value: keyMatch[2] },
          result: memoryResult,
          success: true
        });
      }
    }

    // Construir resposta final baseada no reasoning
    let finalAnswer = `Baseado na minha análise, `;
    
    if (knowledgeResults.length > 0) {
      finalAnswer += `encontrei informações relevantes na base de conhecimento do cliente. `;
      knowledgeResults.forEach((doc, index) => {
        finalAnswer += `\n\n**Fonte ${index + 1}:** ${doc.document.title}\n`;
        finalAnswer += `**Relevância:** ${(doc.similarity * 100).toFixed(1)}%\n`;
        finalAnswer += `**Informação:** ${doc.chunk}`;
      });
    }
    
    if (tenantInfo) {
      finalAnswer += `\n\n**Informações do Cliente:**\n`;
      finalAnswer += `- Nome: ${tenantInfo.name}\n`;
      finalAnswer += `- Total de conversas: ${tenantInfo._count.conversations}\n`;
      finalAnswer += `- Documentos na base: ${tenantInfo._count.documents}`;
    }

    reasoning.push({
      step: step++,
      thought: 'Sintetizando todas as informações coletadas para fornecer uma resposta completa e personalizada',
      action: 'synthesize_response',
      result: finalAnswer,
      success: true
    });

    return { reasoning, finalAnswer };

  } catch (error) {
    reasoning.push({
      step: step++,
      thought: `Erro durante o reasoning: ${error}`,
      action: 'error_handling',
      result: error,
      success: false
    });

    return {
      reasoning,
      finalAnswer: 'Desculpe, ocorreu um erro durante o processamento. Tente novamente.'
    };
  }
}

// Função para formatar reasoning para o usuário
export function formatReasoningForUser(reasoning: ReasoningStep[]): string {
  let formatted = '🧠 **Processo de Raciocínio:**\n\n';
  
  reasoning.forEach(step => {
    formatted += `**Passo ${step.step}:** ${step.thought}\n`;
    if (step.action !== 'analyze_user_message' && step.action !== 'synthesize_response') {
      formatted += `🔧 **Ação:** ${step.action}\n`;
    }
    if (step.success) {
      formatted += `✅ **Status:** Sucesso\n`;
    } else {
      formatted += `❌ **Status:** Erro\n`;
    }
    formatted += '\n';
  });
  
  return formatted;
}
