import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthContainer } from './AuthContainer';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de rota protegida
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Mostra loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário autenticado, mostra a tela de login
  if (!user) {
    return <AuthContainer />;
  }

  // Se há usuário autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
}