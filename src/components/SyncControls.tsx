import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Integration } from '@/components/IntegrationCard';

interface SyncControlsProps {
  integrations: Integration[];
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  lastSyncDate?: Date;
}

export function SyncControls({
  integrations,
  onSyncAll,
  isSyncing,
  lastSyncDate,
}: SyncControlsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');
  const hasConnectedIntegrations = connectedIntegrations.length > 0;

  const handleSyncAll = async () => {
    if (!hasConnectedIntegrations) {
      toast({
        title: 'Nenhuma integração conectada',
        description: 'Conecte pelo menos uma integração para sincronizar.',
      });
      return;
    }

    if (isSyncing) {
      toast({
        title: 'Sincronização em andamento',
        description: 'Aguarde a sincronização atual terminar.',
      });
      return;
    }

    try {
      await onSyncAll();
    } catch (error) {
      console.error('Erro ao sincronizar todas as integrações:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar todas as integrações. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const formatLastSyncDate = (date?: Date) => {
    if (!date) return 'Nunca';

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
      <div className="text-center sm:text-left w-full sm:w-auto">
        <h3 className="text-xs sm:text-sm font-medium">Sincronização de Dados</h3>
        <p className="text-xs text-muted-foreground">
          {hasConnectedIntegrations
            ? `${connectedIntegrations.length} ${connectedIntegrations.length === 1 ? 'integração conectada' : 'integrações conectadas'}`
            : 'Nenhuma integração conectada'}
        </p>
        {lastSyncDate && (
          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Última sincronização: {formatLastSyncDate(lastSyncDate)}
          </p>
        )}
      </div>

      <Button
        onClick={handleSyncAll}
        disabled={isSyncing || !hasConnectedIntegrations}
        variant="default"
        size="sm"
        className="w-full sm:w-auto transition-all text-xs h-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isHovered ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar Todas as Integrações</span>
            <span className="sm:hidden">Sincronizar Tudo</span>
          </>
        )}
      </Button>
    </div>
  );
}