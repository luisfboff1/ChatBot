
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildSystemPrompt } from '@/lib/prompt';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant');
  if (!tenantId) return new NextResponse('Missing tenant', { status: 400 });

  const sys = await buildSystemPrompt(tenantId);

  // Create demo conversation if none
  let conv = await prisma.conversation.findFirst({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  if (!conv) {
    conv = await prisma.conversation.create({ data: { tenantId, title: 'Nova conversa' } });
    await prisma.message.create({ data: { conversationId: conv.id, role: 'system', text: sys } });
  } else {
    // ensure the first system shows current prompt (for demo only)
    const first = await prisma.message.findFirst({ where: { conversationId: conv.id, role: 'system' }, orderBy: { createdAt: 'asc' } });
    if (!first) await prisma.message.create({ data: { conversationId: conv.id, role: 'system', text: sys } });
  }

  const msgs = await prisma.message.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ messages: msgs.map(m => ({ role: m.role, text: m.text })) });
}
