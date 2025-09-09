import { prisma } from './db';
import fs from 'fs';
import path from 'path';

// Interface para documentos
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'txt' | 'md' | 'website' | 'manual';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para embeddings
export interface Embedding {
  id: string;
  documentId: string;
  chunk: string;
  embedding: number[];
  metadata: Record<string, any>;
}

// Função para processar e dividir documentos em chunks
export function chunkDocument(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    let chunk = content.slice(start, end);
    
    // Tentar quebrar em uma frase completa
    if (end < content.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + chunkSize * 0.5) {
        chunk = content.slice(start, start + breakPoint + 1);
        start = start + breakPoint + 1 - overlap;
      } else {
        start = end - overlap;
      }
    } else {
      start = end;
    }
    
    chunks.push(chunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filtrar chunks muito pequenos
}

// Função para gerar embeddings usando Groq
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Groq não tem API de embeddings, vamos usar OpenAI ou fallback
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } else {
      // Fallback: usar hash simples como embedding
      return generateSimpleEmbedding(text);
    }
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    // Fallback: usar hash simples como embedding
    return generateSimpleEmbedding(text);
  }
}

// Função fallback para gerar embedding simples
function generateSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach(word => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % 384;
    embedding[index] += 1;
  });
  
  // Normalizar
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Função para calcular similaridade coseno
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Função para buscar documentos relevantes
export async function searchRelevantDocuments(
  query: string, 
  tenantId: string, 
  limit: number = 5
): Promise<{ document: Document; similarity: number; chunk: string }[]> {
  try {
    // Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query);
    
    // Buscar todos os embeddings do tenant
    const embeddings = await prisma.embedding.findMany({
      where: { tenantId },
      include: { document: true }
    });
    
    // Calcular similaridades
    const similarities = embeddings.map(emb => {
      const embeddingArray = JSON.parse(emb.embedding) as number[];
      return {
        document: {
          ...emb.document,
          type: emb.document.type as "website" | "pdf" | "txt" | "md" | "manual"
        },
        similarity: cosineSimilarity(queryEmbedding, embeddingArray),
        chunk: emb.chunk
      };
    });
    
    // Ordenar por similaridade e retornar os melhores
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(item => item.similarity > 0.3); // Threshold mínimo
      
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return [];
  }
}

// Função para adicionar documento à base de conhecimento
export async function addDocumentToKnowledgeBase(
  title: string,
  content: string,
  type: Document['type'],
  tenantId: string
): Promise<string> {
  try {
    // Criar documento no banco
    const document = await prisma.document.create({
      data: {
        title,
        content,
        type,
        tenantId
      }
    });
    
    // Dividir em chunks
    const chunks = chunkDocument(content);
    
    // Gerar embeddings para cada chunk
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      
      await prisma.embedding.create({
        data: {
          documentId: document.id,
          chunk,
          embedding: JSON.stringify(embedding),
          tenantId,
          metadata: JSON.stringify({
            chunkIndex: chunks.indexOf(chunk),
            totalChunks: chunks.length
          })
        }
      });
    }
    
    console.log(`✅ Documento "${title}" adicionado com ${chunks.length} chunks`);
    return document.id;
    
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    throw error;
  }
}

// Função para melhorar o prompt com contexto relevante
export async function enhancePromptWithContext(
  originalPrompt: string,
  userMessage: string,
  tenantId: string
): Promise<string> {
  try {
    // Buscar documentos relevantes
    const relevantDocs = await searchRelevantDocuments(userMessage, tenantId, 3);
    
    if (relevantDocs.length === 0) {
      return originalPrompt;
    }
    
    // Construir contexto
    let context = '\n\n## CONTEXTO RELEVANTE DA BASE DE CONHECIMENTO:\n';
    
    relevantDocs.forEach((doc, index) => {
      context += `\n### Documento ${index + 1}: ${doc.document.title}\n`;
      context += `**Relevância:** ${(doc.similarity * 100).toFixed(1)}%\n`;
      context += `**Conteúdo:** ${doc.chunk}\n`;
    });
    
    context += '\n\n## INSTRUÇÕES:\n';
    context += '- Use as informações acima para responder de forma mais precisa e específica\n';
    context += '- Se a pergunta não estiver relacionada ao contexto, responda normalmente\n';
    context += '- Sempre cite a fonte quando usar informações específicas\n';
    
    return originalPrompt + context;
    
  } catch (error) {
    console.error('Erro ao melhorar prompt:', error);
    return originalPrompt;
  }
}
