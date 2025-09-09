# Configuração Supabase para Deploy em Produção

## 1. Configuração do Banco de Dados

### Variáveis de Ambiente para Produção:
```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# APIs
GROQ_API_KEY="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"
OPENAI_API_KEY="sk-..." # Para embeddings

# Next.js
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="https://seu-dominio.vercel.app"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
```

## 2. Schema do Banco (PostgreSQL)

```sql
-- Executar no Supabase SQL Editor

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Tenants (Clientes)
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "whatsappNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Tabela de Usuários
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Membros
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    UNIQUE("userId", "tenantId")
);

-- Tabela de Templates de Prompt
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Overrides de Prompt
CREATE TABLE "PromptOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "content" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE,
    UNIQUE("tenantId", "templateId")
);

-- Tabela de Conversas
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Tabela de Mensagens
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "tokens" INTEGER,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Tabela de Memória de Longo Prazo
CREATE TABLE "LongTermMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    UNIQUE("tenantId", "key")
);

-- Tabela de Documentos (Base de Conhecimento)
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Tabela de Embeddings
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "chunk" TEXT NOT NULL,
    "embedding" TEXT NOT NULL, -- JSON array
    "metadata" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX "idx_tenant_documents" ON "Document"("tenantId");
CREATE INDEX "idx_tenant_embeddings" ON "Embedding"("tenantId");
CREATE INDEX "idx_tenant_memory" ON "LongTermMemory"("tenantId", "key");
CREATE INDEX "idx_conversation_messages" ON "Message"("conversationId");
```

## 3. Configuração do Prisma para Produção

Atualizar `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 4. Deploy no Vercel

### vercel.json:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "GROQ_API_KEY": "@groq_api_key",
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

## 5. Scripts de Deploy

### package.json:
```json
{
  "scripts": {
    "deploy": "prisma db push && vercel --prod",
    "migrate": "prisma db push",
    "seed": "prisma db seed"
  }
}
```

## 6. Configuração de Webhooks

Para WhatsApp Business API:
- URL: `https://seu-dominio.vercel.app/api/webhook`
- Método: POST
- Headers: Authorization com token

## 7. Monitoramento

- **Supabase Dashboard**: Monitorar queries e performance
- **Vercel Analytics**: Monitorar requests e erros
- **Logs**: Centralizados no Vercel Functions

## 8. Backup e Segurança

- **Backup Automático**: Supabase faz backup diário
- **RLS (Row Level Security)**: Implementar políticas de segurança
- **Rate Limiting**: Configurar no Vercel
- **CORS**: Configurar para domínios específicos
