# 🚀 Instruções de Deploy em Produção

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita)
2. **Conta no Vercel** (gratuita)
3. **Conta no GitHub** (gratuita)
4. **API Keys**:
   - Groq API (já temos)
   - OpenAI API (para embeddings)

## 🔧 Passo a Passo

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings > Database**
4. Copie a **Connection String**
5. Vá em **Settings > API**
6. Copie as chaves **anon** e **service_role**

### 2. Configurar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório
4. Configure as variáveis de ambiente:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
GROQ_API_KEY=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
OPENAI_API_KEY=sk-... # Para embeddings
NEXTAUTH_SECRET=seu-secret-aqui
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

### 3. Configurar Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Execute o script do arquivo `supabase-config.md`
3. Ou use o Prisma:

```bash
# Instalar dependências
npm install

# Configurar Prisma para PostgreSQL
cp prisma/schema-postgresql.prisma prisma/schema.prisma

# Fazer deploy do schema
npx prisma db push

# Gerar cliente
npx prisma generate
```

### 4. Deploy Automático

1. Faça push para o branch `main`
2. O GitHub Actions fará deploy automático
3. Ou use o Vercel CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

## 🎯 Resultado Final

Após o deploy, você terá:

- ✅ **URL de Produção**: `https://seu-projeto.vercel.app`
- ✅ **Banco PostgreSQL**: No Supabase
- ✅ **Deploy Automático**: A cada push
- ✅ **Multi-tenancy**: Cada cliente tem sua base de conhecimento
- ✅ **Reasoning Real**: Agente executa tarefas e busca dados
- ✅ **Escalabilidade**: Suporta milhares de clientes

## 🔄 Fluxo de Trabalho

1. **Desenvolvimento Local**: `npm run dev`
2. **Teste**: `npm test`
3. **Push**: `git push origin main`
4. **Deploy Automático**: GitHub Actions + Vercel
5. **Monitoramento**: Vercel Dashboard + Supabase

## 📊 Monitoramento

- **Vercel Dashboard**: Requests, erros, performance
- **Supabase Dashboard**: Queries, storage, auth
- **Logs**: Centralizados no Vercel Functions

## 🛡️ Segurança

- **RLS (Row Level Security)**: Implementar no Supabase
- **Rate Limiting**: Configurar no Vercel
- **CORS**: Configurar para domínios específicos
- **API Keys**: Armazenadas como secrets

## 💰 Custos

- **Supabase**: Gratuito até 500MB
- **Vercel**: Gratuito até 100GB bandwidth
- **Groq**: Gratuito até 14,400 requests/dia
- **OpenAI**: $0.0001 por 1K tokens

## 🚀 Próximos Passos

1. **Implementar RLS** no Supabase
2. **Configurar Webhooks** do WhatsApp
3. **Adicionar Analytics** detalhados
4. **Implementar Cache** Redis
5. **Configurar CDN** para assets

## 📞 Suporte

- **Documentação**: Este repositório
- **Issues**: GitHub Issues
- **Comunidade**: Discord/Slack
