# 🚀 Setup de Produção - Passo a Passo

## 📋 Checklist de Deploy

### ✅ **1. Supabase Configurado**
- [ ] Projeto criado
- [ ] URL copiada
- [ ] Anon Key copiada  
- [ ] Service Role Key copiada
- [ ] Database Password definida

### ✅ **2. Banco de Dados**
- [ ] Schema executado no Supabase
- [ ] Tabelas criadas
- [ ] Índices configurados

### ✅ **3. Vercel Configurado**
- [ ] Conta criada
- [ ] Projeto importado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado

### ✅ **4. GitHub Configurado**
- [ ] Repositório criado
- [ ] Código enviado
- [ ] Deploy automático ativado

## 🔧 **Comandos para Executar**

### **1. Configurar Prisma para Produção:**
```bash
# Substituir schema local pelo PostgreSQL
cp prisma/schema-postgresql.prisma prisma/schema.prisma
```

### **2. Fazer Deploy do Schema:**
```bash
# Conectar ao Supabase e criar tabelas
npx prisma db push
```

### **3. Gerar Cliente Prisma:**
```bash
# Gerar cliente para PostgreSQL
npx prisma generate
```

### **4. Testar Conexão:**
```bash
# Verificar se está conectado
npx prisma studio
```

## 📝 **Variáveis de Ambiente para Vercel**

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
GROQ_API_KEY=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
OPENAI_API_KEY=sk-... # Para embeddings
NEXTAUTH_SECRET=seu-secret-aqui
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

## 🎯 **Próximos Passos**

1. **Aguardar credenciais do Supabase**
2. **Configurar banco de dados**
3. **Testar conexão local**
4. **Configurar Vercel**
5. **Fazer deploy**
6. **Testar em produção**

---

**Status**: ⏳ Aguardando credenciais do Supabase...
