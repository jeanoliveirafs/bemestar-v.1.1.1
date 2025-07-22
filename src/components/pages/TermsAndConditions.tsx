import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Phone, Mail, Globe } from 'lucide-react';

interface TermsAndConditionsProps {
  onAccept: () => void;
  onDecline: () => void;
}

// Componente da página de Termos e Condições
const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept, onDecline }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Função para detectar se o usuário rolou até o final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  // Função para aceitar os termos
  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold text-center">Termos e Condições de Uso</h1>
          <p className="text-center text-blue-100 mt-2">Última atualização: 22/07/2025</p>
        </div>

        {/* Content */}
        <div 
          className="max-h-96 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Boas-vindas */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Bem-vindo ao Refúgio Digital!</h2>
            <p className="text-gray-600">
              Ao acessar ou utilizar nosso software como serviço (SaaS), você concorda com estes Termos e Condições de Uso. 
              Leia com atenção antes de prosseguir.
            </p>
          </div>

          {/* Seção 1 - Natureza do Serviço */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              1. Natureza do Serviço
            </h3>
            <p className="text-gray-700 mb-3">
              O <strong>Refúgio Digital</strong> é uma plataforma de bem-estar e saúde mental que oferece recursos 
              automatizados de apoio emocional, organização pessoal e informações gerais de autocuidado.
            </p>
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <p className="text-red-800 font-semibold mb-2">IMPORTANTE:</p>
              <ul className="text-red-700 space-y-1 text-sm">
                <li>• O Refúgio Digital <strong>não é um serviço médico nem psicológico profissional</strong>.</li>
                <li>• O conteúdo e as interações (inclusive com o agente automatizado) <strong>não substituem consulta com psicólogos, psiquiatras, médicos ou outros profissionais de saúde</strong>.</li>
                <li>• Se você está em situação de emergência ou risco iminente de dano, procure imediatamente o <strong>CVV (188)</strong> ou o serviço de emergência local.</li>
              </ul>
            </div>
          </div>

          {/* Seção 2 - Elegibilidade */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Elegibilidade</h3>
            <p className="text-gray-700 mb-2">Ao usar o serviço, você declara que:</p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Tem pelo menos 18 anos de idade ou está devidamente autorizado por seus responsáveis legais.</li>
              <li>• Concorda com estes Termos e com nossa Política de Privacidade.</li>
            </ul>
          </div>

          {/* Seção 3 - Limitação de Responsabilidade */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Limitação de Responsabilidade</h3>
            <p className="text-gray-700 mb-2">Você reconhece que:</p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• As informações fornecidas pelo Refúgio Digital são de <strong>caráter informativo e de apoio, não diagnósticos ou tratamentos</strong>.</li>
              <li>• O uso do serviço é <strong>por sua conta e risco</strong>.</li>
              <li>• A Jean Automation Pro não se responsabiliza por decisões tomadas com base nas informações ou interações da plataforma.</li>
            </ul>
          </div>

          {/* Seção 4 - Isenção Profissional */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Isenção Profissional</h3>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Nenhum conteúdo disponibilizado aqui deve ser interpretado como aconselhamento psicológico profissional, médico ou jurídico.</li>
              <li>• Você deve sempre procurar um profissional de saúde qualificado antes de tomar decisões relacionadas a tratamento ou saúde mental.</li>
            </ul>
          </div>

          {/* Seção 5 - Uso Adequado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Uso Adequado</h3>
            <p className="text-gray-700 mb-2">Ao utilizar o Refúgio Digital, você se compromete a:</p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Não usar o serviço para emergências médicas ou psiquiátricas.</li>
              <li>• Não inserir conteúdos ilegais, ofensivos ou discriminatórios.</li>
              <li>• Respeitar todas as leis e regulamentos aplicáveis.</li>
            </ul>
          </div>

          {/* Seção 6 - Suspensão ou Encerramento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Suspensão ou Encerramento</h3>
            <p className="text-gray-700">
              Podemos suspender ou encerrar seu acesso ao serviço se houver uso indevido, violação destes Termos ou atividades ilegais.
            </p>
          </div>

          {/* Seção 7 - Propriedade Intelectual */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Propriedade Intelectual</h3>
            <p className="text-gray-700">
              Todo o conteúdo, design e funcionalidades do Refúgio Digital são protegidos por direitos autorais e demais leis de propriedade intelectual. 
              Não é permitido copiar, modificar ou distribuir sem autorização.
            </p>
          </div>

          {/* Seção 8 - Atualizações dos Termos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Atualizações dos Termos</h3>
            <p className="text-gray-700">
              Estes Termos podem ser atualizados periodicamente. Ao continuar usando o serviço após alterações, 
              você concorda com a versão mais recente.
            </p>
          </div>

          {/* Seção 9 - Contato */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Contato</h3>
            <p className="text-gray-700 mb-3">Caso tenha dúvidas ou precise de suporte, entre em contato conosco:</p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                <span>contato@jeanautomationpro.com.br</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                <span>https://jeanautomationpro.com.br</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-red-600" />
                <span>CVV - Centro de Valorização da Vida: 188 (24h)</span>
              </div>
            </div>
          </div>

          {/* Confirmação Final */}
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="text-green-800 text-center font-medium">
              Ao clicar em "Concordo" ou continuar a utilizar o Refúgio Digital, você confirma que leu, 
              entendeu e aceita estes Termos e Condições.
            </p>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="border-t bg-gray-50 p-6 rounded-b-lg flex-shrink-0">
          {/* Checkbox de confirmação */}
          <div className="flex items-center justify-center mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={!hasScrolledToBottom}
              />
              <span className={`ml-2 text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                Li e concordo com os Termos e Condições de Uso
                {!hasScrolledToBottom && ' (role até o final para habilitar)'}
              </span>
            </label>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onDecline}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Não Concordo
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAccepted}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                isAccepted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Concordo e Prosseguir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;