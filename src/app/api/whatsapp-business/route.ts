import { NextRequest, NextResponse } from 'next/server';

// Webhook para WhatsApp Business API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('WhatsApp Business Webhook recebido:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem válida
    if (!body.entry || body.entry.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    const entry = body.entry[0];
    if (!entry.changes || entry.changes.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    const change = entry.changes[0];
    if (!change.value || !change.value.messages) {
      return NextResponse.json({ status: 'ok' });
    }

    const message = change.value.messages[0];
    const from = message.from;
    const text = message.text?.body || '';

    if (!from || !text) {
      return NextResponse.json({ status: 'ok' });
    }

    console.log(`Mensagem recebida de ${from}: ${text}`);

    // Determinar tenant baseado no número
    let tenantId = '';
    if (from.includes('+55')) { // Números brasileiros
      tenantId = 'cmfcpb6ce000141s43jgj5sq0'; // Sports Training
    } else {
      tenantId = 'cmfcpb6ci000241s4ztmczjpj'; // Colavouro
    }

    // Processar mensagem com IA
    const aiResponse = await processWithAI(text, tenantId, from);

    // Enviar resposta via WhatsApp Business API
    await sendWhatsAppMessage(from, aiResponse);

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Erro no webhook WhatsApp Business:', error);
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

// Função para enviar mensagem via WhatsApp Business API
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error('Credenciais do WhatsApp Business não configuradas');
      return;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    const result = await response.json();
    console.log('Resposta enviada via WhatsApp Business:', result);

  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp Business:', error);
  }
}

// GET para verificação do webhook
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Verificar token de verificação
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verificado com sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}
