import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Bell, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  alert_type: 'low_budget' | 'account_blocked' | 'api_error' | 'performance_drop';
  threshold_value?: number;
  platforms: string[];
  notify_time: string;
  is_active: boolean;
  webhook_url?: string;
}

const alertTypes = [
  { value: 'low_budget', label: 'Saldo Baixo', icon: DollarSign },
  { value: 'account_blocked', label: 'Conta Bloqueada', icon: AlertTriangle },
  { value: 'api_error', label: 'Erro de API', icon: Zap },
  { value: 'performance_drop', label: 'Queda de Performance', icon: Bell },
];

const platforms = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'ga4', label: 'Google Analytics' },
  { value: 'search_console', label: 'Search Console' },
];

export function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    alert_type: '',
    threshold_value: '',
    platforms: [] as string[],
    notify_time: '09:00',
    webhook_url: '',
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setAlerts([
      {
        id: '1',
        alert_type: 'low_budget',
        threshold_value: 100,
        platforms: ['meta_ads', 'google_ads'],
        notify_time: '09:00',
        is_active: true,
        webhook_url: '',
      },
      {
        id: '2',
        alert_type: 'account_blocked',
        platforms: ['meta_ads'],
        notify_time: '08:00',
        is_active: false,
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newAlert: Alert = {
        id: Math.random().toString(36).substr(2, 9),
        alert_type: formData.alert_type as Alert['alert_type'],
        threshold_value: formData.threshold_value ? Number(formData.threshold_value) : undefined,
        platforms: formData.platforms,
        notify_time: formData.notify_time,
        is_active: false,
        webhook_url: formData.webhook_url || undefined,
      };

      setAlerts(prev => [...prev, newAlert]);
      setIsDialogOpen(false);
      setFormData({
        alert_type: '',
        threshold_value: '',
        platforms: [],
        notify_time: '09:00',
        webhook_url: '',
      });

      toast({
        title: "Alerta criado",
        description: "O alerta foi configurado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o alerta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      // Call webhook when activating/deactivating
      if (alert.webhook_url) {
        await fetch(alert.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: alert.is_active ? 'deactivate' : 'activate',
            alert_type: alert.alert_type,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_active: !a.is_active } : a
      ));

      toast({
        title: alert.is_active ? "Alerta desativado" : "Alerta ativado",
        description: `O alerta foi ${alert.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do alerta.",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({
      title: "Alerta removido",
      description: "O alerta foi removido com sucesso.",
    });
  };

  const getAlertTypeInfo = (type: string) => {
    return alertTypes.find(t => t.value === type) || alertTypes[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alertas</h2>
          <p className="text-muted-foreground">
            Configure alertas automáticos para monitorar suas campanhas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Alerta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Alerta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert_type">Tipo de Alerta</Label>
                <Select
                  value={formData.alert_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, alert_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.alert_type === 'low_budget' || formData.alert_type === 'performance_drop') && (
                <div className="space-y-2">
                  <Label htmlFor="threshold_value">
                    {formData.alert_type === 'low_budget' ? 'Valor Limite (R$)' : 'Limite de Queda (%)'}
                  </Label>
                  <Input
                    id="threshold_value"
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold_value: e.target.value }))}
                    placeholder={formData.alert_type === 'low_budget' ? '100' : '20'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Plataformas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={platform.value}
                        checked={formData.platforms.includes(platform.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              platforms: [...prev.platforms, platform.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              platforms: prev.platforms.filter(p => p !== platform.value)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={platform.value} className="text-sm">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notify_time">Horário de Notificação</Label>
                <Input
                  id="notify_time"
                  type="time"
                  value={formData.notify_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, notify_time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL (Opcional)</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://webhook.exemplo.com/alerta"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading || !formData.alert_type || formData.platforms.length === 0}>
                  {isLoading ? "Criando..." : "Criar Alerta"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => {
          const typeInfo = getAlertTypeInfo(alert.alert_type);
          const Icon = typeInfo.icon;
          
          return (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{typeInfo.label}</h3>
                    </div>
                    
                    <div className="flex gap-2">
                      {alert.platforms.map(platform => (
                        <Badge key={platform} variant="secondary">
                          {platforms.find(p => p.value === platform)?.label}
                        </Badge>
                      ))}
                    </div>

                    {alert.threshold_value && (
                      <Badge variant="outline">
                        {alert.alert_type === 'low_budget' ? `R$ ${alert.threshold_value}` : `${alert.threshold_value}%`}
                      </Badge>
                    )}

                    <Badge variant="outline">
                      {alert.notify_time}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {alert.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {alerts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum alerta configurado</h3>
              <p className="text-muted-foreground mb-4">
                Crie alertas para monitorar suas campanhas automaticamente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}