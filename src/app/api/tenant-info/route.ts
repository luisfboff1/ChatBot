
import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/prompt';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant');
  if (!tenantId) return new NextResponse('Missing tenant', { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return new NextResponse('Tenant not found', { status: 404 });

  const systemPrompt = await buildSystemPrompt(tenantId);
  return NextResponse.json({ id: tenant.id, name: tenant.name, plan: tenant.plan, systemPrompt });
}
