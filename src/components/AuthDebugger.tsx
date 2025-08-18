import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  event: string;
  data: any;
  status: 'info' | 'success' | 'error' | 'warning';
}

export const AuthDebugger: React.FC = () => {
  const { state } = useAuth();
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: 'alandersonverissimo@gmail.com',
    password: ''
  });

  const addLog = (event: string, data: any, status: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      event,
      data,
      status
    };
    setLogs(prev => [log, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const clearLogs = () => setLogs([]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    addLog('Monitoring Started', { message: 'Auth debugging initiated' }, 'info');

    // Monitor Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog('Auth State Change', {
        event,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        } : null,
        session: session ? {
          access_token: session.access_token ? 'present' : 'missing',
          refresh_token: session.refresh_token ? 'present' : 'missing',
          expires_at: session.expires_at
        } : null
      }, event === 'SIGNED_IN' ? 'success' : event === 'SIGNED_OUT' ? 'warning' : 'info');
    });

    // Monitor fetch requests to auth endpoints
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      if (typeof url === 'string' && url.includes('auth')) {
        addLog('Auth Request', {
          url,
          method: options?.method || 'GET',
          headers: options?.headers
        }, 'info');
      }
      
      try {
        const response = await originalFetch(...args);
        if (typeof url === 'string' && url.includes('auth')) {
          const responseData = response.clone();
          try {
            const body = await responseData.json();
            addLog('Auth Response', {
              url,
              status: response.status,
              ok: response.ok,
              body
            }, response.ok ? 'success' : 'error');
          } catch {
            addLog('Auth Response', {
              url,
              status: response.status,
              ok: response.ok,
              body: 'Non-JSON response'
            }, response.ok ? 'success' : 'error');
          }
        }
        return response;
      } catch (error) {
        if (typeof url === 'string' && url.includes('auth')) {
          addLog('Auth Request Error', {
            url,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 'error');
        }
        throw error;
      }
    };

    return () => {
      subscription.unsubscribe();
      window.fetch = originalFetch;
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    addLog('Monitoring Stopped', { message: 'Auth debugging stopped' }, 'warning');
  };

  const testLogin = async () => {
    if (!testCredentials.password) {
      addLog('Test Login Failed', { error: 'Password required' }, 'error');
      return;
    }

    addLog('Test Login Started', testCredentials, 'info');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password
      });

      if (error) {
        addLog('Test Login Error', {
          error: error.message,
          code: error.status,
          details: error
        }, 'error');
      } else {
        addLog('Test Login Success', {
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
        }, 'success');
      }
    } catch (error) {
      addLog('Test Login Exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, 'error');
    }
  };

  const checkCurrentSession = async () => {
    addLog('Session Check Started', {}, 'info');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog('Session Check Error', { error: error.message }, 'error');
      } else {
        addLog('Session Check Result', {
          hasSession: !!session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          } : null
        }, session ? 'success' : 'warning');
      }
    } catch (error) {
      addLog('Session Check Exception', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
    }
  };

  const checkUserData = async () => {
    if (!state.user) {
      addLog('User Data Check', { error: 'No user in state' }, 'warning');
      return;
    }

    addLog('User Data Check Started', { userId: state.user.id }, 'info');
    
    try {
      // Check team_members
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', state.user.id)
        .single();

      if (teamError) {
        addLog('Team Member Check', { error: teamError.message }, 'error');
      } else {
        addLog('Team Member Found', teamMember, 'success');
      }

      // Check agencies if team member exists
      if (teamMember?.agency_id) {
        const { data: agency, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', teamMember.agency_id)
          .single();

        if (agencyError) {
          addLog('Agency Check', { error: agencyError.message }, 'error');
        } else {
          addLog('Agency Found', agency, 'success');
        }
      }
    } catch (error) {
      addLog('User Data Check Exception', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
    }
  };

  const getStatusIcon = (status: DebugLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: DebugLog['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    addLog('Auth State Update', {
      status: state.status,
      isLoading: state.isLoading,
      hasUser: !!state.user,
      hasAgency: !!state.agency,
      userEmail: state.user?.email
    }, 'info');
  }, [state]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Auth Debugger</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded">
            <div className="text-sm font-medium">Status</div>
            <div className="text-lg">{state.status}</div>
          </div>
          <div className="p-3 border rounded">
            <div className="text-sm font-medium">Loading</div>
            <div className="text-lg">{state.isLoading ? 'Yes' : 'No'}</div>
          </div>
          <div className="p-3 border rounded">
            <div className="text-sm font-medium">User</div>
            <div className="text-lg">{state.user ? 'Present' : 'None'}</div>
          </div>
          <div className="p-3 border rounded">
            <div className="text-sm font-medium">Agency</div>
            <div className="text-lg">{state.agency ? 'Present' : 'None'}</div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkCurrentSession} size="sm" variant="outline">
            Check Session
          </Button>
          <Button onClick={checkUserData} size="sm" variant="outline">
            Check User Data
          </Button>
          <div className="flex gap-2 items-center">
            <input
              type="password"
              placeholder="Password for test login"
              value={testCredentials.password}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="px-2 py-1 border rounded text-sm"
            />
            <Button onClick={testLogin} size="sm" variant="outline">
              Test Login
            </Button>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="text-sm font-medium">Debug Logs ({logs.length})</div>
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded text-sm">
              {getStatusIcon(log.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{log.event}</span>
                  {getStatusBadge(log.status)}
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;