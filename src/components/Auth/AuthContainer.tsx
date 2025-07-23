import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Shield } from 'lucide-react';

/**
 * Container principal para autenticação
 * Gerencia a alternância entre login e registro
 */
export function AuthContainer() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  /**
   * Alterna entre modo de login e registro
   */
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Refúgio Digital</h1>
          <p className="text-gray-600 mt-1">Sua plataforma de bem-estar mental</p>
        </div>

        {/* Formulários de autenticação */}
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onToggleMode={toggleMode} />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Refúgio Digital. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}