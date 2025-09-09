import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// API para configurar cliente (você gerencia tudo)
export async function POST(req: NextRequest) {
  try {
    const { 
      companyName, 
      whatsappNumber, 
      customPrompt,
      plan = 'basic' // basic, professional, enterprise
    } = await req.json();

    if (!companyName || !whatsappNumber) {
      return NextResponse.json({ 
        error: 'Nome da empresa e número WhatsApp são obrigatórios' 
      }, { status: 400 });
    }

    // Criar tenant para o cliente
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        plan: plan,
        whatsappNumber: whatsappNumber,
        status: 'active'
      }
    });

    // Criar prompt personalizado se fornecido
    if (customPrompt) {
      const sysTemplate = await prisma.promptTemplate.findFirst({
        where: { key: 'system', isGlobal: true }
      });

      if (sysTemplate) {
        await prisma.promptOverride.create({
          data: {
            tenantId: tenant.id,
            templateId: sysTemplate.id,
            content: customPrompt
          }
        });
      }
    }

    // Criar conversa inicial
    await prisma.conversation.create({
      data: {
        tenantId: tenant.id,
        title: `Conversa com ${companyName}`,
        whatsappNumber: whatsappNumber
      }
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      message: `Cliente ${companyName} configurado com sucesso!`
    });

  } catch (error) {
    console.error('Erro ao configurar cliente:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// GET para listar clientes
export async function GET(req: NextRequest) {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        conversations: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tenants);

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
