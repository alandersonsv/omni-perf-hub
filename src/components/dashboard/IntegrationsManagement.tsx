import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Facebook, 
  Chrome, 
  BarChart3, 
  Search, 
  MessageCircle, 
  QrCode,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthPopup } from '@/hooks/useOAuthPopup';
import { OAuthDiagnostic } from '@/components/OAuthDiagnostic';

interface Integration {
  id: string;
  platform: 'meta_ads' | 'google_ads' | 'ga4' | 'search_console';
  account_id: string;
  is_active: boolean;
  last_sync?: string;
  status: 'connected' | 'error' | 'pending';
}

// Type for data coming from Supabase
interface SupabaseIntegration {
  id: string;
  platform: 'meta_ads' | 'google_ads' | 'ga4' | 'search_console';
  account_id: string;
  is_active: boolean;
  last_sync?: string;
  credentials?: any;
  agency_id: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppConnection {
  id: string;
  phone_number: string;
  status: 'disconnected' | 'pending' | 'connected';
  qr_code?: string;
}

const integrationPlatforms = [
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    icon: Facebook,
    description: 'Conecte suas contas do Facebook e Instagram Ads',
    color: 'bg-blue-500',
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    icon: Chrome,
    description: 'Importe dados das suas campanhas do Google Ads',
    color: 'bg-yellow-500',
  },
  {
    id: 'ga4',
    name: 'Google Analytics',
    icon: BarChart3,
    description: 'Acesse métricas do Google Analytics 4',
    color: 'bg-orange-500',
  },
  {
    id: 'search_console',
    name: 'Search Console',
    icon: Search,
    description: 'Monitore performance de SEO',
    color: 'bg-green-500',
  },
];

