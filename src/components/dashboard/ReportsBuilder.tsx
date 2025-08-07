import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  MessageSquare, 
  BarChart3,
  Edit,
  Play,
  Pause
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  metrics: string[];
  message_template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  send_time: string;
  send_days: number[];
  is_active: boolean;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  whatsapp_number?: string;
}

const availableMetrics = [
  { id: 'impressions', label: 'Impressões', category: 'Alcance' },
  { id: 'clicks', label: 'Cliques', category: 'Alcance' },
  { id: 'ctr', label: 'CTR (%)', category: 'Alcance' },
  { id: 'cpc', label: 'CPC (R$)', category: 'Custo' },
  { id: 'total_spent', label: 'Gasto Total (R$)', category: 'Custo' },
  { id: 'conversions', label: 'Conversões', category: 'Performance' },
  { id: 'conversion_rate', label: 'Taxa de Conversão (%)', category: 'Performance' },
  { id: 'roas', label: 'ROAS', category: 'Performance' },
  { id: 'cost_per_conversion', label: 'Custo por Conversão (R$)', category: 'Performance' },
];

const frequencies = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

const weekDays = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export function ReportsBuilder() {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    metrics: [] as string[],
    message_template: 'Olá! Aqui está o relatório de performance das suas campanhas:\n\n{metrics}\n\nQualquer dúvida, estou à disposição!',
    frequency: 'weekly' as ReportConfig['frequency'],
    send_time: '09:00',
    send_days: [1, 2, 3, 4, 5] as number[],
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setClients([
      { id: '1', name: 'Cliente A', whatsapp_number: '+5511999999999' },
      { id: '2', name: 'Cliente B', whatsapp_number: '+5511888888888' },
      { id: '3', name: 'Cliente C' },
    ]);

    setReports([
      {
        id: '1',
        name: 'Relatório Semanal - Cliente A',
        client_id: '1',
        client_name: 'Cliente A',
        metrics: ['impressions', 'clicks', 'ctr', 'total_spent', 'conversions', 'roas'],
        message_template: 'Olá! Segue o relatório semanal:\n\n{metrics}\n\nAbraços!',
        frequency: 'weekly',
        send_time: '09:00',
        send_days: [1, 3, 5],
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.client_id || formData.metrics.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const client = clients.find(c => c.id === formData.client_id);
      
      const reportData: ReportConfig = {
        id: editingReport?.id || Math.random().toString(36).substr(2, 9),
        name: formData.name,
        client_id: formData.client_id,
        client_name: client?.name || '',
        metrics: formData.metrics,
        message_template: formData.message_template,
        frequency: formData.frequency,
        send_time: formData.send_time,
        send_days: formData.send_days,
        is_active: false,
        created_at: editingReport?.created_at || new Date().toISOString(),
      };

      if (editingReport) {
        setReports(prev => prev.map(r => r.id === editingReport.id ? reportData : r));
        toast({
          title: "Relatório atualizado",
          description: "As configurações foram salvas com sucesso.",
        });
      } else {
        setReports(prev => [...prev, reportData]);
        toast({
          title: "Relatório criado",
          description: "O relatório foi configurado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingReport(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      metrics: [],
      message_template: 'Olá! Aqui está o relatório de performance das suas campanhas:\n\n{metrics}\n\nQualquer dúvida, estou à disposição!',
      frequency: 'weekly',
      send_time: '09:00',
      send_days: [1, 2, 3, 4, 5],
    });
  };

  const editReport = (report: ReportConfig) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      client_id: report.client_id,
      metrics: report.metrics,
      message_template: report.message_template,
      frequency: report.frequency,
      send_time: report.send_time,
      send_days: report.send_days,
    });
    setIsDialogOpen(true);
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: "Relatório removido",
      description: "O relatório foi removido com sucesso.",
    });
  };

  const toggleReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const client = clients.find(c => c.id === report.client_id);
    
    if (!client?.whatsapp_number && !report.is_active) {
      toast({
        title: "Erro",
        description: "Cliente não possui WhatsApp configurado.",
        variant: "destructive",
      });
      return;
    }

    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, is_active: !r.is_active } : r
    ));

    toast({
      title: report.is_active ? "Relatório pausado" : "Relatório ativado",
      description: `O envio automático foi ${report.is_active ? 'pausado' : 'ativado'}.`,
    });
  };

  const sendTestReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Simulate sending test report
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Teste enviado",
        description: "Relatório de teste enviado para o WhatsApp do cliente.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o teste.",
        variant: "destructive",
      });
    }
  };

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      send_days: prev.send_days.includes(day)
        ? prev.send_days.filter(d => d !== day)
        : [...prev.send_days, day]
    }));
  };

  const getFrequencyLabel = (frequency: string) => {
    return frequencies.find(f => f.value === frequency)?.label || frequency;
  };

  const getSelectedMetricsDisplay = (metrics: string[]) => {
    return metrics.map(id => 
      availableMetrics.find(m => m.id === id)?.label
    ).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Automáticos</h2>
          <p className="text-muted-foreground">
            Configure relatórios personalizados para envio via WhatsApp
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingReport(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Editar Relatório' : 'Criar Novo Relatório'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Relatório *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Relatório Semanal - Cliente X"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_id">Cliente *</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{client.name}</span>
                              {!client.whatsapp_number && (
                                <Badge variant="outline" className="ml-2">Sem WhatsApp</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message_template">Modelo da Mensagem</Label>
                    <Textarea
                      id="message_template"
                      value={formData.message_template}
                      onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                      placeholder="Personalize a mensagem que será enviada..."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{metrics}'} no texto para inserir automaticamente as métricas selecionadas.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div className="space-y-4">
                    <Label>Métricas a Incluir *</Label>
                    {Object.entries(
                      availableMetrics.reduce((acc, metric) => {
                        if (!acc[metric.category]) acc[metric.category] = [];
                        acc[metric.category].push(metric);
                        return acc;
                      }, {} as Record<string, typeof availableMetrics>)
                    ).map(([category, metrics]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {metrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={metric.id}
                                checked={formData.metrics.includes(metric.id)}
                                onCheckedChange={() => handleMetricToggle(metric.id)}
                              />
                              <Label htmlFor={metric.id} className="text-sm">
                                {metric.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        frequency: value as ReportConfig['frequency'],
                        send_days: value === 'daily' ? [1,2,3,4,5,6,0] : value === 'weekly' ? [1] : [1]
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(freq => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="send_time">Horário de Envio</Label>
                    <Input
                      id="send_time"
                      type="time"
                      value={formData.send_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, send_time: e.target.value }))}
                    />
                  </div>

                  {formData.frequency !== 'monthly' && (
                    <div className="space-y-2">
                      <Label>Dias da Semana</Label>
                      <div className="flex gap-2">
                        {weekDays.map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={formData.send_days.includes(day.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDayToggle(day.value)}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : (editingReport ? "Atualizar" : "Criar Relatório")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatórios Configurados ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Métricas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const client = clients.find(c => c.id === report.client_id);
                
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {report.client_name}
                        {!client?.whatsapp_number && (
                          <Badge variant="outline" className="text-xs">
                            Sem WhatsApp
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {getFrequencyLabel(report.frequency)} - {report.send_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {getSelectedMetricsDisplay(report.metrics)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={report.is_active}
                          onCheckedChange={() => toggleReport(report.id)}
                          disabled={!client?.whatsapp_number}
                        />
                        {report.is_active ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Pausado</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTestReport(report.id)}
                          disabled={!client?.whatsapp_number}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editReport(report)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {reports.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum relatório configurado</h3>
              <p className="text-muted-foreground">
                Crie seu primeiro relatório automático para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}