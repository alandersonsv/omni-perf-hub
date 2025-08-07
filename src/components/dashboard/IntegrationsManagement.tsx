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

interface Integration {
  id: string;
  platform: 'meta_ads' | 'google_ads' | 'ga4' | 'search_console';
  account_id: string;
  is_active: boolean;
  last_sync?: string;
  status: 'connected' | 'error' | 'pending';
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

  useEffect(() => {
    // Mock data - replace with actual API calls
    setIntegrations([
      {
        id: '1',
        platform: 'meta_ads',
        account_id: 'act_123456789',
        is_active: true,
        last_sync: '2024-01-20T10:30:00Z',
        status: 'connected',
      },
      {
        id: '2',
        platform: 'google_ads',
        account_id: '987-654-3210',
        is_active: false,
        last_sync: '2024-01-19T15:45:00Z',
        status: 'error',
      },
    ]);

    setWhatsappConnection({
      id: '1',
      phone_number: '+5511999999999',
      status: 'connected',
    });
  }, []);

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newIntegration: Integration = {
        id: Math.random().toString(36).substr(2, 9),
        platform: platformId as Integration['platform'],
        account_id: `acc_${Math.random().toString(36).substr(2, 9)}`,
        is_active: true,
        last_sync: new Date().toISOString(),
        status: 'connected',
      };

      setIntegrations(prev => {
        const filtered = prev.filter(i => i.platform !== platformId);
        return [...filtered, newIntegration];
      });

      toast({
        title: "Integração conectada",
        description: `${integrationPlatforms.find(p => p.id === platformId)?.name} foi conectado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar a integração.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIntegrations(prev => prev.filter(i => i.id !== integrationId));

    toast({
      title: "Integração desconectada",
      description: `${integrationPlatforms.find(p => p.id === integration.platform)?.name} foi desconectado.`,
    });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrações</h2>
        <p className="text-muted-foreground">
          Conecte suas contas para automatizar a coleta de dados
        </p>
      </div>

      <Tabs defaultValue="apis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apis">APIs de Marketing</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {integrationPlatforms.map((platform) => {
              const integration = integrations.find(i => i.platform === platform.id);
              const Icon = platform.icon;
              const isConnectingPlatform = isConnecting === platform.id;

              return (
                <Card key={platform.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {platform.description}
                          </p>
                        </div>
                      </div>
                      {integration && getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {integration ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'}>
                            {getStatusText(integration.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Conta:</span>
                          <span className="text-sm font-mono">{integration.account_id}</span>
                        </div>

                        {integration.last_sync && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Última sincronização:</span>
                            <span className="text-sm">
                              {new Date(integration.last_sync).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={integration.is_active}
                              onCheckedChange={() => toggleIntegration(integration.id)}
                            />
                            <span className="text-sm">Ativo</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Desconectar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnectingPlatform}
                      >
                        {isConnectingPlatform ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>WhatsApp Business</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Conecte seu WhatsApp para enviar relatórios automáticos
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {whatsappConnection?.status === 'connected' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Número:</span>
                    <span className="text-sm font-mono">{whatsappConnection.phone_number}</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setWhatsappConnection(null)}
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : whatsappConnection?.status === 'pending' ? (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Aguardando leitura do QR Code...</span>
                  </div>
                  
                  <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center">Escaneie o QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Abra o WhatsApp no seu celular, vá em Dispositivos Vinculados e escaneie este QR Code
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={connectWhatsApp}
                  disabled={isConnecting === 'whatsapp'}
                >
                  {isConnecting === 'whatsapp' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
      </Tabs>
    </div>
  );
}