export function IntegrationsManagement() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [whatsappConnection, setWhatsappConnection] = useState<WhatsAppConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const { initiateConnection, handleCallback, refreshToken, isConnecting: isOAuthConnecting, error: oauthError } = useOAuthFlow();
  const { openPopup, closePopup, isOpen: isPopupOpen } = useOAuthPopup();

  // Function to map Supabase data to Integration type
  const mapSupabaseToIntegration = (supabaseData: SupabaseIntegration): Integration => {
    // Derive status based on available data
    let status: 'connected' | 'error' | 'pending' = 'pending';
    
    if (supabaseData.credentials && supabaseData.is_active) {
      status = 'connected';
    } else if (supabaseData.credentials && !supabaseData.is_active) {
      status = 'error';
    }
    
    return {
      id: supabaseData.id,
      platform: supabaseData.platform,
      account_id: supabaseData.account_id,
      is_active: supabaseData.is_active,
      last_sync: supabaseData.last_sync,
      status
    };
  };

  useEffect(() => {
    // Carregar integrações do Supabase
    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*');
        
        if (error) {
          // Verificar se é erro de RLS (recursão infinita)
          if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
            console.warn('Erro de RLS detectado, usando dados mock temporariamente:', error);
            toast({
              title: 'Aviso: Usando dados de demonstração',
              description: 'Há um problema com as políticas de segurança do banco. Contate o administrador.',
              variant: 'default',
            });
            // Usar dados mock como fallback
            setIntegrations([]);
            return;
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map Supabase data to Integration type with proper status derivation
          const mappedIntegrations = data.map((item: SupabaseIntegration) => 
            mapSupabaseToIntegration(item)
          );
          setIntegrations(mappedIntegrations);
        }
      } catch (error) {
        console.error('Erro ao carregar integrações:', error);
        
        // Verificar se é erro de conectividade ou configuração
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
          toast({
            title: 'Erro de conectividade',
            description: 'Verifique sua conexão com a internet e as configurações do Supabase.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao carregar integrações',
            description: 'Não foi possível carregar suas integrações. Verifique as configurações.',
            variant: 'destructive',
          });
        }
        
        // Usar dados vazios como fallback
        setIntegrations([]);
      }
    };

    fetchIntegrations();

    // Carregar conexão do WhatsApp (exemplo)
    setWhatsappConnection({
      id: '1',
      phone_number: '+5511999999999',
      status: 'connected',
    });
  }, [toast]);

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId);

    try {
      // Mapear plataforma para o provedor OAuth correto
      let provider: 'google' | 'meta' | 'woocommerce';
      
      if (platformId === 'google_ads' || platformId === 'ga4' || platformId === 'search_console') {
        provider = 'google';
      } else if (platformId === 'meta_ads') {
        provider = 'meta';
      } else {
        provider = 'woocommerce';
      }
      
      // Iniciar o fluxo OAuth
      await initiateConnection(provider);
      
      // O restante do fluxo será tratado pelo callback OAuth
      toast({
        title: "Iniciando conexão",
        description: `Conectando com ${integrationPlatforms.find(p => p.id === platformId)?.name}...`,
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : "Não foi possível conectar a integração.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    try {
      // Remover a integração do banco de dados
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);
      
      if (error) throw error;

      // Atualizar o estado local
      setIntegrations(prev => prev.filter(i => i.id !== integrationId));

      toast({
        title: "Integração desconectada",
        description: `${integrationPlatforms.find(p => p.id === integration.platform)?.name} foi desconectado.`,
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar a integração.",
        variant: "destructive",
      });
    }
  };

  const toggleIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, is_active: !i.is_active } : i
    ));
  };

  const connectWhatsApp = async () => {
    setIsConnecting('whatsapp');
    
    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWhatsappConnection({
        id: '1',
        phone_number: '',
        status: 'pending',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      });
      setShowQRCode(true);
      
      // Simulate successful connection after QR scan
      setTimeout(() => {
        setWhatsappConnection(prev => prev ? {
          ...prev,
          phone_number: '+5511999999999',
          status: 'connected',
          qr_code: undefined,
        } : null);
        setShowQRCode(false);
        toast({
          title: "WhatsApp conectado",
          description: "Seu WhatsApp foi conectado com sucesso.",
        });
      }, 5000);
      
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar o WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="apis" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="apis" className="text-xs sm:text-sm flex-1 sm:flex-initial">APIs de Marketing</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs sm:text-sm flex-1 sm:flex-initial">WhatsApp</TabsTrigger>
          <TabsTrigger value="diagnostic" className="text-xs sm:text-sm flex-1 sm:flex-initial">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {integrationPlatforms.map((platform) => {
              const integration = integrations.find(i => i.platform === platform.id);
              const Icon = platform.icon;
              const isConnectingPlatform = isConnecting === platform.id;

              return (
                <Card key={platform.id}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${platform.color}`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{platform.name}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {platform.description}
                          </p>
                        </div>
                      </div>
                      {integration && getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 py-3 sm:p-6">
                    {integration ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                          <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                            {getStatusText(integration.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">Conta:</span>
                          <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{integration.account_id}</span>
                        </div>

                        {integration.last_sync && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">Última sincronização:</span>
                            <span className="text-xs sm:text-sm">
                              {new Date(integration.last_sync).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={integration.is_active}
                              onCheckedChange={() => toggleIntegration(integration.id)}
                            />
                            <span className="text-xs sm:text-sm">Ativo</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                            className="text-xs h-8 w-full sm:w-auto"
                          >
                            <span className="sm:inline hidden">Desconectar</span>
                            <span className="sm:hidden inline">Descon</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full text-xs sm:text-sm h-8 sm:h-10"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnectingPlatform}
                      >
                        {isConnectingPlatform ? (
                          <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          `Conectar ${platform.name}`
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">WhatsApp Business</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Conecte seu WhatsApp para enviar relatórios automáticos
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 py-3 sm:p-6">
              {whatsappConnection?.status === 'connected' ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                    <Badge className="bg-green-500 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Número:</span>
                    <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{whatsappConnection.phone_number}</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWhatsappConnection(null)}
                      className="text-xs h-8"
                    >
                      <span className="sm:inline hidden">Desconectar</span>
                      <span className="sm:hidden inline">Descon</span>
                    </Button>
                  </div>
                </div>
              ) : whatsappConnection?.status === 'pending' ? (
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Aguardando leitura do QR Code...</span>
                  </div>
                  
                  <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                    <DialogContent className="sm:max-w-md max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle className="text-center text-base sm:text-lg">Escaneie o QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="text-center space-y-3 sm:space-y-4">
                        <div className="flex justify-center">
                          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Abra o WhatsApp no seu celular, vá em Dispositivos Vinculados e escaneie este QR Code
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Button
                  className="w-full text-xs sm:text-sm h-8 sm:h-10"
                  onClick={connectWhatsApp}
                  disabled={isConnecting === 'whatsapp'}
                >
                  {isConnecting === 'whatsapp' ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      Gerando QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Conectar WhatsApp
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-4 sm:space-y-6">
          <OAuthDiagnostic />
        </TabsContent>
      </Tabs>
    </div>
  );
}