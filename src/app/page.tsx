
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🤖 Agentes IA para WhatsApp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Crie seu próprio agente IA personalizado com base de conhecimento, 
            reasoning real e treinamento específico para seu negócio
          </p>
          
          <div className="mb-12">
            <Link 
              href="/plans"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              🚀 Começar Agora - Grátis
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reasoning Real</h2>
              <p className="text-gray-600">
                Seu agente executa tarefas, busca dados e toma decisões inteligentes
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Base de Conhecimento</h2>
              <p className="text-gray-600">
                Treine seu agente com documentos específicos do seu negócio
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Business</h2>
              <p className="text-gray-600">
                Integração completa com WhatsApp para atendimento 24/7
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              🎯 Diferencial Real no Mercado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✅ O que você recebe:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Agente IA personalizado por cliente</li>
                  <li>• Reasoning real com execução de tarefas</li>
                  <li>• Base de conhecimento treinável</li>
                  <li>• Memória persistente de conversas</li>
                  <li>• Analytics e métricas detalhadas</li>
                  <li>• Deploy automático na nuvem</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🚀 Tecnologia Avançada:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Multi-tenancy completo</li>
                  <li>• RAG (Retrieval-Augmented Generation)</li>
                  <li>• Embeddings semânticos</li>
                  <li>• Sistema de ferramentas (Tools)</li>
                  <li>• Escalabilidade infinita</li>
                  <li>• Custo zero até limites generosos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Para desenvolvedores e administradores:
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Painel Admin
              </Link>
              <Link 
                href="/whatsapp"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Configurar Bot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
