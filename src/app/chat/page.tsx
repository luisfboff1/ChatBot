'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function ChatPage({ searchParams }: any) {
  const tenant = searchParams?.tenant as string | undefined;
  const conversationId = searchParams?.conversation as string | undefined;
  const [messages, setMessages] = useState<{role:string; text:string;}[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'openai' | 'groq' | 'ollama' | 'huggingface' | 'mock'>('mock');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  const sys = useMemo(() => messages.find(m => m.role === 'system')?.text ?? '', [messages]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenant) return;
    
    if (conversationId) {
      // Carregar conversa específica
      fetch(`/api/conversation/${conversationId}?tenant=${tenant}`)
        .then(r => r.json())
        .then((conv) => {
          setMessages(conv.messages || []);
          setCurrentConversationId(conversationId);
        })
        .catch(err => {
          console.error('Erro ao carregar conversa:', err);
          // Fallback para bootstrap
          fetch('/api/bootstrap?tenant=' + tenant).then(r=>r.json()).then((boot) => {
            setMessages(boot.messages);
          });
        });
    } else {
      // Nova conversa - carregar bootstrap
      fetch('/api/bootstrap?tenant=' + tenant).then(r=>r.json()).then((boot) => {
        setMessages(boot.messages);
        setCurrentConversationId(null);
      });
    }
  }, [tenant, conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-tenant-id': tenant || '',
        'x-model': selectedModel
      },
      body: JSON.stringify({ 
        message: input,
        conversationId: currentConversationId
      })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    
    // Atualizar ID da conversa se for uma nova
    if (data.conversationId && !currentConversationId) {
      setCurrentConversationId(data.conversationId);
    }
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <a href="/" className="badge">← Voltar</a>
        <span className="badge">Tenant: {tenant || 'não definido'}</span>
      </div>
      
      <div className="row" style={{ marginTop: 16, alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 'bold', color: '#25D366' }}>🤖 Modelo de IA:</label>
        <select 
          value={selectedModel} 
          onChange={e => setSelectedModel(e.target.value as 'openai' | 'groq' | 'ollama' | 'huggingface' | 'mock')}
        >
          <option value="mock">🎭 Mock (Gratuito)</option>
          <option value="groq">⚡ Groq (Gratuito/Rápido)</option>
          <option value="huggingface">🤗 Hugging Face (Gratuito)</option>
          <option value="openai">🧠 OpenAI GPT (Pago)</option>
          <option value="ollama">🏠 Ollama (Local/Gratuito)</option>
        </select>
        <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
          {selectedModel === 'mock' && '💬 Respostas inteligentes simuladas'}
          {selectedModel === 'groq' && '⚡ IA gratuita e super rápida'}
          {selectedModel === 'huggingface' && '🤗 IA gratuita via Hugging Face'}
          {selectedModel === 'openai' && '🧠 IA real via OpenAI API'}
          {selectedModel === 'ollama' && '🏠 IA local via Ollama'}
        </span>
      </div>
      {sys && (
        <div className="card" style={{ marginTop: 12 }}>
          <strong>System Prompt Atual</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{sys}</pre>
        </div>
      )}
      <div ref={listRef} style={{ 
        maxHeight: 400, 
        overflow: 'auto', 
        marginTop: 16, 
        padding: '16px 0',
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%)',
        borderRadius: '15px',
        border: '1px solid rgba(37, 211, 102, 0.1)'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontStyle: 'italic',
            padding: '40px 20px'
          }}>
            💬 Inicie uma conversa digitando uma mensagem abaixo
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`} style={{ margin: '8px 16px' }}>
              {m.role === 'system' ? (
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#6c757d' }}>
                  <strong>🔧 {m.role}:</strong> {m.text}
                </div>
              ) : (
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6c757d', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    {m.role === 'user' ? '👤 Você' : '🤖 Assistente'}
                  </div>
                  <div>{m.text}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="💬 Digite sua mensagem..." 
          style={{ flex: 1 }}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button 
          className="button" 
          onClick={send}
          disabled={!input.trim()}
          style={{ 
            padding: '12px 20px',
            minWidth: '80px'
          }}
        >
          📤
        </button>
      </div>
    </div>
  );
}
