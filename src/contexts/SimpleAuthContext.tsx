import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SimpleUser extends SupabaseUser {
  agency_id?: string;
  role?: 'owner' | 'admin' | 'analyst' | 'client';
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Carregando dados do usuário:', supabaseUser.email);
      
      // Buscar dados do team_member de forma simples
      const { data: teamMember, error } = await supabase
        .from('team_members')
        .select('agency_id, role')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao buscar team_member:', error.message);
        setUser(supabaseUser as SimpleUser);
        return;
      }

      if (teamMember) {
        console.log('Team member encontrado:', teamMember);
        const enhancedUser: SimpleUser = {
          ...supabaseUser,
          agency_id: teamMember.agency_id,
          role: teamMember.role
        };
        setUser(enhancedUser);
      } else {
        console.log('Team member não encontrado, criando agência automaticamente');
        // Criar agência e team_member automaticamente
        await createAgencyForUser(supabaseUser);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUser(supabaseUser as SimpleUser);
    }
  };

  const createAgencyForUser = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Criando agência para usuário:', supabaseUser.email);
      
      // 1. Criar agência
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          name: `Agência de ${supabaseUser.email?.split('@')[0] || 'Usuário'}`,
          email: supabaseUser.email!,
          subscription_plan: 'trial',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (agencyError) {
        console.error('Erro ao criar agência:', agencyError);
        setUser(supabaseUser as SimpleUser);
        return;
      }

      console.log('Agência criada:', agencyData.id);

      // 2. Criar team_member
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          id: supabaseUser.id,
          agency_id: agencyData.id,
          email: supabaseUser.email!,
          role: 'owner',
          accepted_at: new Date().toISOString()
        });

      if (teamError) {
        console.error('Erro ao criar team member:', teamError);
        setUser(supabaseUser as SimpleUser);
        return;
      }

      console.log('Team member criado com sucesso');
      
      // 3. Definir usuário com dados da agência
      const enhancedUser: SimpleUser = {
        ...supabaseUser,
        agency_id: agencyData.id,
        role: 'owner'
      };
      setUser(enhancedUser);
    } catch (error) {
      console.error('Erro ao criar agência:', error);
      setUser(supabaseUser as SimpleUser);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          await loadUserData(initialSession.user);
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Tentando fazer login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      if (data.user) {
        console.log('Login bem-sucedido');
        // O onAuthStateChange vai carregar os dados do usuário
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Fazendo logout');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    login,
    logout,
    refreshUser
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}