import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      setUserProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // O perfil será criado automaticamente pelo trigger do banco de dados
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };



  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      throw err;
    }
  };

  const acceptTerms = async () => {
    try {
      // Termos aceitos podem ser tratados de outra forma ou removidos
      console.log('Termos aceitos');
    } catch (err) {
      console.error('Erro ao aceitar termos:', err);
      throw err;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    acceptTerms,
    clearError: () => setError(null),
  };
}