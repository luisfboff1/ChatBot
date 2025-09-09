# 🤖 Configuração de Modelos de IA - CHATBOT MULTISOCIOS

## 📋 Modelos Disponíveis

### 1. **Mock (Gratuito) - Padrão**
- ✅ **Funciona imediatamente**
- ✅ **Respostas inteligentes simuladas**
- ✅ **Sem custos**
- ✅ **Personalizado por tenant**

### 2. **Groq (Gratuito/Rápido) - RECOMENDADO!**
- ✅ **100% gratuito**
- ✅ **Super rápido (até 10x mais rápido)**
- ✅ **IA real via API**
- ✅ **Modelo Llama 3.1 8B**
- ✅ **30 requests/minuto gratuitos**

**Como configurar:**
1. Acesse: https://console.groq.com/
2. Crie uma conta gratuita
3. Gere uma API key
4. Adicione no arquivo `.env`:
```
GROQ_API_KEY=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
```

### 3. **Ollama (Local/Gratuito)**LLaNSTo gr
- ✅ **100% gratuito**
- ✅ **Roda no seu computador**
- ✅ **Sem limites de uso**
- ❌ **Precisa instalar**

**Como configurar:**
1. Instale Ollama: https://ollama.com/download/windows
2. Execute no terminal:
```bash
ollama serve
ollama pull llama3.2:3b
```

### 4. **Hugging Face (Gratuito)**
- ✅ **100% gratuito**
- ✅ **IA real via API**
- ✅ **Sem instalação**
- ⚠️ **Pode ter delays ocasionais**

**Como funciona:**
- Usa modelo DialoGPT da Microsoft
- API pública do Hugging Face
- Sem necessidade de configuração

### 5. **OpenAI GPT (Pago)**
- 💰 **Custo por token usado**
- ✅ **IA real de alta qualidade**
- ✅ **Via LangChain**

**Como configurar:**
1. Vá para https://platform.openai.com/api-keys
2. Crie uma nova chave API
3. Adicione no arquivo `.env`:
```
OPENAI_API_KEY=sua_chave_aqui
```

## 🚀 Como Usar

1. **Abra o chat** em http://localhost:3000
2. **Selecione um tenant** (Cliente A ou Cliente B)
3. **Escolha o modelo** no dropdown
4. **Teste as mensagens!**

## 💡 Dicas

- **Para desenvolvimento**: Use Mock
- **Para produção**: Use OpenAI ou Ollama
- **Para testes locais**: Use Ollama
- **Para máxima qualidade**: Use OpenAI

## 🔧 Troubleshooting

**OpenAI não funciona:**
- Verifique se a chave está no arquivo `.env`
- Verifique se tem créditos na conta OpenAI

**Ollama não funciona:**
- Verifique se está rodando: `ollama list`
- Baixe o modelo: `ollama pull llama3.2:3b`
- Inicie o serviço: `ollama serve`
