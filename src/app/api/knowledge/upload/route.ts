import { NextRequest, NextResponse } from 'next/server';
import { addDocumentToKnowledgeBase } from '@/lib/rag';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const tenantId = req.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID é obrigatório' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
    }

    // Ler conteúdo do arquivo
    const content = await file.text();
    const fileName = title || file.name;

    // Adicionar à base de conhecimento
    const documentId = await addDocumentToKnowledgeBase(
      fileName,
      content,
      type as any,
      tenantId
    );

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'Documento adicionado com sucesso à base de conhecimento!' 
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID é obrigatório' }, { status: 400 });
    }

    // Buscar documentos do tenant
    const documents = await prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { embeddings: true }
        }
      }
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
