import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const conversationId = params.id;
  const tenantId = req.nextUrl.searchParams.get('tenant');

  if (!tenantId) {
    return new NextResponse('Missing tenant parameter', { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        tenantId: tenantId // Garantir que a conversa pertence ao tenant
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return new NextResponse('Conversa não encontrada', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
