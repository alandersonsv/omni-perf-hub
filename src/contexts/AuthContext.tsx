import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { handleMissingAgencyAssociation } from '@/utils/ensureUserAgency';

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
  
  // Sistema avançado de controle de execução
  const loadingRef = useRef(false);
  const stateRef = useRef(state);
  const executionCountRef = useRef(0);
  const lastExecutionTimeRef = useRef(0);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  
  // Atualizar ref sempre que state mudar
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sistema de Watchdog para detectar estados travados
  const startWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
    }
    
    watchdogRef.current = setTimeout(() => {
      const currentState = stateRef.current;
      const timeSinceLastExecution = Date.now() - lastExecutionTimeRef.current;
      
      console.log('🐕 WATCHDOG: Verificando estado travado:', {
        isLoading: currentState.isLoading,
        status: currentState.status,
        hasUser: !!currentState.user,
        loadingRefActive: loadingRef.current,
        timeSinceLastExecution,
        executionCount: executionCountRef.current
      });
      
      // Detectar estado travado: loading há mais de 15 segundos
      if (currentState.isLoading && currentState.status === 'loading' && timeSinceLastExecution > 15000) {
        console.log('🚨 WATCHDOG: Estado travado detectado! Forçando recuperação...');
        forceRecovery();
      }
    }, 20000); // Verificar a cada 20 segundos
  };

  // Sistema de recuperação forçada
  const forceRecovery = async () => {
    console.log('🔧 FORCE RECOVERY: Iniciando recuperação de emergência');
    
    try {
      // Reset completo do estado de loading
      loadingRef.current = false;
      
      // Verificar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ FORCE RECOVERY: Erro ao verificar sessão:', error);
        setState(prev => ({ ...prev, isLoading: false, status: 'error' }));
        return;
      }
      
      if (session?.user) {
        console.log('🔄 FORCE RECOVERY: Sessão encontrada, forçando loadCompleteUserData');
        await loadCompleteUserData(session.user, true); // Força execução
      } else {
        console.log('❌ FORCE RECOVERY: Nenhuma sessão encontrada');
        setState({
          user: null,
          userProfile: null,
          agency: null,
          status: 'loading',
          isLoading: false
        });
      }
    } catch (error) {
      console.error('💥 FORCE RECOVERY: Erro durante recuperação:', error);
      setState(prev => ({ ...prev, isLoading: false, status: 'error' }));
    }
  };

  // Função para carregar dados usando as tabelas existentes (team_members + agencies)
  const loadCompleteUserData = async (user: SupabaseUser, forceExecution = false) => {
    const executionId = ++executionCountRef.current;
    const startTime = Date.now();
    lastExecutionTimeRef.current = startTime;
    
    console.log(`🚀 LoadCompleteUserData #${executionId} iniciado:`, {
      email: user.email,
      forceExecution,
      loadingRefActive: loadingRef.current,
      currentStatus: stateRef.current.status
    });
    
    if (loadingRef.current && !forceExecution) {
      console.log(`⚠️ LoadCompleteUserData #${executionId} já em execução, aguardando...`);
      
      // Aguardar até 5 segundos pela execução atual
      let waitTime = 0;
      while (loadingRef.current && waitTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
      }
      
      if (loadingRef.current) {
        console.log(`🔥 LoadCompleteUserData #${executionId} timeout de espera, forçando execução`);
        loadingRef.current = false; // Reset forçado
      } else {
        console.log(`✅ LoadCompleteUserData #${executionId} execução anterior concluída`);
        return;
      }
    }
    
    loadingRef.current = true;
    
    // Timeout de segurança mais agressivo
    const timeoutId = setTimeout(() => {
      console.log(`⚠️ LoadCompleteUserData #${executionId} timeout (8s), resetando loadingRef`);
      loadingRef.current = false;
    }, 8000);
    
    // Iniciar watchdog
    startWatchdog();
    
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

      // Buscar dados em team_members (sem .single() para evitar erro 406)
      const { data: teamMembers, error } = await supabase
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
        .order('invited_at', { ascending: false })
        .limit(1);

      if (error || !teamMembers || teamMembers.length === 0) {
        console.warn('User not found in team_members table:', error?.message || 'No records found');
        
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
        
        console.log('🔧 AUTO-FIXING: Creating agency association for user:', user.email);
        
        try {
          // Automatically create agency association
          const agencyData = await handleMissingAgencyAssociation(user.email!);
          
          console.log('✅ Agency association created:', agencyData);
          
          // Set state with new agency data
          setState({
            user: {
              ...user,
              user_metadata: {
                ...user.user_metadata,
                agency_id: agencyData.agency_id,
                role: agencyData.user_role,
                agency_name: agencyData.agency_name
              }
            } as User,
            userProfile: {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.email!,
              avatar_url: user.user_metadata?.avatar_url,
              onboarding_completed: true,
              created_at: null,
              updated_at: null
            },
            agency: {
              id: agencyData.agency_id,
              name: agencyData.agency_name,
              subscription_plan: 'trial',
              trial_ends_at: null
            },
            status: 'ready',
            isLoading: false
          });
          return;
          
        } catch (autoFixError) {
          console.error('Failed to auto-create agency association:', autoFixError);
          
          // Fallback to no_agency status
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
      }

      const teamMember = teamMembers[0]; // Pegar o primeiro (mais recente) registro
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
      console.error(`❌ LoadCompleteUserData #${executionId} erro:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        status: 'error',
        user: user as User
      }));
    } finally {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      clearTimeout(timeoutId);
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      loadingRef.current = false;
      
      console.log(`🏁 LoadCompleteUserData #${executionId} finalizado:`, {
        duration: `${duration}ms`,
        finalStatus: stateRef.current.status,
        hasUser: !!stateRef.current.user,
        isLoading: stateRef.current.isLoading
      });
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
            agencyId: session.user?.user_metadata?.agency_id,
            currentState: stateRef.current.status,
            loadingRefActive: loadingRef.current
          });
          
          try {
            // Verificar se precisa forçar execução
            const shouldForce = stateRef.current.status === 'loading' && loadingRef.current;
            if (shouldForce) {
              console.log('🔥 MAIN LISTENER: Estado travado detectado, forçando execução');
            }
            
            await loadCompleteUserData(session.user, shouldForce);
            console.log('✅ MAIN LISTENER: LoadCompleteUserData call completed');
          } catch (error) {
            console.error('❌ MAIN LISTENER: Error in loadCompleteUserData:', error);
            // Em caso de erro, tentar recuperação após 2 segundos
            setTimeout(() => {
              console.log('🔄 MAIN LISTENER: Tentando recuperação após erro');
              forceRecovery();
            }, 2000);
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

  // Sistema de fallback inteligente
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 10; // Máximo 10 tentativas
    
    // Ativar fallback se estado estiver loading por muito tempo
    timeoutId = setTimeout(() => {
      const currentState = stateRef.current;
      
      if (currentState.isLoading && !currentState.user) {
        console.log('⚠️ SMART FALLBACK: Estado loading detectado, iniciando polling inteligente');
        
        const smartPoll = async () => {
          pollCount++;
          console.log(`🔄 SMART FALLBACK: Poll #${pollCount}/${maxPolls}`);
          
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('❌ SMART FALLBACK: Erro ao verificar sessão:', error);
              return;
            }
            
            if (session?.user) {
              console.log('🎯 SMART FALLBACK: Sessão detectada, usando força de recuperação');
              
              // Parar polling imediatamente
              if (pollInterval) {
                clearInterval(pollInterval);
                console.log('⏹️ SMART FALLBACK: Polling interrompido');
              }
              
              // Usar sistema de recuperação forçada
              await forceRecovery();
              
            } else if (pollCount >= maxPolls) {
              console.log('❌ SMART FALLBACK: Máximo de tentativas atingido, parando polling');
              if (pollInterval) {
                clearInterval(pollInterval);
              }
              
              // Definir estado como erro após esgotar tentativas
              setState(prev => ({
                ...prev,
                isLoading: false,
                status: 'error'
              }));
            }
          } catch (error) {
            console.error('💥 SMART FALLBACK: Exceção durante polling:', error);
            
            if (pollCount >= maxPolls) {
              if (pollInterval) {
                clearInterval(pollInterval);
              }
            }
          }
        };
        
        // Iniciar polling a cada 2 segundos (mais agressivo)
        pollInterval = setInterval(smartPoll, 2000);
        console.log('🔄 SMART FALLBACK: Polling iniciado (2s interval)');
        
        // Executar primeira verificação imediatamente
        smartPoll();
        
        // Parar polling após 25 segundos como segurança
        setTimeout(() => {
          if (pollInterval) {
            clearInterval(pollInterval);
            console.log('⏰ SMART FALLBACK: Polling interrompido por timeout de segurança (25s)');
          }
        }, 25000);
      }
    }, 3000); // Aguardar apenas 3 segundos antes de ativar fallback
    
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