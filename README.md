
# 🤖 CHATBOT MULTISOCIOS

**Sistema completo de chatbot multi-tenant** com IA, WhatsApp, base de conhecimento e deploy automático.

## ✨ Funcionalidades

- 🏢 **Multi-tenant** - Múltiplos clientes em uma instância
- 🤖 **IA Integrada** - Groq (gratuito), OpenAI, Ollama (local)
- 📱 **WhatsApp** - Integração completa com WhatsApp Business
- 🧠 **Base de Conhecimento** - RAG com documentos e embeddings
- 🚀 **Deploy Automático** - GitHub + Vercel + Supabase
- 💾 **Banco de Dados** - PostgreSQL (Supabase) com Prisma
- 🎨 **Interface Moderna** - Next.js 14 + Tailwind CSS

## 🚀 Deploy Rápido

### 1. **Configurar Supabase**
```bash
# Crie um projeto no Supabase
# Configure as variáveis no .env:
DATABASE_URL="postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 2. **Configurar IA (escolha uma)**
```bash
# Groq (gratuito e rápido)
GROQ_API_KEY=gsk_sua_chave_aqui

# OpenAI (pago, máxima qualidade)
OPENAI_API_KEY=sk-sua_chave_aqui

# Ollama (100% local)
# Não precisa de chave, apenas instale o Ollama
```

### 3. **Instalar e Rodar**
```bash
# Instalar dependências
npm install --legacy-peer-deps

# Configurar banco
npx prisma db push

# Iniciar desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

## 📱 WhatsApp

### Opção 1: WhatsApp Gratuito (Baileys)
```bash
# Instalar dependências
npm install

# Configurar ngrok
npm run ngrok

# Iniciar bot
npm run whatsapp:bot
```

### Opção 2: WhatsApp Business API
- Configure no arquivo `WHATSAPP-BUSINESS-APP.md`
- Use Twilio ou Meta Business API

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   IA Services   │    │   Knowledge     │
│   (Baileys)     │    │   (Groq/OpenAI) │    │   Base (RAG)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuração Avançada

### Multi-tenancy
- Cada cliente tem seu próprio tenant
- Prompts personalizados por tenant
- Base de conhecimento isolada
- Conversas separadas

### Base de Conhecimento
- Upload de documentos (PDF, TXT, MD)
- Embeddings automáticos
- Busca semântica
- RAG (Retrieval Augmented Generation)

### Deploy Automático
- **GitHub** - Código fonte e CI/CD
- **Vercel** - Deploy automático
- **Supabase** - Banco de dados e auth

## 📚 Documentação

- [Configuração de APIs](CONFIGURACAO-APIS.md)
- [WhatsApp Gratuito](WHATSAPP-GRATUITO.md)
- [WhatsApp Business](WHATSAPP-BUSINESS-APP.md)
- [Deploy Instructions](DEPLOY-INSTRUCTIONS.md)
- [Setup Production](setup-production.md)

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── chat/           # Interface do chat
│   ├── admin/          # Painel administrativo
│   └── whatsapp/       # Configuração WhatsApp
├── lib/                # Utilitários
│   ├── db.ts          # Prisma client
│   ├── rag.ts         # RAG e embeddings
│   └── reasoning.ts   # Lógica de IA
└── prisma/            # Schema do banco
```

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Banco de dados
npx prisma db push
npx prisma studio

# WhatsApp
npm run whatsapp:bot
npm run ngrok
```

## 🚀 Deploy

### 1. GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/chatbot-multisocios.git
git push -u origin main
```

### 2. Vercel
- Conecte o repositório GitHub
- Configure as variáveis de ambiente
- Deploy automático a cada push

### 3. Supabase
- Configure RLS (Row Level Security)
- Configure webhooks se necessário
- Monitore logs e performance

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 💬 Discord: [Link do servidor]
- 📖 Docs: [Link da documentação]

---

**Desenvolvido com ❤️ para revolucionar o atendimento ao cliente**
