import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Integration {
  id: string;
  name: 'Google Ads' | 'Meta Ads' | 'Google Analytics' | 'Search Console' | 'WooCommerce';
  status: 'connected' | 'disconnected' | 'error' | 'connecting' | 'pending';
  logo: string;
  description: string;
  lastSync?: Date;
  accountInfo?: {
    accountId: string;
    accountName: string;
    currency?: string;
    propertyName?: string; // Para Google Analytics e Search Console
    propertyId?: string;   // Para Google Analytics e Search Console
  };
}

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isLoading: boolean;
  isSyncing?: boolean;
}

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
  isLoading,
  isSyncing = false,
}: IntegrationCardProps) {
  const [isActive, setIsActive] = useState(integration.status === 'connected');

  const handleToggleActive = () => {
    setIsActive(!isActive);
    // Aqui você pode implementar a lógica para ativar/desativar a integração
  };

  const getStatusIcon = () => {
    switch (integration.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'connecting':
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (integration.status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro';
      case 'connecting':
        return 'Conectando...';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (integration.status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${getStatusColor()}`}>
              <img src={integration.logo} alt={integration.name} className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">{integration.name}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {integration.description}
              </p>
            </div>
          </div>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 py-3 sm:p-6">
        {integration.status === 'connected' ? (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
              <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
            
            {integration.accountInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Conta:</span>
                  <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{integration.accountInfo.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">ID da Conta:</span>
                  <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{integration.accountInfo.accountId}</span>
                </div>
                {integration.accountInfo.propertyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Propriedade:</span>
                    <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{integration.accountInfo.propertyName}</span>
                  </div>
                )}
                {integration.accountInfo.currency && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Moeda:</span>
                    <span className="text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">{integration.accountInfo.currency}</span>
                  </div>
                )}
              </>
            )}

            {integration.lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Última sincronização:</span>
                <span className="text-xs sm:text-sm">
                  {integration.lastSync.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleActive}
                />
                <span className="text-xs sm:text-sm">Ativo</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={isSyncing}
                  className="text-xs h-8 flex-1 sm:flex-initial"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      <span className="sm:inline hidden">Sincronizando...</span>
                      <span className="sm:hidden inline">Sincr...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      <span className="sm:inline hidden">Sincronizar</span>
                      <span className="sm:hidden inline">Sincr</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  className="text-xs h-8 flex-1 sm:flex-initial"
                >
                  <span className="sm:inline hidden">Desconectar</span>
                  <span className="sm:hidden inline">Descon</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            className="w-full text-xs sm:text-sm h-8 sm:h-10"
            onClick={onConnect}
            disabled={isLoading || integration.status === 'connecting'}
          >
            {isLoading || integration.status === 'connecting' ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              `Conectar ${integration.name}`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}