import { NextRequest, NextResponse } from 'next/server';
import { addDocumentToKnowledgeBase } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const { title, content, type } = await req.json();
    const tenantId = req.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID é obrigatório' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    // Adicionar à base de conhecimento
    const documentId = await addDocumentToKnowledgeBase(
      title,
      content,
      type || 'manual',
      tenantId
    );

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'Conteúdo adicionado com sucesso à base de conhecimento!' 
    });

  } catch (error) {
    console.error('Erro ao adicionar conteúdo:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
