import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, whatsappNumber, customPrompt, businessType, website, description } = await req.json();

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        name,
        whatsappNumber,
        businessType,
        website,
        description,
        // Salvar prompt personalizado na memória de longo prazo
        ...(customPrompt && {
          memories: {
            upsert: {
              where: {
                tenantId_key: {
                  tenantId: params.id,
                  key: 'custom_prompt'
                }
              },
              update: {
                value: customPrompt
              },
              create: {
                tenantId: params.id,
                key: 'custom_prompt',
                value: customPrompt
              }
            }
          }
        })
      }
    });

    return NextResponse.json({ 
      success: true, 
      tenant,
      message: 'Configurações atualizadas com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao atualizar tenant:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        memories: true,
        _count: {
          select: {
            conversations: true,
            documents: true,
            messages: true
          }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
