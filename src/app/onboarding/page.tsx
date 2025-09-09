'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';

interface OnboardingData {
  businessName: string;
  businessType: string;
  whatsappNumber: string;
  customPrompt: string;
  website: string;
  description: string;
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantId = searchParams.get('tenant');
  const plan = searchParams.get('plan');
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    whatsappNumber: '',
    customPrompt: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    if (step === 4) {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    try {
      const qrData = `https://wa.me/${data.whatsappNumber}?text=Conectar%20Bot%20IA`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrCodeDataURL);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Atualizar informações do tenant
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.businessName,
          whatsappNumber: data.whatsappNumber,
          customPrompt: data.customPrompt,
          businessType: data.businessType,
          website: data.website,
          description: data.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Redirecionar para dashboard do cliente
        router.push(`/dashboard?tenant=${tenantId}`);
      } else {
        alert('Erro ao salvar configurações: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao processar: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: 'Informações Básicas',
      description: 'Conte-nos sobre seu negócio'
    },
    {
      title: 'WhatsApp',
      description: 'Configure seu número do WhatsApp'
    },
    {
      title: 'Personalização',
      description: 'Customize seu agente IA'
    },
    {
      title: 'Conectar Bot',
      description: 'Escaneie o QR Code para conectar'
    },
    {
      title: 'Finalizar',
      description: 'Revise e ative seu bot'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configure seu Agente IA
          </h1>
          <p className="text-gray-600">
            Passo {step} de 5: {steps[step - 1].title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Informações do seu Negócio
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Negócio *
                </label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Sports Training Academy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Negócio *
                </label>
                <select
                  value={data.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="academia">Academia/Fitness</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="servicos">Serviços</option>
                  <option value="educacao">Educação</option>
                  <option value="saude">Saúde</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Negócio
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva brevemente o que sua empresa faz..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (opcional)
                </label>
                <input
                  type="url"
                  value={data.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://seusite.com"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Configuração do WhatsApp
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do WhatsApp Business *
                </label>
                <input
                  type="tel"
                  value={data.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+5511999999999"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use o formato internacional com código do país
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  📱 Importante:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use um número do WhatsApp Business</li>
                  <li>• Certifique-se de que o número está ativo</li>
                  <li>• Você receberá um QR Code para conectar</li>
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Personalize seu Agente IA
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Personalizado (opcional)
                </label>
                <textarea
                  value={data.customPrompt}
                  onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Você é um assistente especializado em fitness. Sempre seja motivador e profissional. Foque em ajudar os clientes a alcançar seus objetivos de saúde..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Deixe em branco para usar o prompt padrão otimizado para seu tipo de negócio
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  ✨ Dicas para um bom prompt:
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Defina a personalidade do agente</li>
                  <li>• Especifique o tom de voz (formal, casual, etc.)</li>
                  <li>• Inclua informações específicas do seu negócio</li>
                  <li>• Defina como lidar com diferentes situações</li>
                </ul>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Conectar seu WhatsApp
              </h2>
              
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      Escaneie este QR Code com seu WhatsApp
                    </p>
                    <p className="text-gray-600">
                      Ou envie uma mensagem para: {data.whatsappNumber}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsConnected(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    ✅ Já Conectei
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Revisar Configurações
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Negócio:</h3>
                  <p className="text-gray-600">{data.businessName}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Tipo:</h3>
                  <p className="text-gray-600">{data.businessType}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">WhatsApp:</h3>
                  <p className="text-gray-600">{data.whatsappNumber}</p>
                </div>
                
                {data.customPrompt && (
                  <div>
                    <h3 className="font-medium text-gray-900">Prompt Personalizado:</h3>
                    <p className="text-gray-600 text-sm bg-white p-3 rounded border">
                      {data.customPrompt}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  🎉 Próximos Passos:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Seu bot estará ativo em alguns minutos</li>
                  <li>• Você receberá acesso ao painel administrativo</li>
                  <li>• Poderá adicionar documentos à base de conhecimento</li>
                  <li>• Acompanhar métricas e conversas</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!data.businessName || !data.businessType)) ||
                  (step === 2 && !data.whatsappNumber) ||
                  (step === 4 && !isConnected)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Finalizando...' : 'Finalizar Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
