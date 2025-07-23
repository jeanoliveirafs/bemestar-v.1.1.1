/**
 * Exportações dos componentes de autenticação
 */
export { AuthContainer } from './AuthContainer';
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { ProtectedRoute } from './ProtectedRoute';

// Tipos relacionados à autenticação
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}