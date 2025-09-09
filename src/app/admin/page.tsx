'use client';
import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    companyName: '',
    whatsappNumber: '',
    customPrompt: '',
    plan: 'basic'
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/client-setup');
      const data = await response.json();
      setClients(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setLoading(false);
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/client-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Cliente ${newClient.companyName} adicionado com sucesso!`);
        setNewClient({ companyName: '', whatsappNumber: '', customPrompt: '', plan: 'basic' });
        loadClients();
      } else {
        alert('Erro ao adicionar cliente: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert('Erro ao adicionar cliente');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>🔄 Carregando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <a href="/" className="badge">← Voltar</a>
        <h2 style={{ color: '#25D366' }}>👥 Gerenciar Clientes</h2>
      </div>

      {/* Formulário para adicionar cliente */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#25D366', marginBottom: '16px' }}>➕ Adicionar Novo Cliente</h3>
        
        <form onSubmit={addClient} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nome da Empresa"
              value={newClient.companyName}
              onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
              required
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
            
            <input
              type="text"
              placeholder="Número WhatsApp (ex: +5511999999999)"
              value={newClient.whatsappNumber}
              onChange={(e) => setNewClient({...newClient, whatsappNumber: e.target.value})}
              required
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
            
            <select
              value={newClient.plan}
              onChange={(e) => setNewClient({...newClient, plan: e.target.value})}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            >
              <option value="basic">Básico (R$ 97/mês)</option>
              <option value="professional">Profissional (R$ 197/mês)</option>
              <option value="enterprise">Empresarial (R$ 397/mês)</option>
            </select>
          </div>
          
          <textarea
            placeholder="Prompt personalizado (opcional)"
            value={newClient.customPrompt}
            onChange={(e) => setNewClient({...newClient, customPrompt: e.target.value})}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
          
          <button
            type="submit"
            className="button"
            style={{ alignSelf: 'flex-start' }}
          >
            ➕ Adicionar Cliente
          </button>
        </form>
      </div>

      {/* Lista de clientes */}
      <div className="card">
        <h3 style={{ color: '#25D366', marginBottom: '16px' }}>
          📋 Clientes Cadastrados ({clients.length})
        </h3>
        
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h4>Nenhum cliente cadastrado</h4>
            <p>Adicione seu primeiro cliente usando o formulário acima</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {clients.map((client) => (
              <div
                key={client.id}
                className="card"
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#25D366' }}>
                      {client.name}
                    </h4>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      📱 WhatsApp: {client.whatsappNumber || 'Não configurado'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#999',
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <span>📅 Criado: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>💼 Plano: {client.plan}</span>
                      <span>📊 Status: {client.status}</span>
                      <span>💬 {client.conversations?.length || 0} conversas</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`/whatsapp?tenant=${client.id}`}
                      className="button"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      💬 Chat
                    </a>
                    <button
                      className="button"
                      style={{ 
                        fontSize: '12px', 
                        padding: '8px 12px',
                        background: '#dc3545'
                      }}
                    >
                      ⚙️ Config
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
