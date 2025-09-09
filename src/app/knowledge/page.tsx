'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  _count: {
    embeddings: number;
  };
}

export default function KnowledgePage() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('manual');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (tenantId) {
      fetchDocuments();
    }
  }, [tenantId]);

  const fetchDocuments = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/knowledge/upload', {
        headers: {
          'x-tenant-id': tenantId
        }
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !tenantId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('type', type);

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('Documento adicionado com sucesso!');
        setFile(null);
        setTitle('');
        setType('manual');
        fetchDocuments();
      } else {
        alert('Erro ao adicionar documento: ' + data.error);
      }
    } catch (error) {
      alert('Erro ao fazer upload: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !tenantId) return;

    setUploading(true);
    try {
      const response = await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          title: title || 'Conteúdo Manual',
          content,
          type: 'manual'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Conteúdo adicionado com sucesso!');
        setTitle('');
        setContent('');
        setType('manual');
        setShowAddForm(false);
        fetchDocuments();
      } else {
        alert('Erro ao adicionar conteúdo: ' + data.error);
      }
    } catch (error) {
      alert('Erro ao adicionar conteúdo: ' + error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando base de conhecimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h1>
                <p className="text-gray-600 mt-1">
                  Gerencie documentos e informações para treinar seu agente IA
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Adicionar Conteúdo
                </button>
              </div>
            </div>
          </div>

          {/* Formulário de Adição */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload de Arquivo */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">📄 Upload de Arquivo</h3>
                  <form onSubmit={handleFileUpload} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arquivo
                      </label>
                      <input
                        type="file"
                        accept=".txt,.md,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nome do documento"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="manual">Manual</option>
                        <option value="website">Site</option>
                        <option value="pdf">PDF</option>
                        <option value="txt">Texto</option>
                        <option value="md">Markdown</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Processando...' : 'Adicionar Arquivo'}
                    </button>
                  </form>
                </div>

                {/* Adição Manual */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">✍️ Conteúdo Manual</h3>
                  <form onSubmit={handleManualAdd} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Informações do Site"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Cole aqui informações sobre sua empresa, produtos, serviços, etc..."
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading || !content}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Processando...' : 'Adicionar Conteúdo'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Documentos */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold mb-4">Documentos na Base de Conhecimento</h2>
            
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione documentos para treinar seu agente IA
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Adicionar Primeiro Documento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {doc.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {doc._count.embeddings} chunks processados
                    </p>
                    <p className="text-xs text-gray-500">
                      Adicionado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
