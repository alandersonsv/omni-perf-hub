import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface User extends SupabaseUser {
  user_metadata: {
    agency_id?: string;
    name?: string;
    role?: 'owner' | 'admin' | 'analyst' | 'client';
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        if (session?.user) {
          await loadUserWithAgencyData(session.user);
        }
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserWithAgencyData(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserWithAgencyData = async (supabaseUser: SupabaseUser, retryCount = 0) => {
    try {
      // Get team member data to find agency_id and role
      const { data: teamMember, error } = await supabase
        .from('team_members')
        .select('agency_id, role')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.warn('User not found in team_members table:', error.message);
        console.log('User metadata:', supabaseUser.user_metadata);
        
        // Check if user has agency data in user_metadata from registration
        if (supabaseUser.user_metadata?.agency_name) {
          console.log('Attempting to auto-associate user with existing agency...');
          // This is likely a newly registered user, try to find their agency
          const { data: agency } = await supabase
            .from('agencies')
            .select('id')
            .eq('email', supabaseUser.email || supabaseUser.user_metadata?.agency_email || supabaseUser.email)
            .single();
            
          if (agency) {
            // Create team_member entry for this user
            const { error: insertError } = await supabase
              .from('team_members')
              .insert({
                id: supabaseUser.id,
                agency_id: agency.id,
                email: supabaseUser.email!,
                role: 'owner',
                accepted_at: new Date().toISOString()
              });
              
            if (!insertError) {
              // Recursively call to load the newly created team member data (with retry limit)
              if (retryCount < 2) {
                await loadUserWithAgencyData(supabaseUser, retryCount + 1);
                return;
              } else {
                console.warn('Max retry attempts reached for loadUserWithAgencyData');
              }
            }
          }
        } else {
          console.log('User has no agency_name in metadata - this is an orphaned user');
        }
        
        // User exists in auth but not properly set up - set user without agency data
        console.log('Setting user without agency data - will redirect to setup page');
        const userWithoutAgency: User = {
          ...supabaseUser,
          user_metadata: {
            ...supabaseUser.user_metadata,
            agency_id: undefined,
            role: undefined
          }
        };
        setUser(userWithoutAgency);
        return;
      }

      // Enhance user object with agency data
      const enhancedUser: User = {
        ...supabaseUser,
        user_metadata: {
          ...supabaseUser.user_metadata,
          agency_id: teamMember.agency_id,
          role: teamMember.role
        }
      };

      setUser(enhancedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(supabaseUser as User);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await loadUserWithAgencyData(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
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