'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const tenant = searchParams?.get('tenant');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    
    fetch(`/api/conversations?tenant=${tenant}`)
      .then(r => r.json())
      .then(data => {
        setConversations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar conversas:', err);
        setLoading(false);
      });
  }, [tenant]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>🔄 Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <a href="/" className="badge">← Voltar</a>
        <span className="badge">Tenant: {tenant || 'não definido'}</span>
      </div>

      <h2 style={{ marginBottom: 20, color: '#25D366' }}>
        💬 Conversas WhatsApp
      </h2>

      {conversations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3>Nenhuma conversa encontrada</h3>
          <p>As conversas aparecerão aqui quando os clientes começarem a interagir.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="card" 
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onClick={() => window.location.href = `/chat?tenant=${tenant}&conversation=${conv.id}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#25D366';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#25D366' }}>
                    {conv.title}
                  </h4>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#6c757d', 
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    {conv.lastMessage}
                  </p>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d',
                    display: 'flex',
                    gap: '16px'
                  }}>
                    <span>📅 {new Date(conv.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>💬 {conv.messageCount} mensagens</span>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px',
                  marginLeft: '16px'
                }}>
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a 
          href={`/chat?tenant=${tenant}`} 
          className="button"
          style={{ display: 'inline-block' }}
        >
          💬 Nova Conversa
        </a>
      </div>
    </div>
  );
}
