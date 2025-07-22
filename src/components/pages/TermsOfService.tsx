import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Phone, Mail, Globe, Shield } from 'lucide-react';

interface TermsOfServiceProps {
  onAccept: () => void;
  onDecline: () => void;
  isFirstLogin?: boolean;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ 
  onAccept, 
  onDecline, 
  isFirstLogin = false 
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (isAccepted && hasScrolledToBottom) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl mx-auto my-8 flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 mr-3" />
            <h1 className="text-2xl font-bold">Termos de Uso e Privacidade</h1>
          </div>
          <p className="text-center text-blue-100">
            {isFirstLogin 
              ? 'Bem-vindo! Para continuar, leia e aceite nossos termos.'
              : 'Termos atualizados - Por favor, revise e aceite para continuar.'
            }
          </p>
          <p className="text-center text-blue-200 text-sm mt-2">
            Última atualização: 25 de Janeiro de 2025
          </p>
        </div>

        {/* Content */}
        <div 
          className="max-h-96 overflow-y-auto p-6 space-y-6 flex-1"
          onScroll={handleScroll}
        >
          {/* Aviso Importante */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              Aviso Importante
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              O <strong>Refúgio Digital</strong> é uma ferramenta de apoio ao bem-estar mental e 
              <strong> NÃO substitui acompanhamento psicológico ou psiquiátrico profissional</strong>. 
              Em caso de emergência, procure ajuda imediatamente.
            </p>
          </div>

          {/* Natureza do Serviço */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">1. Natureza do Serviço</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              O Refúgio Digital oferece recursos de apoio ao bem-estar mental, incluindo:
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>• Ferramentas de autoavaliação e monitoramento emocional</li>
              <li>• Exercícios de mindfulness e relaxamento</li>
              <li>• Conteúdo educativo sobre saúde mental</li>
              <li>• Recursos de gamificação para incentivar hábitos saudáveis</li>
              <li>• Planos de ação para situações de crise</li>
            </ul>
          </div>

          {/* Responsabilidades do Usuário */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">2. Responsabilidades do Usuário</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Ao usar nosso serviço, você se compromete a:</p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>• Usar a plataforma de forma responsável e ética</li>
              <li>• Não compartilhar informações falsas ou enganosas</li>
              <li>• Respeitar outros usuários em interações comunitárias</li>
              <li>• Procurar ajuda profissional quando necessário</li>
              <li>• Não usar o serviço para emergências médicas</li>
            </ul>
          </div>

          {/* Limitações e Isenções */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">3. Limitações e Isenções</h3>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>• O serviço é fornecido "como está", sem garantias de resultados específicos</li>
              <li>• Não nos responsabilizamos por decisões tomadas com base no conteúdo da plataforma</li>
              <li>• O uso é por sua conta e risco</li>
              <li>• Recomendamos sempre consultar profissionais qualificados</li>
            </ul>
          </div>

          {/* Privacidade e Dados */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">4. Privacidade e Proteção de Dados</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Levamos sua privacidade a sério e seguimos as melhores práticas de segurança:
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>• Seus dados são criptografados e armazenados com segurança</li>
              <li>• Não compartilhamos informações pessoais com terceiros</li>
              <li>• Você pode solicitar a exclusão de seus dados a qualquer momento</li>
              <li>• Utilizamos cookies apenas para melhorar sua experiência</li>
              <li>• Dados anônimos podem ser usados para melhorar o serviço</li>
            </ul>
          </div>

          {/* Modificações */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">5. Modificações dos Termos</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Podemos atualizar estes termos periodicamente. Você será notificado sobre 
              mudanças significativas e precisará aceitar os novos termos para continuar usando o serviço.
            </p>
          </div>

          {/* Contato e Emergência */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">6. Contato e Emergências</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                <span>Suporte: contato@refugiodigital.com</span>
              </div>
              <div className="flex items-center text-red-600 font-semibold">
                <Phone className="w-4 h-4 mr-2" />
                <span>Emergência: CVV 188 (24h) | SAMU 192</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
              ↓ Role para baixo para continuar ↓
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-b-2xl border-t border-gray-200 dark:border-slate-600">
          <div className="flex items-start space-x-3 mb-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-slate-600 border-gray-300 dark:border-slate-500 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <label 
              htmlFor="acceptTerms" 
              className={`text-sm ${hasScrolledToBottom ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
            >
              Li e aceito os termos de uso e política de privacidade. Entendo que este aplicativo 
              não substitui acompanhamento profissional de saúde mental.
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAccepted || !hasScrolledToBottom}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Aceitar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;