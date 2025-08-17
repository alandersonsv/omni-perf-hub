import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseOAuthFlowReturn {
  initiateConnection: (provider: 'google' | 'meta' | 'woocommerce') => Promise<void>;
  handleCallback: (code: string, state: string, provider: string) => Promise<boolean>;
  refreshToken: (integrationId: string) => Promise<boolean>;
  isConnecting: boolean;
  error: string | null;
}

export function useOAuthFlow(): UseOAuthFlowReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Gera um estado CSRF para proteger contra ataques
  const generateState = () => {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, x => x.toString(16).padStart(8, '0')).join('');
  };

  // Inicia o fluxo de conexão OAuth
  const initiateConnection = async (provider: 'google' | 'meta' | 'woocommerce') => {
    try {
      setIsConnecting(true);
      setError(null);

      // Validar credenciais antes de iniciar OAuth
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const metaAppId = import.meta.env.VITE_META_APP_ID;
      
      if (provider === 'google' && (!googleClientId || googleClientId === 'your_actual_google_client_id_here')) {
        throw new Error('Serviço do Google temporariamente indisponível. Tente novamente em alguns minutos.');
      }
      
      if (provider === 'meta' && (!metaAppId || metaAppId === 'your_actual_meta_app_id_here')) {
        throw new Error('Serviço do Meta temporariamente indisponível. Tente novamente em alguns minutos.');
      }

      // Gerar estado CSRF
      const state = generateState();
      
      // Armazenar estado no localStorage para validação posterior
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_provider', provider);

      // Configurar URLs de OAuth para diferentes provedores
      const oauthUrls = {
        google: `https://accounts.google.com/o/oauth2/auth?
          client_id=${googleClientId}
          &redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}
          &response_type=code
          &scope=${encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly')}
          &access_type=offline
          &state=${state}
          &prompt=consent`.replace(/\s+/g, ''),
        
        meta: `https://www.facebook.com/v18.0/dialog/oauth?
          client_id=${metaAppId}
          &redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}
          &state=${state}
          &scope=ads_management,ads_read`.replace(/\s+/g, ''),
        
        woocommerce: '/dashboard/integrations/woocommerce' // WooCommerce usa um fluxo diferente (não OAuth)
      };

      // Verificar se popups estão habilitados
      const testPopup = window.open('', 'test', 'width=1,height=1');
      if (!testPopup) {
        throw new Error('Popups estão bloqueados pelo navegador. Por favor, permita popups para este site e tente novamente.');
      }
      testPopup.close();

      // Abrir popup para autenticação
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      
      const popup = window.open(
        oauthUrls[provider],
        `oauth-${provider}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Não foi possível abrir a janela de autenticação. Verifique se os popups estão habilitados.');
      }

      // Configurar listener para mensagem de callback
      const messageListener = (event: MessageEvent) => {
        // Verificar origem da mensagem para segurança
        if (event.origin !== window.location.origin) return;
        
        // Verificar se a mensagem é do tipo oauth_callback
        if (event.data?.type === 'oauth_callback') {
          const { code, state: returnedState, error: oauthError } = event.data;
          
          // Remover o listener
          window.removeEventListener('message', messageListener);
          
          // Fechar o popup
          if (popup && !popup.closed) {
            popup.close();
          }
          
          if (oauthError) {
            setError(oauthError);
            toast({
              title: 'Erro na autenticação',
              description: oauthError,
              variant: 'destructive',
            });
          } else if (code && returnedState) {
            // Processar o callback
            handleCallback(code, returnedState, provider);
          }
        }
      };

      window.addEventListener('message', messageListener);

      // Configurar um timer para verificar se o popup foi fechado
      const checkPopupClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', messageListener);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar conexão OAuth:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao iniciar conexão');
      toast({
        title: 'Erro ao iniciar conexão',
        description: error instanceof Error ? error.message : 'Erro desconhecido ao iniciar conexão',
        variant: 'destructive',
      });
    } finally {
      // Não definimos setIsConnecting(false) aqui porque queremos manter o estado até que o popup seja fechado
    }
  };

  // Processa o callback do OAuth
  const handleCallback = async (code: string, state: string, provider: string): Promise<boolean> => {
    try {
      // Verificar o estado CSRF
      const storedState = localStorage.getItem('oauth_state');
      const storedProvider = localStorage.getItem('oauth_provider');
      
      if (state !== storedState) {
        throw new Error('Estado inválido. Possível ataque CSRF.');
      }

      if (provider !== storedProvider) {
        throw new Error('Provedor inválido.');
      }

      // Limpar o estado do localStorage
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_provider');

      // Enviar o código para o backend para troca por tokens
      // Na implementação real, você enviaria para sua API
      // Exemplo: const response = await fetch('/api/oauth/callback', { method: 'POST', body: JSON.stringify({ code, provider }) });
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar o banco de dados com a nova integração
      // Exemplo:
      // await supabase.from('integrations').upsert({
      //   platform: provider,
      //   connection_status: 'connected',
      //   credentials: { access_token, refresh_token },
      //   last_sync: new Date().toISOString(),
      // });

      toast({
        title: 'Conexão bem-sucedida',
        description: `${provider} conectado com sucesso!`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao processar callback OAuth:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao processar callback');
      toast({
        title: 'Erro na conexão',
        description: error instanceof Error ? error.message : 'Erro desconhecido ao processar callback',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Atualiza o token de acesso usando o refresh token
  const refreshToken = async (integrationId: string): Promise<boolean> => {
    try {
      // Buscar a integração no banco de dados
      const { data: integration, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (error) throw error;
      if (!integration) throw new Error('Integração não encontrada');

      // Extrair o refresh token
      const refreshToken = integration.credentials?.refresh_token;
      if (!refreshToken) throw new Error('Refresh token não encontrado');

      // Enviar o refresh token para o backend para obter um novo access token
      // Na implementação real, você enviaria para sua API
      // Exemplo: const response = await fetch('/api/oauth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken, provider: integration.platform }) });
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o banco de dados com o novo token
      // Exemplo:
      // await supabase.from('integrations').update({
      //   credentials: { ...integration.credentials, access_token: newAccessToken },
      // }).eq('id', integrationId);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao atualizar token');
      toast({
        title: 'Erro ao atualizar token',
        description: 'Não foi possível atualizar o token de acesso. Tente reconectar a integração.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    initiateConnection,
    handleCallback,
    refreshToken,
    isConnecting,
    error,
  };
}