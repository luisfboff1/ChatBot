import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant');
  
  if (!tenantId) {
    return new NextResponse('Missing tenant parameter', { status: 400 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1 // Apenas a primeira mensagem para preview
        }
      }
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      lastMessage: conv.messages[0]?.text || 'Nenhuma mensagem',
      messageCount: conv.messages.length
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
