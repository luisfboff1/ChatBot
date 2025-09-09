'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function WhatsAppPage() {
  const searchParams = useSearchParams();
  const tenant = searchParams?.get('tenant');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'openai' | 'groq' | 'ollama' | 'huggingface' | 'mock'>('groq');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Carregar conversas
  useEffect(() => {
    if (!tenant) return;
    
    fetch(`/api/conversations?tenant=${tenant}`)
      .then(r => r.json())
      .then(data => {
        setConversations(data);
        setLoading(false);
        // Selecionar primeira conversa automaticamente
        if (data.length > 0) {
          setSelectedConversation(data[0]);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar conversas:', err);
        setLoading(false);
      });
  }, [tenant]);

  // Carregar mensagens da conversa selecionada
  useEffect(() => {
    if (!selectedConversation || !tenant) return;
    
    fetch(`/api/conversation/${selectedConversation.id}?tenant=${tenant}`)
      .then(r => r.json())
      .then((conv) => {
        setMessages(conv.messages || []);
      })
      .catch(err => {
        console.error('Erro ao carregar mensagens:', err);
      });
  }, [selectedConversation, tenant]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedConversation || !tenant || isTyping) return;
    
    const userMsg = { role: 'user', text: input };
    const userInput = input;
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    
    // 1. TEMPO DE LEITURA (simular que está lendo a mensagem)
    const readingTime = Math.min(userInput.length * 30, 2000) + Math.random() * 1000; // 0.5-3 segundos
    await new Promise(resolve => setTimeout(resolve, readingTime));
    
    // 2. MOSTRAR INDICADOR DE DIGITANDO (após ler)
    setIsTyping(true);
    
    // 3. TEMPO DE DIGITAÇÃO (baseado no tamanho da resposta)
    const baseTypingTime = 1500;
    const typingTime = baseTypingTime + Math.random() * 2000; // 1.5-3.5 segundos
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-tenant-id': tenant,
          'x-model': selectedModel
        },
        body: JSON.stringify({ 
          message: userInput,
          conversationId: selectedConversation.id
        })
      });
      
      const data = await res.json();
      
      // Aguardar o tempo de digitação
      await new Promise(resolve => setTimeout(resolve, typingTime));
      
      // Adicionar a resposta
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Desculpe, ocorreu um erro. Tente novamente.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <div>Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#075E54',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ← CHATBOT MULTISOCIOS
          </a>
        </div>
        <div style={{ 
          color: 'white', 
          fontSize: '14px',
          background: 'rgba(255,255,255,0.2)',
          padding: '4px 12px',
          borderRadius: '12px'
        }}>
          {tenant === 'cmfcn1og00001gd9rzd3tdmx0' ? 'Sports Training' : 'Colavouro'}
        </div>
      </div>

      {/* Sidebar - Lista de Conversas */}
      <div style={{
        width: '350px',
        background: 'white',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '60px'
      }}>
        {/* Header da Sidebar */}
        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: 0, color: '#075E54' }}>💬 Conversas WhatsApp</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            {conversations.length} conversas ativas
          </p>
        </div>

        {/* Lista de Conversas */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: selectedConversation?.id === conv.id ? '#e7f3ff' : 'white',
                borderLeft: selectedConversation?.id === conv.id ? '4px solid #25D366' : '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedConversation?.id !== conv.id) {
                  e.currentTarget.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedConversation?.id !== conv.id) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #25D366, #128C7E)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {conv.title.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    color: '#075E54',
                    marginBottom: '4px'
                  }}>
                    {conv.title}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    {new Date(conv.createdAt).toLocaleDateString('pt-BR')} • {conv.messageCount} msgs
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal - Chat */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginTop: '60px',
        background: '#f0f0f0'
      }}>
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <div style={{
              padding: '16px 20px',
              background: 'white',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #25D366, #128C7E)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {selectedConversation.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#075E54' }}>
                    {selectedConversation.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Online agora
                  </div>
                </div>
              </div>
              
              {/* Seletor de Modelo */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  fontSize: '12px',
                  color: '#075E54'
                }}
              >
                <option value="groq">⚡ Groq (Rápido)</option>
                <option value="openai">🤖 OpenAI</option>
                <option value="mock">🎭 Mock</option>
              </select>
            </div>

            {/* Mensagens */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.filter(m => m.role !== 'system').map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'slideIn 0.3s ease'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? '#DCF8C6' : 'white',
                    color: '#333',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Indicador de digitando */}
              {isTyping && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    animation: 'slideIn 0.3s ease'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'white',
                    color: '#666',
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#25D366',
                        animation: 'typing 1.4s infinite ease-in-out'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#25D366',
                        animation: 'typing 1.4s infinite ease-in-out 0.2s'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#25D366',
                        animation: 'typing 1.4s infinite ease-in-out 0.4s'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#999' }}>digitando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding: '16px 20px',
              background: 'white',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTyping ? "Aguarde a resposta..." : "Digite sua mensagem..."}
                disabled={isTyping}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  resize: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  minHeight: '20px',
                  maxHeight: '100px',
                  opacity: isTyping ? 0.6 : 1,
                  cursor: isTyping ? 'not-allowed' : 'text'
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: (input.trim() && !isTyping) ? 'linear-gradient(135deg, #25D366, #128C7E)' : '#ccc',
                  color: 'white',
                  fontSize: '20px',
                  cursor: (input.trim() && !isTyping) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isTyping ? 0.6 : 1
                }}
              >
                {isTyping ? '⏳' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3>Selecione uma conversa</h3>
              <p>Escolha uma conversa na lateral para começar a conversar</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
