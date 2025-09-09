'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  whatsappSessions: number;
  documents: number;
  apiCalls: number;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    features: [
      '1 WhatsApp Bot',
      '100 mensagens/mês',
      '5 documentos',
      'Suporte por email',
      'Base de conhecimento básica'
    ],
    whatsappSessions: 1,
    documents: 5,
    apiCalls: 100
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 29,
    features: [
      '3 WhatsApp Bots',
      '1000 mensagens/mês',
      '50 documentos',
      'Suporte prioritário',
      'Base de conhecimento avançada',
      'Analytics detalhados',
      'Integração com CRM'
    ],
    whatsappSessions: 3,
    documents: 50,
    apiCalls: 1000,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 99,
    features: [
      'WhatsApp Bots ilimitados',
      'Mensagens ilimitadas',
      'Documentos ilimitados',
      'Suporte 24/7',
      'Base de conhecimento ilimitada',
      'Analytics avançados',
      'Integração completa',
      'API personalizada',
      'Treinamento dedicado'
    ],
    whatsappSessions: -1, // ilimitado
    documents: -1,
    apiCalls: -1
  }
];

export default function PlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(true);
    try {
      // Criar tenant com o plano selecionado
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          name: 'Novo Cliente'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para onboarding
        router.push(`/onboarding?tenant=${data.tenant.id}&plan=${planId}`);
      } else {
        alert('Erro ao criar conta: ' + data.error);
      }
    } catch (error) {
      alert('Erro ao processar: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Crie seu próprio agente IA para WhatsApp com base de conhecimento personalizada
          </p>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  R$ {plan.price}
                  <span className="text-lg text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">
                  {plan.price === 0 ? 'Para começar' : 'Cobrança mensal'}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Processando...' : 'Começar Agora'}
              </button>
            </div>
          ))}
        </div>

        {/* Features destacadas */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            🚀 O que você recebe com qualquer plano:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2">Agente IA Personalizado</h3>
              <p className="text-gray-600 text-sm">
                Treinado especificamente para seu negócio
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Base de Conhecimento</h3>
              <p className="text-gray-600 text-sm">
                Upload de documentos e informações
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Business</h3>
              <p className="text-gray-600 text-sm">
                Integração completa com WhatsApp
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Relatórios e métricas detalhadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
