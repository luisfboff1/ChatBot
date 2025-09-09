const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');

// Configuração do bot
const CLIENT_NUMBER = '+5554999567051'; // Número do cliente (Sports Training)
const CLIENT_NAME = 'Sports Training';
const TENANT_ID = 'cmfcpb6ce000141s43jgj5sq0'; // ID do tenant

// Controle de mensagens processadas
const processedMessages = new Set();

// Controle de conversas por número de telefone
const conversations = new Map();

// Logger personalizado para o Baileys
const logger = {
  level: 'info',
  child: () => logger,
  trace: () => {},
  debug: () => {},
  info: console.log,
  warn: console.warn,
  error: console.error,
  fatal: console.error
};

async function startWhatsAppBot() {
  console.log('🚀 Iniciando bot WhatsApp para', CLIENT_NAME);
  console.log('📱 Número:', CLIENT_NUMBER);
  
  const { state, saveCreds } = await useMultiFileAuthState(`auth_${CLIENT_NAME.replace(/\s+/g, '_')}`);
  
  const sock = makeWASocket({
    auth: state,
    logger: logger,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Conexão fechada, reconectando...', shouldReconnect);
      if (shouldReconnect) {
        startWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Conectado ao WhatsApp!');
      console.log('📱 Bot ativo para', CLIENT_NAME);
    } else if (qr) {
      console.log('📱 QR Code gerado! Escaneie com o WhatsApp Business:');
      qrcode.generate(qr, { small: true });
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const message = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const from = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe;
    const messageId = msg.key.id;

    // Verificar se a mensagem não é do próprio bot, não é de broadcast e não foi processada
    if (message && from && from !== 'status@broadcast' && !isFromMe && !processedMessages.has(messageId)) {
      // Marcar mensagem como processada
      processedMessages.add(messageId);
      
      console.log(`📨 Mensagem recebida de ${from}: ${message}`);
      
      try {
        // Simular que está lendo a mensagem
        console.log('🤔 Analisando sua mensagem...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular que está pensando
        console.log('💭 Processando com IA...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Processar com IA
        const response = await processWithAI(message, TENANT_ID, from);
        
        // Simular que está escrevendo
        console.log('✍️ Preparando resposta...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular que está digitando
        console.log('⌨️ Digitando...');
        await sock.presenceSubscribe(from);
        await sock.sendPresenceUpdate('composing', from);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Parar de digitar
        await sock.sendPresenceUpdate('paused', from);
        
        // Enviar resposta
        await sock.sendMessage(from, { text: response });
        console.log(`✅ Resposta enviada: ${response}`);
        
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        await sock.sendMessage(from, { 
          text: 'Desculpe, ocorreu um erro. Tente novamente.' 
        });
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// Função para processar com IA
async function processWithAI(message, tenantId, phoneNumber) {
  try {
    // Obter ou criar conversationId para este número
    let conversationId = conversations.get(phoneNumber);
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-model': 'groq'
      },
      body: JSON.stringify({
        message: message,
        conversationId: conversationId
      })
    });

    const data = await response.json();
    
    // Salvar o conversationId para este número
    if (data.conversationId) {
      conversations.set(phoneNumber, data.conversationId);
    }
    
    return data.reply || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro ao processar com IA:', error);
    return 'Desculpe, ocorreu um erro. Tente novamente.';
  }
}

// Iniciar bot
startWhatsAppBot().catch(console.error);
