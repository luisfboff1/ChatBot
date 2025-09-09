# 🔧 Configuração do Twilio WhatsApp

## 1. Variáveis de Ambiente Necessárias

Adicione estas variáveis ao seu arquivo `.env`:

```bash
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## 2. Como Obter as Credenciais do Twilio

### Passo 1: Criar Conta Twilio
1. Acesse: https://www.twilio.com/try-twilio
2. Crie uma conta gratuita
3. Verifique seu número de telefone

### Passo 2: Obter Credenciais
1. No Dashboard do Twilio, vá em "Account" → "API keys & tokens"
2. Copie:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`

### Passo 3: Configurar WhatsApp Sandbox
1. No Dashboard, vá em "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Siga as instruções para configurar o sandbox
3. Use o número: `+14155238886` → `TWILIO_WHATSAPP_NUMBER`

## 3. Testar a Configuração

### Comandos para testar:

```bash
# 1. Iniciar ngrok (em terminal separado)
ngrok http 3000

# 2. Copiar URL HTTPS gerada (ex: https://abc123.ngrok.io)

# 3. Configurar webhook no Twilio
# URL: https://abc123.ngrok.io/api/webhook

# 4. Testar enviando mensagem para o número do sandbox
```

## 4. Números de Teste

- **Sandbox Number**: +14155238886
- **Seu número**: +5511999999999 (substitua pelo seu)

## 5. Comandos Úteis

```bash
# Iniciar ngrok
ngrok http 3000

# Ver logs do ngrok
ngrok http 3000 --log=stdout

# Iniciar servidor
npm run dev
```
