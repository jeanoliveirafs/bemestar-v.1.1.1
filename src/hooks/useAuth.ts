import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Tipos para o perfil do usuário
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'friends';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
  is_verified: boolean;
  subscription_status: 'free' | 'premium' | 'enterprise';
  subscription_expires_at?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loadUserProfile: () => Promise<UserProfile | null>;
  updateLastLogin: () => Promise<void>;
  isPremium: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Carregar perfil se usuário estiver logado
      if (session?.user) {
        loadUserProfile();
        updateLastLogin();
      }
      
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile();
        await updateLastLogin();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (): Promise<UserProfile | null> => {
    try {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return null;
      }
      
      setUserProfile(data);
      return data;
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado');
        }
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar estado local
      setUserProfile(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };



  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Recarregar perfil após atualização
      await loadUserProfile();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLastLogin = async () => {
    try {
      if (!user) return;
      
      await supabase.rpc('update_last_login');
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  };

  const isPremium = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_user_premium');
      
      if (error) {
        console.error('Erro ao verificar status premium:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Erro ao verificar status premium:', error);
      return false;
    }
  };

  return {
    user,
    userProfile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    loadUserProfile,
    updateLastLogin,
    isPremium,
  };
}