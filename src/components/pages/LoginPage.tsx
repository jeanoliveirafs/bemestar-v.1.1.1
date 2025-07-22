import React, { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, isSignUp?: boolean) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function LoginPage({ onLogin, onBack, loading = false }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.email || !formData.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    // Validação específica para cadastro
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
      if (!formData.acceptTerms) {
        alert('Você deve aceitar os termos de uso para continuar.');
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onLogin(formData.email, formData.password, !isLogin);
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Bem-vindo ao Refúgio Digital
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            {isLogin 
              ? 'Entre em sua conta para continuar sua jornada de bem-estar'
              : 'Crie sua conta e comece sua jornada de autoconhecimento'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white"
                  required
                  disabled={isSubmitting || loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white"
                  required
                  minLength={6}
                  disabled={isSubmitting || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={isSubmitting || loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white"
                    required
                    minLength={6}
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>
            )}

            {/* Terms acceptance (only for register) */}
            {!isLogin && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                  required
                  disabled={isSubmitting || loading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-slate-600 dark:text-slate-300">
                  Aceito os{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Política de Privacidade
                  </a>
                  . Entendo que este app não substitui acompanhamento profissional.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Entrando...' : 'Criando conta...'}</span>
                </div>
              ) : (
                isLogin ? 'Entrar na Conta' : 'Criar Conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-600"></div>
            <span className="px-3 text-sm text-slate-500">ou</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-600"></div>
          </div>

          {/* Switch Form */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-300">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                disabled={isSubmitting || loading}
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>

          {/* Forgot Password (only for login) */}
          {isLogin && (
            <div className="text-center mt-4">
              <button 
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isSubmitting || loading}
              >
                Esqueci minha senha
              </button>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            disabled={isSubmitting || loading}
          >
            ← Voltar ao início
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Seus dados estão seguros
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Utilizamos criptografia de ponta e políticas rigorosas de privacidade para proteger suas informações pessoais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}