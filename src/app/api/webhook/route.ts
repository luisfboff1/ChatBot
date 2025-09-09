import { NextRequest, NextResponse } from 'next/server';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

// Configuração do Baileys (gratuito)
let socket: any = null;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const to = formData.get('To') as string;

    console.log('WhatsApp Webhook recebido:', { from, body, to });

    if (!from || !body) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Extrair número do WhatsApp (remover whatsapp: prefix)
    const phoneNumber = from.replace('whatsapp:', '');
    
    // Determinar tenant baseado no número (você pode personalizar isso)
    let tenantId = '';
    if (phoneNumber.includes('+55')) { // Números brasileiros
      tenantId = 'cmfcpb6ce000141s43jgj5sq0'; // Sports Training
    } else {
      tenantId = 'cmfcpb6ci000241s4ztmczjpj'; // Colavouro
    }

    // Processar mensagem com IA
    const aiResponse = await processWithAI(body, tenantId, phoneNumber);

    // Enviar resposta via WhatsApp
    // TODO: Implementar envio via WhatsApp (Twilio ou Baileys)
    // await client.messages.create({
    //   from: twilioPhoneNumber,
    //   to: from,
    //   body: aiResponse
    // });

    console.log('Resposta gerada para WhatsApp:', aiResponse);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Função para processar com IA (reutiliza lógica existente)
async function processWithAI(message: string, tenantId: string, phoneNumber: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-model': 'groq' // Usar Groq por padrão
      },
      body: JSON.stringify({
        message: message,
        conversationId: null // Criar nova conversa ou buscar existente
      })
    });

    const data = await response.json();
    return data.reply || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro ao processar com IA:', error);
    return 'Desculpe, ocorreu um erro. Tente novamente.';
  }
}

// GET para verificação do webhook
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get('hub.challenge');
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return new NextResponse('Webhook WhatsApp funcionando!', { status: 200 });
}
