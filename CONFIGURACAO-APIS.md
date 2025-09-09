# 🔧 Configuração de APIs - CHATBOT MULTISOCIOS

## 🚀 Configuração Rápida

### 1. **Groq (Recomendado - Gratuito e Rápido)**

**Passo a passo:**
1. Acesse: https://console.groq.com/
2. Clique em "Sign Up" e crie uma conta gratuita
3. Vá para "API Keys" no menu lateral
4. Clique em "Create API Key"
5. Copie a chave gerada
6. Adicione no arquivo `.env`:
```
GROQ_API_KEY=gsk_sua_chave_aqui
```

**Vantagens:**
- ✅ 100% gratuito
- ✅ Super rápido (até 10x mais rápido que OpenAI)
- ✅ Modelo Llama 3.1 8B
- ✅ 30 requests/minuto gratuitos

### 2. **Ollama (Local - 100% Gratuito)**

**Passo a passo:**
1. Baixe Ollama: https://ollama.com/download/windows
2. Instale o arquivo baixado
3. Abra o terminal e execute:
```bash
ollama serve
```
4. Em outro terminal, baixe o modelo:
```bash
ollama pull llama3.2:3b
```
5. Pronto! Não precisa de chave API

**Vantagens:**
- ✅ 100% gratuito
- ✅ Roda no seu computador
- ✅ Sem limites de uso
- ✅ Funciona offline

### 3. **OpenAI (Pago - Máxima Qualidade)**

**Passo a passo:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada
5. Adicione no arquivo `.env`:
```
OPENAI_API_KEY=sk-sua_chave_aqui
```

**Vantagens:**
- ✅ Máxima qualidade
- ✅ Modelos mais avançados
- ✅ Via LangChain

## 📝 Arquivo .env Completo

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# Database (SQLite para desenvolvimento)
DATABASE_URL="file:./dev.db"

# APIs de IA (escolha uma ou mais)
GROQ_API_KEY=gsk_sua_chave_groq_aqui
OPENAI_API_KEY=sk-sua_chave_openai_aqui

# Exemplo de chaves (substitua pelas suas):
# GROQ_API_KEY=gsk_1234567890abcdef1234567890abcdef
# OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef
```

## 🎯 Recomendação

**Para começar rapidamente:**
1. **Configure Groq** (5 minutos, gratuito, rápido)
2. **Teste o chatbot** 
3. **Se quiser mais qualidade**, configure OpenAI
4. **Se quiser 100% local**, configure Ollama

## 🔍 Como Testar

1. Configure pelo menos uma API
2. Acesse: http://localhost:3000
3. Selecione um tenant
4. Escolha o modelo no dropdown
5. Teste enviando mensagens!

## ❓ Troubleshooting

**Groq não funciona:**
- Verifique se a chave está correta
- Verifique se tem créditos na conta

**Ollama não funciona:**
- Verifique se está rodando: `ollama list`
- Reinicie: `ollama serve`

**OpenAI não funciona:**
- Verifique se a chave está correta
- Verifique se tem créditos na conta
