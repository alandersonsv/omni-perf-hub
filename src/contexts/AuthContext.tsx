import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Expor supabase globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('🔧 Supabase exposto globalmente para debug');
}

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
  
  // Ref para acessar o estado atual dentro de closures
  const stateRef = useRef(state);
  stateRef.current = state;
  
  // Ref para controlar execuções simultâneas de loadCompleteUserData
  const loadingRef = useRef(false);

  // Função para carregar dados usando as tabelas existentes (team_members + agencies)
  const loadCompleteUserData = async (user: SupabaseUser) => {
    console.log('🚀 LoadCompleteUserData called for:', user.email);
    console.log('🔒 LoadingRef current state:', loadingRef.current);
    
    // Evitar execuções simultâneas
    if (loadingRef.current) {
      console.log('⏸️ LoadCompleteUserData already running, skipping');
      return;
    }
    
    console.log('✅ Starting loadCompleteUserData execution');
    loadingRef.current = true;
    
    // Timeout de segurança para resetar loadingRef
    const timeoutId = setTimeout(() => {
      console.log('⚠️ LoadCompleteUserData timeout, resetting loadingRef');
      loadingRef.current = false;
    }, 10000);
    
    try {
      console.log('🔄 Loading complete user data for:', user.email);
      console.log('📊 Current state before loading:', {
        hasUser: !!state.user,
        status: state.status,
        isLoading: state.isLoading
      });
      setState(prev => ({ ...prev, isLoading: true, status: 'loading' }));

      // Verificar se usuário já tem agency_id nos metadados
      if (user.user_metadata?.agency_id) {
        console.log('🎯 User has agency_id in metadata:', user.user_metadata.agency_id);
        console.log('📋 User metadata:', user.user_metadata);
        const userWithAgency: User = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            agency_id: user.user_metadata.agency_id,
            role: user.user_metadata.role || 'owner'
          }
        };
        
        // Buscar dados da agência
        const { data: agencyData } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', user.user_metadata.agency_id)
          .single();

        const agency: Agency | null = agencyData ? {
          id: agencyData.id,
          name: agencyData.name,
          subscription_plan: agencyData.subscription_plan,
          trial_ends_at: agencyData.trial_ends_at
        } : null;

        console.log('✅ Setting user as ready (metadata path)');
        setState({
          user: userWithAgency,
          userProfile: {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!,
            avatar_url: user.user_metadata?.avatar_url,
            onboarding_completed: true,
            created_at: null,
            updated_at: null
          },
          agency,
          status: 'ready',
          isLoading: false
        });
        return;
      }

      // Buscar dados em team_members
      const { data: teamMember, error } = await supabase
        .from('team_members')
        .select(`
          agency_id,
          role,
          agencies (
            id,
            name,
            subscription_plan,
            trial_ends_at
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('User not found in team_members table:', error.message);
        
        // Usuário não tem agência
        setState({
          user: user as User,
          userProfile: {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!,
            avatar_url: user.user_metadata?.avatar_url,
            onboarding_completed: false,
            created_at: null,
            updated_at: null
          },
          agency: null,
          status: 'no_agency',
          isLoading: false
        });
        return;
      }

      console.log('Team member data loaded:', teamMember);

      // Construir dados do usuário
      const enhancedUser: User = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          agency_id: teamMember.agency_id,
          role: teamMember.role,
          agency_name: (teamMember.agencies as any)?.name
        }
      };

      const agency: Agency | null = teamMember.agencies ? {
        id: (teamMember.agencies as any).id,
        name: (teamMember.agencies as any).name,
        subscription_plan: (teamMember.agencies as any).subscription_plan,
        trial_ends_at: (teamMember.agencies as any).trial_ends_at
      } : null;

      console.log('✅ Setting user as ready (team_members path)');
      setState({
        user: enhancedUser,
        userProfile: {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email!,
          avatar_url: user.user_metadata?.avatar_url,
          onboarding_completed: true,
          created_at: null,
          updated_at: null
        },
        agency,
        status: 'ready',
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
    } finally {
      clearTimeout(timeoutId);
      loadingRef.current = false;
      console.log('🏁 LoadCompleteUserData finished, loadingRef reset');
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🔧 Setting up auth state listener (useEffect executed)');
    console.log('🏭 Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      PROD: import.meta.env.PROD,
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_KEY_PREFIX: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)
    });
    console.log('📊 Current state when setting up listener:', {
      hasUser: !!state.user,
      status: state.status,
      isLoading: state.isLoading
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email);
        console.log('📋 Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        });
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('👋 User signed out, clearing state');
          setState({
            user: null,
            userProfile: null,
            agency: null,
            status: 'loading',
            isLoading: false
          });
          return;
        }

        if (event === 'SIGNED_IN') {
          console.log('🎉 MAIN LISTENER: User signed in, calling loadCompleteUserData');
          console.log('📊 MAIN LISTENER: Session details:', {
            userId: session.user?.id,
            email: session.user?.email,
            hasMetadata: !!session.user?.user_metadata,
            agencyId: session.user?.user_metadata?.agency_id
          });
          
          try {
            await loadCompleteUserData(session.user);
            console.log('✅ MAIN LISTENER: LoadCompleteUserData call completed');
          } catch (error) {
            console.error('❌ MAIN LISTENER: Error in loadCompleteUserData:', error);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed, checking if reload needed');
          // Só recarregar dados se o usuário não estiver pronto ou se mudou
          const currentState = stateRef.current;
          console.log('Current state for TOKEN_REFRESHED check:', {
            hasUser: !!currentState.user,
            status: currentState.status,
            userId: currentState.user?.id,
            sessionUserId: session.user.id
          });
          
          if (!currentState.user || currentState.status !== 'ready' || currentState.user.id !== session.user.id) {
            console.log('Reloading user data after token refresh');
            await loadCompleteUserData(session.user);
          } else {
            console.log('User already ready, skipping reload');
          }
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email);
      console.log('📊 Initial session details:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      });
      
      if (session?.user) {
        console.log('🚀 Initial session found, calling loadCompleteUserData');
        loadCompleteUserData(session.user);
      } else {
        console.log('❌ No initial session, setting loading to false');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Fallback polling para produção
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    // Só ativar fallback se estado estiver loading por muito tempo
    timeoutId = setTimeout(() => {
      if (state.isLoading && !state.user) {
        console.log('⚠️ FALLBACK: Estado loading por muito tempo, iniciando polling');
        
        const pollSession = async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('❌ FALLBACK: Erro ao verificar sessão:', error);
              return;
            }
            
            if (session?.user && !state.user) {
              console.log('🔄 FALLBACK: Sessão detectada via polling, forçando carregamento');
              await loadCompleteUserData(session.user);
              
              // Parar polling após sucesso
              if (pollInterval) {
                clearInterval(pollInterval);
                console.log('✅ FALLBACK: Polling interrompido após sucesso');
              }
            }
          } catch (error) {
            console.error('💥 FALLBACK: Exceção durante polling:', error);
          }
        };
        
        // Iniciar polling a cada 3 segundos
        pollInterval = setInterval(pollSession, 3000);
        console.log('🔄 FALLBACK: Polling iniciado (3s interval)');
        
        // Parar polling após 30 segundos
        setTimeout(() => {
          if (pollInterval) {
            clearInterval(pollInterval);
            console.log('⏰ FALLBACK: Polling interrompido por timeout (30s)');
          }
        }, 30000);
      }
    }, 5000); // Aguardar 5 segundos antes de ativar fallback
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [state.isLoading, state.user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Debug específico para produção
      if (import.meta.env.PROD) {
        console.log('🔐 PROD LOGIN ATTEMPT:', {
          email,
          timestamp: new Date().toISOString(),
          supabaseUrl: supabase.supabaseUrl,
          keyPrefix: supabase.supabaseKey.substring(0, 20) + '...',
          userAgent: navigator.userAgent.substring(0, 50),
          environment: import.meta.env.MODE,
          hostname: window.location.hostname
        });
      }
      
      console.log('🔐 Attempting login for:', email);
      console.log('📡 Supabase URL:', supabase.supabaseUrl);
      console.log('🔑 Supabase Key prefix:', supabase.supabaseKey.substring(0, 20) + '...');
      
      const startTime = performance.now();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      const endTime = performance.now();
      
      console.log(`⏱️ Login request took: ${(endTime - startTime).toFixed(2)}ms`);
      
      if (error) {
        // Log detalhado para produção
        const errorDetails = {
          message: error.message,
          status: error.status,
          code: error.name,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE,
          supabaseUrl: supabase.supabaseUrl,
          requestDuration: `${(endTime - startTime).toFixed(2)}ms`,
          details: error
        };
        
        console.error('❌ Login error details:', errorDetails);
        
        // Log específico para produção com mais contexto
        if (import.meta.env.PROD) {
          console.error('❌ PROD LOGIN ERROR:', {
            ...errorDetails,
            networkStatus: navigator.onLine ? 'online' : 'offline',
            cookiesEnabled: navigator.cookieEnabled,
            localStorageAvailable: (() => {
              try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
              } catch (e) {
                return false;
              }
            })()
          });
        }
        
        return false;
      }
      
      console.log('✅ Login successful, data received:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata
        } : null,
        session: data.session ? {
          access_token: 'present',
          refresh_token: 'present',
          expires_at: data.session.expires_at
        } : null
      });
      
      // Log de sucesso para produção
      if (import.meta.env.PROD) {
        console.log('✅ PROD LOGIN SUCCESS:', {
          userId: data.user?.id,
          email: data.user?.email,
          hasSession: !!data.session,
          sessionExpires: data.session?.expires_at ? new Date(data.session.expires_at * 1000) : null,
          requestDuration: `${(endTime - startTime).toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('💥 Login exception:', error);
      
      // Log de exceção para produção
      if (import.meta.env.PROD) {
        console.error('💥 PROD LOGIN EXCEPTION:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE,
          supabaseUrl: supabase.supabaseUrl
        });
      }
      
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
      // Atualizar metadados do usuário para marcar onboarding como completo
      const { error } = await supabase.auth.updateUser({
        data: {
          ...state.user.user_metadata,
          onboarding_completed: true
        }
      });
      
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