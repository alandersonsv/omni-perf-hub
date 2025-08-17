import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// =====================================================
// NOVO AUTHCONTEXT: DATABASE-FIRST APPROACH
// Usando tipos gerados automaticamente pelo Supabase
// =====================================================

type UserStatus = 'loading' | 'no_agency' | 'onboarding_required' | 'ready' | 'error';

// Tipos gerados automaticamente pelo Supabase
type UserAgencyViewData = Database['public']['Views']['user_agency_view']['Row'];
type UserProfileData = Database['public']['Tables']['user_profiles']['Row'];
type AgencyData = Database['public']['Tables']['agencies']['Row'];

interface User extends SupabaseUser {
  user_metadata: {
    agency_id?: string;
    role?: string;
    agency_name?: string;
    [key: string]: any;
  };
}

// Usando tipos do Supabase com extensões necessárias
interface UserProfile extends UserProfileData {
  onboarding_completed: boolean;
}

interface Agency {
  id: string;
  name: string;
  subscription_plan: string;
  trial_ends_at?: string | null;
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  agency: Agency | null;
  status: UserStatus;
  isLoading: boolean;
}

interface AuthContextType {
  // New structured approach
  state: AuthState;
  actions: {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    refreshUserData: () => Promise<void>;
  };
  // Backward compatibility properties
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    agency: null,
    status: 'loading',
    isLoading: true
  });

  // Função única para carregar dados completos usando a view consolidada
  const loadCompleteUserData = async (user: SupabaseUser) => {
    try {
      console.log('Loading complete user data for:', user.email);
      setState(prev => ({ ...prev, isLoading: true, status: 'loading' }));

      // QUERY ÚNICA: Buscar todos os dados de uma vez usando user_agency_view
      const { data, error } = await supabase
        .from('user_agency_view')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data from view:', error);
        
        // Fallback: tentar carregar dados básicos
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setState({
            user: user as User,
            userProfile: profileData as UserProfile,
            agency: null,
            status: 'no_agency',
            isLoading: false
          });
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            status: 'error',
            user: user as User
          }));
        }
        return;
      }

      console.log('User data loaded from view:', data);

      // Dados já tipados corretamente pelo Supabase
      const viewData = data;

      // Construir estado baseado nos dados do banco
      const userProfile: UserProfile = {
        id: viewData.id!,
        email: viewData.email!,
        full_name: viewData.full_name,
        avatar_url: viewData.avatar_url,
        onboarding_completed: viewData.onboarding_completed ?? false,
        created_at: null,
        updated_at: null
      };

      const agency: Agency | null = viewData.agency_id ? {
        id: viewData.agency_id,
        name: viewData.agency_name!,
        subscription_plan: viewData.subscription_plan!,
        trial_ends_at: viewData.trial_ends_at
      } : null;

      const enhancedUser: User = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          agency_id: viewData.agency_id || undefined,
          role: viewData.role || undefined,
          agency_name: viewData.agency_name || undefined
        }
      };

      // Determinar status baseado nos dados
      const userStatus: UserStatus = viewData.user_status as UserStatus || 
        (viewData.agency_id ? 'ready' : 'no_agency');

      console.log('Setting user state:', {
        status: userStatus,
        agency: agency?.name,
        role: viewData.role
      });

      setState({
        user: enhancedUser,
        userProfile,
        agency,
        status: userStatus,
        isLoading: false
      });

    } catch (error) {
      console.error('Error in loadCompleteUserData:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        status: 'error',
        user: user as User
      }));
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('User signed out, clearing state');
          setState({
            user: null,
            userProfile: null,
            agency: null,
            status: 'loading',
            isLoading: false
          });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in, loading data');
          await loadCompleteUserData(session.user);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (session?.user) {
        loadCompleteUserData(session.user);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }
      
      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('Logging out');
    await supabase.auth.signOut();
  };

  const completeOnboarding = async (): Promise<void> => {
    if (!state.user) {
      console.error('No user to complete onboarding for');
      return;
    }
    
    console.log('Completing onboarding for user:', state.user.email);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', state.user.id);
      
      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }
      
      console.log('Onboarding completed, refreshing user data');
      await loadCompleteUserData(state.user);
    } catch (error) {
      console.error('Exception completing onboarding:', error);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (state.user) {
      console.log('Refreshing user data');
      await loadCompleteUserData(state.user);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Auth state updated:', {
      status: state.status,
      isLoading: state.isLoading,
      userEmail: state.user?.email,
      agencyName: state.agency?.name,
      role: state.user?.user_metadata?.role
    });
  }, [state]);

  return (
    <AuthContext.Provider value={{
      // New structured approach
      state,
      actions: { login, logout, completeOnboarding, refreshUserData },
      // Backward compatibility properties
      user: state.user,
      isLoading: state.isLoading,
      signOut: logout,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backward compatibility exports
export type { User };
export { AuthContext };