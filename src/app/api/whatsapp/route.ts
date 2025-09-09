import { NextRequest, NextResponse } from 'next/server';

// Webhook simples para receber mensagens do WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('WhatsApp Webhook recebido:', body);

    // Verificar se é uma mensagem válida
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    const message = body.messages[0];
    const from = message.from;
    const text = message.text?.body || '';

    if (!from || !text) {
      return NextResponse.json({ status: 'ok' });
    }

    // Determinar tenant baseado no número
    let tenantId = '';
    if (from.includes('+55')) { // Números brasileiros
      tenantId = 'cmfcpb6ce000141s43jgj5sq0'; // Sports Training
    } else {
      tenantId = 'cmfcpb6ci000241s4ztmczjpj'; // Colavouro
    }

    // Processar mensagem com IA
    const aiResponse = await processWithAI(text, tenantId, from);

    // Aqui você pode enviar a resposta de volta
    // (implementação depende do método escolhido)
    console.log('Resposta da IA:', aiResponse);

    return NextResponse.json({ 
      status: 'ok',
      response: aiResponse 
    });

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Função para processar com IA
async function processWithAI(message: string, tenantId: string, phoneNumber: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-model': 'groq'
      },
      body: JSON.stringify({
        message: message,
        conversationId: null
      })
    });

    const data = await response.json();
    return data.reply || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro ao processar com IA:', error);
    return 'Desculpe, ocorreu um erro. Tente novamente.';
  }
}

// GET para verificação
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'WhatsApp Webhook funcionando!',
    timestamp: new Date().toISOString()
  });
}
