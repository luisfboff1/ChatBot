import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            conversations: true,
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Erro ao buscar tenants:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { plan, name } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plano é obrigatório' }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: name || 'Novo Cliente',
        plan: plan,
        status: 'active'
      }
    });

    return NextResponse.json({ 
      success: true, 
      tenant,
      message: 'Cliente criado com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao criar tenant:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}