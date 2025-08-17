import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Integration } from '@/components/IntegrationCard';

interface UseIntegrationsReturn {
  integrations: Integration[];
  loading: boolean;
  loadingStates: Record<string, boolean>;
  syncingStates: Record<string, boolean>;
  connectIntegration: (provider: string) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
  syncIntegration: (id: string) => Promise<void>;
  syncAllIntegrations: () => Promise<void>;
}

const PLATFORM_LOGOS = {
  'Google Ads': '/logos/google-ads.svg',
  'Meta Ads': '/logos/meta-ads.svg',
  'Google Analytics': '/logos/ga4.svg',
  'Search Console': '/logos/search-console.svg',
  'WooCommerce': '/logos/woocommerce.svg',
};

const PLATFORM_DESCRIPTIONS = {
  'Google Ads': 'Conecte suas campanhas do Google Ads',
  'Meta Ads': 'Conecte suas campanhas do Facebook e Instagram',
  'Google Analytics': 'Conecte seus dados de analytics',
  'Search Console': 'Conecte seus dados de SEO',
  'WooCommerce': 'Conecte sua loja WooCommerce',
};

export function useIntegrations(): UseIntegrationsReturn {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [syncingStates, setSyncingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Buscar integrações do usuário no Supabase
      const { data: integrationsData, error } = await supabase
        .from('integrations')
        .select('*');

      if (error) throw error;

      // Transformar dados do Supabase para o formato da interface Integration
      const formattedIntegrations: Integration[] = integrationsData.map((integration) => ({
        id: integration.id,
        name: integration.platform as any,
        status: integration.connection_status || 'disconnected',
        logo: PLATFORM_LOGOS[integration.platform as keyof typeof PLATFORM_LOGOS] || '',
        description: PLATFORM_DESCRIPTIONS[integration.platform as keyof typeof PLATFORM_DESCRIPTIONS] || '',
        lastSync: integration.last_sync ? new Date(integration.last_sync) : undefined,
        accountInfo: integration.account_id ? {
          accountId: integration.account_id,
          accountName: integration.account_name || integration.account_id,
          currency: integration.currency,
        } : undefined,
      }));

      // Adicionar plataformas que ainda não foram conectadas
      const availablePlatforms = ['Google Ads', 'Meta Ads', 'Google Analytics', 'Search Console', 'WooCommerce'];
      const existingPlatforms = formattedIntegrations.map(i => i.name);
      
      const missingPlatforms = availablePlatforms.filter(p => !existingPlatforms.includes(p as any));
      
      const allIntegrations = [
        ...formattedIntegrations,
        ...missingPlatforms.map(platform => ({
          id: `new-${platform.toLowerCase().replace(' ', '-')}`,
          name: platform as any,
          status: 'disconnected' as const,
          logo: PLATFORM_LOGOS[platform as keyof typeof PLATFORM_LOGOS] || '',
          description: PLATFORM_DESCRIPTIONS[platform as keyof typeof PLATFORM_DESCRIPTIONS] || '',
        }))
      ];

      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
      toast({
        title: 'Erro ao carregar integrações',
        description: 'Não foi possível carregar suas integrações. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (provider: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [provider]: true }));
      
      // Aqui você implementaria a lógica para iniciar o fluxo OAuth
      // Isso seria feito usando o hook useOAuthFlow
      
      toast({
        title: 'Conectando...',
        description: `Iniciando conexão com ${provider}`,
      });
      
      // Simulação de conexão para demonstração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar o estado local após conexão bem-sucedida
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === provider || integration.name === provider
            ? { 
                ...integration, 
                status: 'connected',
                accountInfo: {
                  accountId: '123456789',
                  accountName: 'Conta Principal',
                  currency: 'BRL'
                },
                lastSync: new Date()
              }
            : integration
        )
      );
      
      toast({
        title: 'Conectado com sucesso!',
        description: `${provider} foi conectado com sucesso.`,
      });
    } catch (error) {
      console.error(`Erro ao conectar ${provider}:`, error);
      toast({
        title: 'Erro na conexão',
        description: `Não foi possível conectar ${provider}. Tente novamente.`,
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  const disconnectIntegration = async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [id]: true }));
      
      // Aqui você implementaria a lógica para desconectar a integração no backend
      // Exemplo: await supabase.from('integrations').update({ connection_status: 'disconnected' }).eq('id', id);
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o estado local após desconexão bem-sucedida
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id
            ? { 
                ...integration, 
                status: 'disconnected',
                accountInfo: undefined,
                lastSync: undefined
              }
            : integration
        )
      );
      
      toast({
        title: 'Desconectado',
        description: 'Integração desconectada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: 'Erro ao desconectar',
        description: 'Não foi possível desconectar a integração. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const syncIntegration = async (id: string) => {
    try {
      setSyncingStates(prev => ({ ...prev, [id]: true }));
      
      // Aqui você implementaria a lógica para sincronizar dados da integração
      // Exemplo: await fetch('/api/integrations/sync', { method: 'POST', body: JSON.stringify({ id }) });
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Atualizar o estado local após sincronização bem-sucedida
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id
            ? { ...integration, lastSync: new Date() }
            : integration
        )
      );
      
      toast({
        title: 'Sincronizado',
        description: 'Dados sincronizados com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSyncingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const syncAllIntegrations = async () => {
    const connectedIntegrations = integrations.filter(i => i.status === 'connected');
    
    if (connectedIntegrations.length === 0) {
      toast({
        title: 'Nenhuma integração conectada',
        description: 'Conecte pelo menos uma integração para sincronizar.',
      });
      return;
    }
    
    try {
      // Marcar todas as integrações conectadas como sincronizando
      const syncStates = {};
      connectedIntegrations.forEach(i => {
        syncStates[i.id] = true;
      });
      setSyncingStates(prev => ({ ...prev, ...syncStates }));
      
      // Aqui você implementaria a lógica para sincronizar todas as integrações
      // Exemplo: await fetch('/api/integrations/sync-all', { method: 'POST' });
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Atualizar o estado local após sincronização bem-sucedida
      const now = new Date();
      setIntegrations(prev => 
        prev.map(integration => 
          integration.status === 'connected'
            ? { ...integration, lastSync: now }
            : integration
        )
      );
      
      toast({
        title: 'Sincronização completa',
        description: `${connectedIntegrations.length} integrações sincronizadas com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao sincronizar todas as integrações:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar todas as integrações. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      // Desmarcar todas as integrações como sincronizando
      const syncStates = {};
      connectedIntegrations.forEach(i => {
        syncStates[i.id] = false;
      });
      setSyncingStates(prev => ({ ...prev, ...syncStates }));
    }
  };

  return {
    integrations,
    loading,
    loadingStates,
    syncingStates,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    syncAllIntegrations,
  };
}